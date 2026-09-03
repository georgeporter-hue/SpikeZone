'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  BadgeCheck,
  Check,
  ChevronRight,
  FileCheck2,
  FileUp,
  Pencil,
  Trophy,
  Wind,
  Zap,
} from 'lucide-react'
import { ScreenHeader } from '@/components/screen-header'
import {
  Badge,
  Card,
  ProgressBar,
  VerificationBadge,
} from '@/components/ui/primitives'
import { AthleteAvatar } from '@/components/athlete-avatar'
import { getAthlete, useMyResults, useStore } from '@/components/store'
import { EVENTS, computeWaPoints, getEvent, parseMark } from '@/lib/events'
import { CURRENT_ATHLETE_ID } from '@/lib/sample-data'
import { cn } from '@/lib/utils'
import type { Result } from '@/lib/types'

type Kind = 'track' | 'field'
type Step = 'kind' | 'event' | 'details' | 'publish' | 'review' | 'submitting' | 'done'

const STEP_ORDER: Step[] = ['kind', 'event', 'details', 'publish', 'review']

const MAX_FILE_MB = 8
const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg']

export function AddResultScreen() {
  const router = useRouter()
  const { addResult, settings } = useStore()
  const me = getAthlete(CURRENT_ATHLETE_ID)!
  const myResults = useMyResults()

  const [step, setStep] = useState<Step>('kind')
  const [kind, setKind] = useState<Kind | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [markRaw, setMarkRaw] = useState('')
  const [wind, setWind] = useState('')
  const [noWind, setNoWind] = useState(false)
  const [date, setDate] = useState('2026-06-20')
  const [competition, setCompetition] = useState('')
  const [verify, setVerify] = useState(true)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [markError, setMarkError] = useState<string | null>(null)
  const [meetError, setMeetError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<Result | null>(null)

  const event = eventId ? getEvent(eventId) : null
  const parsed = event && markRaw ? parseMark(event.id, markRaw) : null

  const projectedPoints = useMemo(() => {
    if (!event || !parsed) return 0
    return computeWaPoints(event.id, me.sex, parsed.value)
  }, [event, parsed, me.sex])

  // Project PB/SB against existing marks for this event
  const projection = useMemo(() => {
    if (!event || !parsed) return { isPB: false, isSB: false }
    const relevant = myResults.filter((r) => r.eventId === event.id)
    const better = (a: number, b: number) =>
      event.lowerIsBetter ? a < b : a > b
    const isPB =
      relevant.length === 0 ||
      relevant.every((r) => better(parsed.value, r.markValue))
    const thisYear = new Date(date).getFullYear()
    const inYear = relevant.filter((r) => new Date(r.date).getFullYear() === thisYear)
    const isSB =
      inYear.length === 0 || inYear.every((r) => better(parsed.value, r.markValue))
    return { isPB, isSB }
  }, [event, parsed, myResults, date])

  const eventsForKind = EVENTS.filter((e) => e.kind === kind)

  function validateDetails(): boolean {
    let ok = true
    if (!parsed) {
      setMarkError(
        event?.kind === 'field'
          ? 'Enter a distance like 6.42'
          : 'Enter a time like 11.45 or 1:46.30',
      )
      ok = false
    } else {
      setMarkError(null)
    }
    if (!competition.trim()) {
      setMeetError('Competition name is required')
      ok = false
    } else {
      setMeetError(null)
    }
    return ok
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      setFileError('Unsupported type. Upload a PDF, PNG, or JPG.')
      setFileName(null)
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`File too large. Max ${MAX_FILE_MB} MB.`)
      setFileName(null)
      return
    }
    setFileError(null)
    setFileName(file.name)
  }

  function submit() {
    if (!event || !parsed) return
    setStep('submitting')
    setTimeout(() => {
      const result = addResult({
        eventId: event.id,
        markValue: parsed.value,
        markLabel: parsed.label,
        wind: noWind || event.kind === 'field' ? null : Number.parseFloat(wind || '0'),
        date,
        competition: competition.trim(),
        verify,
        fileUrl: verify && fileName ? `sample://${fileName}` : null,
      })
      setSubmitted(result)
      setStep('done')
    }, 1600)
  }

  const stepIndex = STEP_ORDER.indexOf(step)
  const progressPct =
    step === 'done' ? 100 : step === 'submitting' ? 92 : ((stepIndex + 1) / STEP_ORDER.length) * 100

  if (step === 'done' && submitted) {
    return (
      <ResultSubmitted
        result={submitted}
        delayed={verify || (settings.liveDelayEnabled && !verify)}
        verify={verify}
        delayMinutes={settings.liveDelayMinutes}
        onViewMark={() => router.push(`/marks/${submitted.eventId}`)}
        onEdit={() => {
          setSubmitted(null)
          setStep('review')
        }}
        onHome={() => router.push('/')}
      />
    )
  }

  return (
    <div>
      <ScreenHeader
        title="Add Result"
        subtitle={
          step === 'submitting'
            ? 'Submitting…'
            : `Step ${Math.min(stepIndex + 1, STEP_ORDER.length)} of ${STEP_ORDER.length}`
        }
        back
        showProfile={false}
      />
      <div className="px-4 pt-3">
        <ProgressBar value={progressPct} className="h-1.5" />
      </div>

      <div className="px-4 py-5">
        {step === 'kind' && (
          <StepShell title="What did you compete in?" hint="Pick a discipline to start.">
            <div className="grid grid-cols-2 gap-3">
              {(['track', 'field'] as Kind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setKind(k)
                    setEventId(null)
                    setStep('event')
                  }}
                  className={cn(
                    'flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-colors',
                    kind === k
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:bg-secondary/30',
                  )}
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    {k === 'track' ? <Zap className="size-6" /> : <Trophy className="size-6" />}
                  </span>
                  <div>
                    <p className="font-display text-base font-bold capitalize">{k}</p>
                    <p className="text-xs text-muted-foreground">
                      {k === 'track' ? 'Sprints, hurdles, distance' : 'Jumps & throws'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 'event' && (
          <StepShell
            title="Which event?"
            hint="Choose the specific event you want to log."
          >
            <div className="grid grid-cols-2 gap-2">
              {eventsForKind.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    setEventId(e.id)
                    setMarkRaw('')
                    setMarkError(null)
                    setStep('details')
                  }}
                  className={cn(
                    'rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors',
                    eventId === e.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:bg-secondary/30',
                  )}
                >
                  {e.name}
                </button>
              ))}
            </div>
            <BackLink onClick={() => setStep('kind')} label="Back to discipline" />
          </StepShell>
        )}

        {step === 'details' && event && (
          <StepShell
            title={`Log your ${event.name}`}
            hint={
              event.kind === 'field'
                ? 'Enter the distance in metres.'
                : 'Enter the time — seconds (11.45) or minutes (1:46.30).'
            }
          >
            <div className="space-y-4">
              <Field label={`Mark (${event.unit})`} error={markError}>
                <input
                  inputMode="decimal"
                  value={markRaw}
                  onChange={(e) => {
                    setMarkRaw(e.target.value)
                    if (markError) setMarkError(null)
                  }}
                  placeholder={event.kind === 'field' ? 'e.g. 6.42' : 'e.g. 11.45'}
                  className={inputCls(!!markError)}
                />
                {parsed && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-primary">
                    <Check className="size-3.5" />
                    Reads as {parsed.label}
                    {event.unit} · projected {projectedPoints} WA pts
                  </p>
                )}
              </Field>

              {event.kind === 'track' && (
                <Field label="Wind (m/s)">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Wind className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        inputMode="decimal"
                        value={wind}
                        disabled={noWind}
                        onChange={(e) => setWind(e.target.value)}
                        placeholder="+1.2"
                        className={cn(inputCls(false), 'pl-9', noWind && 'opacity-40')}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setNoWind((v) => !v)}
                      className={cn(
                        'rounded-xl border px-3 py-3 text-xs font-semibold transition-colors',
                        noWind
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:text-foreground',
                      )}
                    >
                      N/A
                    </button>
                  </div>
                </Field>
              )}

              <Field label="Date">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls(false)}
                />
              </Field>

              <Field label="Competition" error={meetError}>
                <input
                  value={competition}
                  onChange={(e) => {
                    setCompetition(e.target.value)
                    if (meetError) setMeetError(null)
                  }}
                  placeholder="e.g. Gran Premio Sevilla"
                  className={inputCls(!!meetError)}
                />
              </Field>
            </div>

            <div className="mt-6 flex gap-3">
              <SecondaryButton onClick={() => setStep('event')}>Back</SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  if (validateDetails()) setStep('publish')
                }}
              >
                Continue
              </PrimaryButton>
            </div>
          </StepShell>
        )}

        {step === 'publish' && event && (
          <StepShell
            title="How should we publish it?"
            hint="Verified marks build SPIKE SCORE confidence. Quick-publish appears instantly."
          >
            <div className="space-y-3">
              <PublishOption
                active={verify}
                onClick={() => setVerify(true)}
                icon={<BadgeCheck className="size-5" />}
                title="Upload for verification"
                desc="Attach federation proof. Shows a Pending badge until reviewed, then Verified."
              />
              <PublishOption
                active={!verify}
                onClick={() => setVerify(false)}
                icon={<Zap className="size-5" />}
                title="Quick-publish"
                desc="Post instantly as a self-logged mark. Counts now, lower confidence weight."
              />

              {verify && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Proof of performance
                  </p>
                  <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-4 transition-colors hover:border-primary/60">
                    <FileUp className="size-5 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {fileName ?? 'Attach result PDF or photo'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        PDF, PNG or JPG · max {MAX_FILE_MB} MB
                      </p>
                    </div>
                    {fileName && <Check className="size-4 text-primary" />}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={handleFile}
                    />
                  </label>
                  {fileError && (
                    <p className="mt-2 text-xs text-destructive">{fileError}</p>
                  )}
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    No file yet? You can still submit — we&apos;ll request proof during review.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <SecondaryButton onClick={() => setStep('details')}>Back</SecondaryButton>
              <PrimaryButton onClick={() => setStep('review')}>Review</PrimaryButton>
            </div>
          </StepShell>
        )}

        {step === 'review' && event && parsed && (
          <StepShell title="Review & submit" hint="Confirm the details before publishing.">
            <Card className="divide-y divide-border">
              <ReviewRow label="Event" value={event.name} />
              <ReviewRow
                label="Mark"
                value={`${parsed.label}${event.unit}`}
                badge={
                  projection.isPB ? (
                    <Badge className="bg-primary/15 text-primary">PB</Badge>
                  ) : projection.isSB ? (
                    <Badge className="bg-gold/20 text-gold">SB</Badge>
                  ) : undefined
                }
              />
              <ReviewRow
                label="Wind"
                value={
                  event.kind === 'field' || noWind
                    ? 'N/A'
                    : `${wind && Number.parseFloat(wind) > 0 ? '+' : ''}${wind || '0'} m/s`
                }
              />
              <ReviewRow
                label="Date"
                value={new Date(date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              />
              <ReviewRow label="Competition" value={competition} />
              <ReviewRow label="Projected points" value={`${projectedPoints} WA pts`} />
              <ReviewRow
                label="Publishing"
                value={verify ? 'Upload for verification' : 'Quick-publish'}
                badge={<VerificationBadge status={verify ? 'pending' : 'quick'} />}
              />
              {verify && (
                <ReviewRow label="Attachment" value={fileName ?? 'None yet'} />
              )}
            </Card>

            <div className="mt-6 flex gap-3">
              <SecondaryButton onClick={() => setStep('publish')}>Back</SecondaryButton>
              <PrimaryButton onClick={submit}>Submit result</PrimaryButton>
            </div>
          </StepShell>
        )}

        {step === 'submitting' && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="relative">
              <AthleteAvatar athlete={me} className="size-16 text-lg" />
              <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <FileCheck2 className="size-4" />
              </span>
            </div>
            <div>
              <p className="font-display text-lg font-bold">Publishing your mark…</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Calculating points and checking for a new PB.
              </p>
            </div>
            <div className="w-48">
              <ProgressBar value={progressPct} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* --------------------------- Result Submitted --------------------------- */

function ResultSubmitted({
  result,
  verify,
  delayMinutes,
  onViewMark,
  onEdit,
  onHome,
}: {
  result: Result
  delayed: boolean
  verify: boolean
  delayMinutes: number
  onViewMark: () => void
  onEdit: () => void
  onHome: () => void
}) {
  const me = getAthlete(CURRENT_ATHLETE_ID)!
  const event = getEvent(result.eventId)
  return (
    <div>
      <ScreenHeader title="Result submitted" back={false} showProfile={false} />
      <div className="space-y-5 px-4 py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Check className="size-8" />
          </span>
          <div>
            <h2 className="text-balance font-display text-2xl font-bold">
              Nice work, {me.fullName.split(' ')[0]}.
            </h2>
            <p className="mt-1 text-pretty text-sm text-muted-foreground">
              {result.isPB
                ? `New PB detected: ${result.markLabel}${result.unit} in the ${event?.name}`
                : result.isSB
                  ? `Season best logged: ${result.markLabel}${result.unit}`
                  : `${result.markLabel}${result.unit} logged in the ${event?.name}`}
              {verify ? ', pending verification.' : '.'}
            </p>
          </div>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-4xl font-bold tabular-nums">
                {result.markLabel}
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  {result.unit}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{event?.name}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {result.isPB && <Badge className="bg-primary/15 text-primary">New PB</Badge>}
              {result.isSB && !result.isPB && (
                <Badge className="bg-gold/20 text-gold">Season best</Badge>
              )}
              <VerificationBadge status={result.status} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="World Athletics points" value={`${result.waPoints}`} accent />
            <Stat
              label="Wind"
              value={
                result.wind === null
                  ? 'N/A'
                  : `${result.wind > 0 ? '+' : ''}${result.wind.toFixed(1)}`
              }
            />
          </div>
        </Card>

        <Card
          className={cn(
            'flex items-start gap-3 p-4',
            verify ? 'border-warning/30 bg-warning/10' : 'border-primary/30 bg-primary/10',
          )}
        >
          {verify ? (
            <>
              <BadgeCheck className="mt-0.5 size-5 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-semibold text-warning">Ranking update pending</p>
                <p className="mt-0.5 text-xs text-warning/90">
                  Your mark shows a Pending badge and will update rankings once a federation
                  verifies it. Track progress on the verification timeline.
                </p>
              </div>
            </>
          ) : (
            <>
              <Zap className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-primary">Live now</p>
                <p className="mt-0.5 text-xs text-primary/90">
                  Self-logged and instantly visible. It factors into your SPIKE SCORE in about{' '}
                  {delayMinutes} minutes to reduce live-meet volatility.
                </p>
              </div>
            </>
          )}
        </Card>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onViewMark}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
          >
            View mark
            <ChevronRight className="size-4" />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-secondary/30"
            >
              <Pencil className="size-4" />
              Edit
            </button>
            <Link
              href="/ranking"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-secondary/30"
            >
              See ranking
            </Link>
          </div>
          <button
            type="button"
            onClick={onHome}
            className="py-2 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- Bits ---------------------------------- */

function StepShell({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="text-balance font-display text-xl font-bold tracking-tight">{title}</h2>
      {hint && <p className="mt-1 text-pretty text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-5">{children}</div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string | null
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return cn(
    'w-full rounded-xl border bg-card px-3 py-3 font-mono text-base tabular-nums text-foreground outline-none transition-colors placeholder:font-sans placeholder:text-muted-foreground focus:border-primary',
    hasError ? 'border-destructive' : 'border-border',
  )
}

function PublishOption({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors',
        active ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-secondary/30',
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl',
          active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold">{title}</p>
          <span
            className={cn(
              'flex size-5 items-center justify-center rounded-full border',
              active ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
            )}
          >
            {active && <Check className="size-3" />}
          </span>
        </div>
        <p className="mt-0.5 text-pretty text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  )
}

function ReviewRow({
  label,
  value,
  badge,
}: {
  label: string
  value: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 text-right text-sm font-semibold">
        {badge}
        <span className="truncate">{value}</span>
      </span>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl bg-secondary/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 font-mono text-xl font-bold tabular-nums',
          accent && 'text-primary',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function PrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
    >
      {children}
    </button>
  )
}

function SecondaryButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/30"
    >
      {children}
    </button>
  )
}

function BackLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-5 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      ← {label}
    </button>
  )
}
