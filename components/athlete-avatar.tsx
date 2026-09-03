import { cn } from '@/lib/utils'
import type { Athlete } from '@/lib/types'

const PALETTE = [
  'bg-chart-3/25 text-chart-3',
  'bg-chart-4/25 text-chart-4',
  'bg-chart-5/25 text-chart-5',
  'bg-gold/25 text-gold',
  'bg-primary/20 text-primary',
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase()
}

function hashIndex(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % PALETTE.length
  return h
}

export function AthleteAvatar({
  athlete,
  className,
}: {
  athlete: Pick<Athlete, 'id' | 'fullName' | 'avatar'>
  className?: string
}) {
  const base = cn(
    'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border font-display font-semibold',
    className,
  )
  if (athlete.avatar) {
    return (
      <span className={base}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={athlete.avatar || '/placeholder.svg'}
          alt={athlete.fullName}
          className="h-full w-full object-cover"
        />
      </span>
    )
  }
  return (
    <span className={cn(base, PALETTE[hashIndex(athlete.id)])} aria-hidden>
      {initials(athlete.fullName)}
    </span>
  )
}
