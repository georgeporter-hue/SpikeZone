'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  Clock,
  Flame,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { ScreenHeader } from '@/components/screen-header'
import { ScoreRing } from '@/components/score-ring'
import { ResultRow } from '@/components/result-row'
import {
  Badge,
  Card,
  ProgressBar,
  RarityTag,
  Skeleton,
  useDelayedReady,
} from '@/components/ui/primitives'
import { ATHLETES, getAthlete, useMyResults, useStore } from '@/components/store'
import { buildRanking } from '@/lib/ranking'
import { getEvent } from '@/lib/events'
import { CURRENT_ATHLETE_ID } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

const ACHIEVEMENT_ICONS = {
  zap: Sparkles,
  flame: Flame,
  'badge-check': Trophy,
  target: Trophy,
  timer: Clock,
  trophy: Trophy,
  medal: Trophy,
} as const

export function HomeScreen() {
  const router = useRouter()
  const ready = useDelayedReady()
  const me = getAthlete(CURRENT_ATHLETE_ID)!
  const myResults = useMyResults()
  const { spike, settings, lastAddedId, results, achievements, challenges } = useStore()

  const latest = myResults[0]
  const lastAdded = results.find((r) => r.id === lastAddedId)
  const showDelayBanner =
    lastAdded?.status === 'quick' && settings.liveDelayEnabled && lastAdded.athleteId === me.id

  // Top personal bests (best per event by points)
  const pbByEvent = new Map<string, (typeof myResults)[number]>()
  for (const r of myResults) {
    const cur = pbByEvent.get(r.eventId)
    if (!cur || r.waPoints > cur.waPoints) pbByEvent.set(r.eventId, r)
  }
  const topPBs = Array.from(pbByEvent.values())
    .sort((a, b) => b.waPoints - a.waPoints)
    .slice(0, 3)

  // Current event ranking snapshot: Andalusia 100m
  const snapshot = buildRanking(results, ATHLETES, 'Andalusia', {
    sex: me.sex,
    category: 'all',
    eventId: '100m',
    season: '2026',
  })
  const myRank = snapshot.find((e) => e.isCurrent)

  const recentAchievements = achievements
    .filter((a) => a.state !== 'locked')
    .slice(0, 3)
  const activeChallenges = challenges.filter((c) => c.status === 'active').slice(0, 2)

  const isEmpty = myResults.length === 0

  return (
    <div>
      <ScreenHeader />

      <div className="space-y-5 px-4 py-5">
        {/* Welcome */}
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Nice work, {me.fullName.split(' ')[0]}.
          </h2>
          {!ready ? (
            <Skeleton className="mt-1 h-4 w-56" />
          ) : latest?.isPB ? (
            <p className="mt-1 text-pretty text-sm text-primary">
              New PB detected: {latest.markLabel} {latest.unit} in the {getEvent(latest.eventId)?.name}.
</p>
          ) : (
            <p className="mt-1 text-pretty text-sm text-muted-foreground">
              Log your next mark and keep the season rolling.
            </p>
          )}
        </div>

        {isEmpty ? (
          <EmptyHome onAdd={() => router.push('/add')} />
        ) : (
          <>
            {/* Delay banner */}
            {showDelayBanner && (
              <Card className="flex items-start gap-3 border-warning/30 bg-warning/10 p-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-warning" />
                <p className="text-xs text-warning">
                  Live-meet delay is on. Your self-logged mark will factor into your SPIKE
                  SCORE in about {settings.liveDelayMinutes} minutes.
                </p>
              </Card>
            )}

            {/* SPIKE SCORE */}
            <Card className="overflow-hidden">
              <Link
                href="/score"
                className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/30"
              >
                {!ready ? (
                  <Skeleton className="size-[132px] rounded-full" />
                ) : (
                  <ScoreRing score={spike.score} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Your standing
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-primary">
                        </span>
                      </div>
                    </div>
                    <p className="text-pretty text-xs text-muted-foreground">
                      Performance score based on your best results.
                    </p>
                  </div>
                </div>
              </Link>
            </Card>

            {/* Latest result */}
            {latest && (
              <section>
                <SectionTitle
                  title="Latest result"
                  href="/marks"
                  action="My marks"
                />
                <Card className="px-4">
                  <Link
                    href={`/marks/${latest.eventId}`}
                    className="block transition-colors hover:opacity-90"
                  >
                    <ResultRow result={latest} showEvent />
                  </Link>
                </Card>
              </section>
            )}

            {/* PB stats */}
            {topPBs.length > 0 && (
              <section>
                <SectionTitle title="Personal bests" href="/marks" action="All" />
                <div className="grid grid-cols-3 gap-2">
                  {topPBs.map((r) => {
                    const event = getEvent(r.eventId)
                    return (
                      <Card key={r.eventId} className="p-3">
                        <p className="truncate text-[11px] font-medium text-muted-foreground">
                          {event?.name}
                        </p>
                        <p className="mt-1 font-mono text-lg font-bold tabular-nums">
                          {r.markLabel}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {r.unit}
                          </span>
                        </p>
                        <p className="mt-0.5 text-[10px] text-primary">{r.waPoints} pts</p>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Ranking snapshot */}
            <section>
              <SectionTitle title="Where you stand" href="/ranking" action="Rankings" />
              <Card className="p-4">
                <Link href="/ranking" className="flex items-center gap-3">
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/15">
                    <span className="font-display text-lg font-bold leading-none text-primary">
                      {myRank ? `#${myRank.position}` : '—'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">100m · Andalusia</p>
                    <p className="text-xs text-muted-foreground">
                      {myRank
                        ? `Best ${myRank.best.markLabel}${myRank.best.unit} · ${myRank.best.waPoints} pts`
                        : 'No ranked mark yet'}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </Card>
            </section>

            {/* Achievements */}
            <section>
              <SectionTitle
                title="Recent achievements"
                href="/achievements"
                action="Gallery"
              />
              <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                {recentAchievements.map((a) => {
                  const Icon = ACHIEVEMENT_ICONS[a.icon as keyof typeof ACHIEVEMENT_ICONS] ?? Trophy
                  return (
                    <Link
                      key={a.id}
                      href="/achievements"
                      className="w-40 shrink-0"
                    >
                      <Card className="h-full p-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              'flex size-9 items-center justify-center rounded-lg',
                              a.state === 'unlocked'
                                ? 'bg-gold/20 text-gold'
                                : 'bg-secondary text-muted-foreground',
                            )}
                          >
                            <Icon className="size-5" />
                          </span>
                          <RarityTag rarity={a.rarity} />
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-tight text-pretty">
                          {a.title}
                        </p>
                        {a.state === 'in-progress' ? (
                          <div className="mt-2">
                            <ProgressBar value={a.progress ?? 0} className="h-1.5" />
                          </div>
                        ) : (
                          <p className="mt-2 text-[11px] text-primary">Unlocked</p>
                        )}
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* Challenges */}
            <section>
              <SectionTitle title="Active challenges" href="/compete" action="Compete" />
              <div className="space-y-2">
                {activeChallenges.map((c) => (
                  <Link key={c.id} href="/compete">
                    <Card className="flex items-center gap-3 p-3 transition-colors hover:bg-secondary/30">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Flame className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{c.title}</p>
                          <Badge className="bg-secondary text-muted-foreground">
                            {c.daysLeft}d left
                          </Badge>
                        </div>
                        <div className="mt-1.5">
                          <ProgressBar value={c.progress} className="h-1.5" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function SectionTitle({
  title,
  href,
  action,
}: {
  title: string
  href?: string
  action?: string
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {href && action && (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-xs font-medium text-primary"
        >
          {action}
          <ChevronRight className="size-3" />
        </Link>
      )}
    </div>
  )
}

function EmptyHome({ onAdd }: { onAdd: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-3 p-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Sparkles className="size-7" />
      </span>
      <div>
        <p className="font-display text-lg font-bold">No marks yet</p>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Add your first result to unlock your SPIKE SCORE, rankings, and achievements.
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
