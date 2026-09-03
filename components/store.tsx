'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { computeWaPoints, getEvent } from '@/lib/events'
import {
  ACHIEVEMENTS,
  ATHLETES,
  CHALLENGES,
  CURRENT_ATHLETE_ID,
  RESULTS,
  getAthlete,
} from '@/lib/sample-data'
import type { Result, VerificationStatus } from '@/lib/types'

const STORAGE_KEY = 'spikezone.results.v1'
const SETTINGS_KEY = 'spikezone.settings.v1'

export type CombinationMode = 'balanced' | 'verified-first' | 'latest'

interface Settings {
  combinationMode: CombinationMode
  liveDelayEnabled: boolean
  liveDelayMinutes: number
}

export interface AddResultInput {
  eventId: string
  markValue: number
  markLabel: string
  wind: number | null
  date: string
  competition: string
  verify: boolean // true = upload-for-verification, false = quick-publish
  fileUrl: string | null
}

interface SpikeBreakdown {
  score: number
  confidence: number
  verifiedBest: number
  allBest: number
  contributing: { eventId: string; points: number; verified: boolean }[]
}

interface StoreValue {
  ready: boolean
  results: Result[]
  settings: Settings
  lastAddedId: string | null
  currentAthleteId: string
  addResult: (input: AddResultInput) => Result
  simulateVerification: (id: string, status: VerificationStatus) => void
  setSettings: (partial: Partial<Settings>) => void
  resetDemo: () => void
  spike: SpikeBreakdown
  achievements: typeof ACHIEVEMENTS
  challenges: typeof CHALLENGES
}

const StoreContext = createContext<StoreValue | null>(null)

const DEFAULT_SETTINGS: Settings = {
  combinationMode: 'balanced',
  liveDelayEnabled: true,
  liveDelayMinutes: 15,
}

/** Recompute PB/SB flags for a given athlete + event across a result set. */
function recomputeFlags(results: Result[], athleteId: string, eventId: string): Result[] {
  const event = getEvent(eventId)
  if (!event) return results
  const relevant = results.filter((r) => r.athleteId === athleteId && r.eventId === eventId)
  if (relevant.length === 0) return results

  const better = (a: number, b: number) => (event.lowerIsBetter ? a < b : a > b)

  // Best overall (PB)
  let pbId = relevant[0].id
  for (const r of relevant) {
    const cur = relevant.find((x) => x.id === pbId)!
    if (better(r.markValue, cur.markValue)) pbId = r.id
  }

  // Best per season year (SB) — flag the best mark of the most recent year present
  const years = Array.from(new Set(relevant.map((r) => new Date(r.date).getFullYear())))
  const sbIds = new Set<string>()
  for (const year of years) {
    const inYear = relevant.filter((r) => new Date(r.date).getFullYear() === year)
    let best = inYear[0]
    for (const r of inYear) if (better(r.markValue, best.markValue)) best = r
    sbIds.add(best.id)
  }

  return results.map((r) => {
    if (r.athleteId !== athleteId || r.eventId !== eventId) return r
    return { ...r, isPB: r.id === pbId, isSB: sbIds.has(r.id) }
  })
}

function computeSpike(
  results: Result[],
  athleteId: string,
  mode: CombinationMode,
): SpikeBreakdown {
  const mine = results.filter((r) => r.athleteId === athleteId)

  const bestPerEvent = (subset: Result[]) => {
    const map = new Map<string, Result>()
    for (const r of subset) {
      const cur = map.get(r.eventId)
      if (!cur || r.waPoints > cur.waPoints) map.set(r.eventId, r)
    }
    return Array.from(map.values()).sort((a, b) => b.waPoints - a.waPoints)
  }

  const approved = mine.filter((r) => r.status === 'approved')
  const verifiedBestList = bestPerEvent(approved)
  const allBestList = bestPerEvent(mine)

  // Choose the pool according to combination rule
  let pool = allBestList
  if (mode === 'verified-first') {
    pool = verifiedBestList.length ? verifiedBestList : allBestList
  } else if (mode === 'latest') {
    // weight best marks but from the latest season only when available
    const latestYear = Math.max(
      0,
      ...mine.map((r) => new Date(r.date).getFullYear()),
    )
    const latest = bestPerEvent(mine.filter((r) => new Date(r.date).getFullYear() === latestYear))
    pool = latest.length ? latest : allBestList
  }

  const top3 = pool.slice(0, 3)
  const avg = top3.length ? top3.reduce((s, r) => s + r.waPoints, 0) / top3.length : 0
  const score = Math.round(avg * 0.905)

  const verifiedCount = top3.filter((r) => r.status === 'approved').length
  const ratio = top3.length ? verifiedCount / top3.length : 0
  const confidence = Math.max(0, Math.min(99, Math.round(50 + ratio * 42)))

  return {
    score,
    confidence,
    verifiedBest: verifiedBestList[0]?.waPoints ?? 0,
    allBest: allBestList[0]?.waPoints ?? 0,
    contributing: top3.map((r) => ({
      eventId: r.eventId,
      points: r.waPoints,
      verified: r.status === 'approved',
    })),
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [results, setResults] = useState<Result[]>(RESULTS)
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS)
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const idRef = useRef(1)

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Result[]
        if (Array.isArray(parsed) && parsed.length) setResults(parsed)
      }
      const rawSettings = localStorage.getItem(SETTINGS_KEY)
      if (rawSettings) {
        setSettingsState({ ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) })
      }
    } catch {
      // ignore malformed storage
    }
    setReady(true)
  }, [])

  // Persist results
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
    } catch {
      // ignore quota errors
    }
  }, [results, ready])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch {
      // ignore
    }
  }, [settings, ready])

  const addResult = useCallback(
    (input: AddResultInput): Result => {
      const athlete = getAthlete(CURRENT_ATHLETE_ID)!
      const status: VerificationStatus = input.verify ? 'pending' : 'quick'
      const id = `user-${Date.now()}-${idRef.current++}`
      const newResult: Result = {
        id,
        athleteId: CURRENT_ATHLETE_ID,
        eventId: input.eventId,
        markValue: input.markValue,
        markLabel: input.markLabel,
        unit: getEvent(input.eventId)?.unit ?? '',
        wind: input.wind,
        date: input.date,
        competition: input.competition,
        status,
        fileUrl: input.fileUrl,
        waPoints: computeWaPoints(input.eventId, athlete.sex, input.markValue),
        isPB: false,
        isSB: false,
        createdBy: 'self',
      }
      setResults((prev) => {
        const next = recomputeFlags([...prev, newResult], CURRENT_ATHLETE_ID, input.eventId)
        return next
      })
      setLastAddedId(id)
      return newResult
    },
    [],
  )

  const simulateVerification = useCallback((id: string, status: VerificationStatus) => {
    setResults((prev) => {
      const target = prev.find((r) => r.id === id)
      if (!target) return prev
      const updated = prev.map((r) => (r.id === id ? { ...r, status } : r))
      return recomputeFlags(updated, target.athleteId, target.eventId)
    })
  }, [])

  const setSettings = useCallback((partial: Partial<Settings>) => {
    setSettingsState((prev) => ({ ...prev, ...partial }))
  }, [])

  const resetDemo = useCallback(() => {
    setResults(RESULTS)
    setSettingsState(DEFAULT_SETTINGS)
    setLastAddedId(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(SETTINGS_KEY)
    } catch {
      // ignore
    }
  }, [])

  const spike = useMemo(
    () => computeSpike(results, CURRENT_ATHLETE_ID, settings.combinationMode),
    [results, settings.combinationMode],
  )

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      results,
      settings,
      lastAddedId,
      currentAthleteId: CURRENT_ATHLETE_ID,
      addResult,
      simulateVerification,
      setSettings,
      resetDemo,
      spike,
      achievements: ACHIEVEMENTS,
      challenges: CHALLENGES,
    }),
    [ready, results, settings, lastAddedId, addResult, simulateVerification, setSettings, resetDemo, spike],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

/** Results belonging to the current athlete, grouped/sorted helpers. */
export function useMyResults() {
  const { results, currentAthleteId } = useStore()
  return useMemo(
    () =>
      results
        .filter((r) => r.athleteId === currentAthleteId)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [results, currentAthleteId],
  )
}

export { ATHLETES, getAthlete }
