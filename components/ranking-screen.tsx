'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Globe, Info, Medal, Users } from 'lucide-react'
import { ScreenHeader } from '@/components/screen-header'
import { AthleteAvatar } from '@/components/athlete-avatar'
import {
  Badge,
  Card,
  Segmented,
  Skeleton,
  VerificationBadge,
  useDelayedReady,
} from '@/components/ui/primitives'
import { ATHLETES, useStore } from '@/components/store'
import { buildRanking, type RankingEntry } from '@/lib/ranking'
import { EVENTS, getEvent } from '@/lib/events'
import { CURRENT_ATHLETE_ID } from '@/lib/sample-data'
import { cn } from '@/lib/utils'
import type { Category, Scope, Sex } from '@/lib/types'

const SCOPES: { value: Scope; label: string }[] = [
  { value: 'World', label: 'World' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Andalusia', label: 'Andalusia' },
  { value: 'Friends', label: 'Friends' },
]

const SEASONS = ['2026', '2025', 'All-time']
const CATEGORIES: (Category | 'all')[] = ['all', 'U12', 'U14', 'U16', 'U18', 'U20', 'U23', 'Senior', 'Master']

export function RankingScreen() {
  const ready = useDelayedReady()
  const { results } = useStore()

  const [scope, setScope] = useState<Scope>('Andalusia')
  const [sex, setSex] = useState<Sex>('F')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [eventId, setEventId] = useState('100m')
  const [season, setSeason] = useState('2026')

  const entries = useMemo(
    () => buildRanking(results, ATHLETES, scope, { sex, category, eventId, season }),
    [results, scope, sex, category, eventId, season],
  )

  const event = getEvent(eventId)

  return (
    <div>
      <ScreenHeader title="Rankings" subtitle={`${event?.name} · ${season}`} />

      {/* Scope toggle strip */}
      <div className="sticky top-[57px] z-10 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {SCOPES.map((s) => {
            const active = s.value === scope
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setScope(s.value)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {s.value === 'World' ? (
                  <Globe className="size-3.5" />
                ) : s.value === 'Friends' ? (
                  <Users className="size-3.5" />
                ) : (
                  <Medal className="size-3.5" />
                )}
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 px-4 py-4">
        <Segmented
          size="sm"
          options={[
            { value: 'F', label: 'Women' },
            { value: 'M', label: 'Men' },
          ]}
          value={sex}
          onChange={setSex}
        />
        <div className="flex gap-2">
          <FilterSelect
            label="Event"
            value={eventId}
            onChange={setEventId}
            options={EVENTS.map((e) => ({ value: e.id, label: e.name }))}
          />
          <FilterSelect
            label="Category"
            value={category}
            onChange={(v) => setCategory(v as Category | 'all')}
            options={CATEGORIES.map((c) => ({
              value: c,
              label: c === 'all' ? 'All ages' : c,
            }))}
          />
          <FilterSelect
            label="Season"
            value={season}
            onChange={setSeason}
            options={SEASONS.map((s) => ({ value: s, label: s }))}
          />
        </div>
      </div>

      {/* List */}
      <div className="px-4 pb-6">
        {!ready ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyScope scope={scope} onSwitch={() => setScope('Andalusia')} />
        ) : (
          <RankingList entries={entries} eventUnit={event?.unit ?? ''} />
        )}
      </div>
    </div>
  )
}

function RankingList({
  entries,
  eventUnit,
}: {
  entries: RankingEntry[]
  eventUnit: string
}) {
  const hasTie = entries.some((e) => e.tied)
  return (
    <div>
      <div key={entries.map((e) => e.athlete.id).join('-')} className="animate-slide-in space-y-2">
        {entries.map((entry) => (
          <RankingRow key={entry.athlete.id} entry={entry} eventUnit={eventUnit} />
        ))}
      </div>
      {hasTie && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Tied marks share a position. Ties are broken by wind-legal performance and date at
          official meets.
        </p>
      )}
    </div>
  )
}

function RankingRow({ entry, eventUnit }: { entry: RankingEntry; eventUnit: string }) {
  const { athlete, best, position, tied, isCurrent } = entry
  const medalColor =
    position === 1
      ? 'text-gold'
      : position === 2
        ? 'text-muted-foreground'
        : position === 3
          ? 'text-chart-5'
          : 'text-muted-foreground'

  return (
    <Card
      className={cn(
        'flex items-center gap-3 p-3',
        isCurrent && 'border-primary bg-primary/10 shadow-[0_0_0_1px_var(--primary),0_0_24px_-6px_var(--primary)]',
      )}
    >
      <div className="flex w-8 shrink-0 flex-col items-center">
        <span className={cn('font-display text-lg font-bold leading-none', medalColor)}>
          {position}
        </span>
        {tied && <span className="mt-0.5 text-[9px] font-semibold uppercase text-muted-foreground">tie</span>}
      </div>

      <AthleteAvatar athlete={athlete} className="size-10 shrink-0 text-xs" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-pretty">{athlete.fullName}</p>
          {isCurrent && <Badge className="bg-primary/20 text-primary">You</Badge>}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {athlete.category}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-base font-bold tabular-nums">
          {best.markLabel}
          <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">{eventUnit}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {best.waPoints} pts
          </span>
          <VerificationBadge status={best.status} showLabel={false} />
        </div>
      </div>
    </Card>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="flex-1">
      <span className="sr-only">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="w-full appearance-none rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground outline-none transition-colors focus:border-primary"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  )
}

function EmptyScope({ scope, onSwitch }: { scope: Scope; onSwitch: () => void }) {
  const me = ATHLETES.find((a) => a.id === CURRENT_ATHLETE_ID)!
  const isFriends = scope === 'Friends'
  return (
    <Card className="flex flex-col items-center gap-3 p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        {isFriends ? <Users className="size-7" /> : <Medal className="size-7" />}
      </span>
      <div>
        <p className="font-display text-lg font-bold">
          {isFriends ? 'No friends ranked here yet' : 'No ranked athletes'}
        </p>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          {isFriends
            ? `None of ${me.fullName.split(' ')[0]}'s friends have a mark in this event and season. Invite teammates or switch scope.`
            : 'No athletes match these filters. Try a different event, category, or season.'}
        </p>
      </div>
      <div className="flex gap-2">
        {isFriends && (
          <Link
            href="/compete"
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Invite friends
          </Link>
        )}
        <button
          type="button"
          onClick={onSwitch}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/30"
        >
          Switch to Andalusia
        </button>
      </div>
    </Card>
  )
}
