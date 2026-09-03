import { getEvent } from './events'
import { CURRENT_ATHLETE_ID } from './sample-data'
import type { Athlete, Category, Result, Scope, Sex } from './types'

export interface RankingFilters {
  sex: Sex
  category: Category | 'all'
  eventId: string
  season: string // '2026' | '2025' | 'All-time'
}

export interface RankingEntry {
  position: number
  tied: boolean
  athlete: Athlete
  best: Result
  isCurrent: boolean
}

function inScope(athlete: Athlete, scope: Scope, me: Athlete): boolean {
  switch (scope) {
    case 'World':
      return true
    case 'Spain':
      return athlete.country === 'Spain'
    case 'Andalusia':
      return athlete.region === 'Andalusia'
    case 'Friends':
      return athlete.id === me.id || me.friendIds.includes(athlete.id)
    default:
      return true
  }
}

export function buildRanking(
  results: Result[],
  athletes: Athlete[],
  scope: Scope,
  filters: RankingFilters,
): RankingEntry[] {
  const event = getEvent(filters.eventId)
  const me = athletes.find((a) => a.id === CURRENT_ATHLETE_ID)!
  if (!event) return []

  const lowerIsBetter = event.lowerIsBetter

  const eligible = athletes.filter(
    (a) =>
      inScope(a, scope, me) &&
      a.sex === filters.sex &&
      (filters.category === 'all' || a.category === filters.category),
  )

  const entries: { athlete: Athlete; best: Result }[] = []
  for (const athlete of eligible) {
    let pool = results.filter(
      (r) => r.athleteId === athlete.id && r.eventId === filters.eventId,
    )
    if (filters.season !== 'All-time') {
      pool = pool.filter((r) => new Date(r.date).getFullYear() === Number(filters.season))
    }
    if (pool.length === 0) continue
    let best = pool[0]
    for (const r of pool) {
      if (lowerIsBetter ? r.markValue < best.markValue : r.markValue > best.markValue) best = r
    }
    entries.push({ athlete, best })
  }

  entries.sort((a, b) =>
    lowerIsBetter
      ? a.best.markValue - b.best.markValue
      : b.best.markValue - a.best.markValue,
  )

  // Assign positions with tie handling (identical marks share a position).
  const ranked: RankingEntry[] = []
  let position = 0
  let lastMark: number | null = null
  entries.forEach((e, i) => {
    const isTieWithPrev = lastMark !== null && e.best.markValue === lastMark
    if (!isTieWithPrev) position = i + 1
    const isTieWithNext =
      i < entries.length - 1 && entries[i + 1].best.markValue === e.best.markValue
    ranked.push({
      position,
      tied: isTieWithPrev || isTieWithNext,
      athlete: e.athlete,
      best: e.best,
      isCurrent: e.athlete.id === me.id,
    })
    lastMark = e.best.markValue
  })

  return ranked
}
