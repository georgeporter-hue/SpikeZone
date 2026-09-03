'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import { ScreenHeader } from '@/components/screen-header'
import {
  Badge,
  Card,
  Skeleton,
  Sparkline,
  VerificationBadge,
  useDelayedReady,
} from '@/components/ui/primitives'
import { useMyResults } from '@/components/store'
import { getEvent } from '@/lib/events'
import type { Result } from '@/lib/types'

interface EventGroup {
  eventId: string
  name: string
  lowerIsBetter: boolean
  unit: string
  pb: Result
  sb: Result | undefined
  history: Result[]
  trend: number[]
}

function groupByEvent(results: Result[]): EventGroup[] {
  const map = new Map<string, Result[]>()
  for (const r of results) {
    const arr = map.get(r.eventId) ?? []
    arr.push(r)
    map.set(r.eventId, arr)
  }
  const groups: EventGroup[] = []
  for (const [eventId, arr] of map) {
    const event = getEvent(eventId)
    if (!event) continue
    const pb = arr.find((r) => r.isPB) ?? arr[0]
    const sb = arr.find((r) => r.isSB)
    // history newest-first; trend chronological for the sparkline
    const history = [...arr].sort((a, b) => +new Date(b.date) - +new Date(a.date))
    const trend = [...arr]
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .map((r) => r.markValue)
    groups.push({
      eventId,
      name: event.name,
      lowerIsBetter: event.lowerIsBetter,
      unit: event.unit,
      pb,
      sb,
      history,
      trend,
    })
  }
  // Best event (highest PB points) first
  return groups.sort((a, b) => b.pb.waPoints - a.pb.waPoints)
}

export function MyMarksScreen() {
  const router = useRouter()
  const ready = useDelayedReady()
  const myResults = useMyResults()
  const groups = useMemo(() => groupByEvent(myResults), [myResults])

  return (
    <div>
      <ScreenHeader
        title="My Marks"
        subtitle={`${myResults.length} results · ${groups.length} events`}
        showProfile={false}
        right={
          <Link
            href="/add"
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" />
            Add
          </Link>
        }
      />

      <div className="space-y-3 px-4 py-5">
        {!ready ? (
          <>
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </>
        ) : groups.length === 0 ? (
          <EmptyMarks onAdd={() => router.push('/add')} />
        ) : (
          groups.map((g) => <EventCard key={g.eventId} group={g} />)
        )}
      </div>
    </div>
  )
}

function EventCard({ group }: { group: EventGroup }) {
  const { pb, sb } = group
  return (
    <Link href={`/marks/${group.eventId}`} className="block">
      <Card className="p-4 transition-colors hover:bg-secondary/20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-bold tracking-tight">{group.name}</h3>
              <VerificationBadge status={pb.status} showLabel={false} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {group.history.length} {group.history.length === 1 ? 'result' : 'results'} logged
            </p>
          </div>
          <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
        </div>

        <div className="mt-3 flex items-end justify-between gap-4">
          <div className="flex gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">PB</p>
              <p className="font-mono text-xl font-bold tabular-nums">
                {pb.markLabel}
                <span className="ml-0.5 text-xs font-normal text-muted-foreground">{group.unit}</span>
              </p>
              <p className="text-[10px] text-muted-foreground">{pb.waPoints} pts</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gold">SB</p>
              <p className="font-mono text-xl font-bold tabular-nums">
                {sb ? sb.markLabel : '—'}
                {sb && (
                  <span className="ml-0.5 text-xs font-normal text-muted-foreground">{group.unit}</span>
                )}
              </p>
              <p className="text-[10px] text-muted-foreground">{sb ? `${sb.waPoints} pts` : 'No SB'}</p>
            </div>
          </div>
          <Sparkline
            values={group.trend}
            lowerIsBetter={group.lowerIsBetter}
            width={96}
            height={40}
          />
        </div>
      </Card>
    </Link>
  )
}

function EmptyMarks({ onAdd }: { onAdd: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-3 p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Plus className="size-7" />
      </span>
      <div>
        <p className="font-display text-lg font-bold">No marks logged</p>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          Record your first result to start tracking PBs, season bests, and progress.
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        + Add your first result
      </button>
    </Card>
  )
}

export function EventHistory({ eventId }: { eventId: string }) {
  const myResults = useMyResults()
  const event = getEvent(eventId)
  const results = useMemo(
    () => myResults.filter((r) => r.eventId === eventId),
    [myResults, eventId],
  )

  if (!event) {
    return (
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">
        Unknown event.
        <div className="mt-3">
          <Link href="/marks" className="text-primary">
            Back to My Marks
          </Link>
        </div>
      </div>
    )
  }

  const trend = [...results]
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .map((r) => r.markValue)
  const pb = results.find((r) => r.isPB)

  return (
    <div>
      <ScreenHeader
        title={event.name}
        subtitle={`${results.length} results`}
        back
        showProfile={false}
        right={
          <Link
            href="/add"
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" />
            Add
          </Link>
        }
      />

      <div className="space-y-4 px-4 py-5">
        {results.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No results for this event yet.
          </Card>
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Personal best
                  </p>
                  <p className="font-mono text-3xl font-bold tabular-nums">
                    {pb?.markLabel}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {event.unit}
                    </span>
                  </p>
                  {pb && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {pb.waPoints} WA points · {pb.competition}
                    </p>
                  )}
                </div>
                <Sparkline
                  values={trend}
                  lowerIsBetter={event.lowerIsBetter}
                  width={130}
                  height={56}
                />
              </div>
            </Card>

            <div>
              <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                History
              </h3>
              <Card className="divide-y divide-border px-4">
                {results.map((r) => (
                  <HistoryRow key={r.id} result={r} unit={event.unit} />
                ))}
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function HistoryRow({ result, unit }: { result: Result; unit: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-semibold tabular-nums">
            {result.markLabel}
            <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>
          </span>
          {result.isPB && <Badge className="bg-primary/15 text-primary">PB</Badge>}
          {result.isSB && !result.isPB && <Badge className="bg-gold/20 text-gold">SB</Badge>}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {result.competition} ·{' '}
          {new Date(result.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}{' '}
          · wind {result.wind === null ? 'N/A' : `${result.wind > 0 ? '+' : ''}${result.wind.toFixed(1)}`}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-sm font-semibold text-primary tabular-nums">
          {result.waPoints}
          <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">pts</span>
        </span>
        <VerificationBadge status={result.status} showLabel={false} />
      </div>
    </div>
  )
}
