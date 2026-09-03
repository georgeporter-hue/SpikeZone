'use client'

import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  Clock,
  ShieldQuestion,
  XCircle,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Rarity, VerificationStatus } from '@/lib/types'

/* ---------------------------------- Card --------------------------------- */

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card text-card-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* --------------------------------- Badge --------------------------------- */

export function Badge({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/* --------------------------- Verification badge --------------------------- */

const VERIFICATION: Record<
  VerificationStatus,
  { label: string; className: string; Icon: typeof BadgeCheck }
> = {
  approved: {
    label: 'Verified',
    className: 'bg-primary/15 text-primary',
    Icon: BadgeCheck,
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/15 text-warning',
    Icon: Clock,
  },
  quick: {
    label: 'Self-logged',
    className: 'bg-muted text-muted-foreground',
    Icon: Zap,
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/15 text-destructive',
    Icon: XCircle,
  },
}

export function VerificationBadge({
  status,
  showLabel = true,
  className,
}: {
  status: VerificationStatus
  showLabel?: boolean
  className?: string
}) {
  const v = VERIFICATION[status] ?? {
    label: 'Unknown',
    className: 'bg-muted text-muted-foreground',
    Icon: ShieldQuestion,
  }
  const { label, className: cls, Icon } = v
  return (
    <Badge className={cn(cls, className)}>
      <Icon className="size-3" aria-hidden />
      {showLabel && <span>{label}</span>}
    </Badge>
  )
}

/* ------------------------------- Rarity tag ------------------------------- */

const RARITY: Record<Rarity, string> = {
  Common: 'bg-muted text-muted-foreground',
  Rare: 'bg-chart-3/20 text-chart-3',
  Epic: 'bg-chart-4/20 text-chart-4',
  Legendary: 'bg-gold/20 text-gold',
}

export function RarityTag({ rarity }: { rarity: Rarity }) {
  return (
    <Badge className={cn('uppercase tracking-wide', RARITY[rarity])}>{rarity}</Badge>
  )
}

/* ------------------------------- Progress -------------------------------- */

export function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number
  className?: string
  barClassName?: string
}) {
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full bg-primary transition-all duration-500', barClassName)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

/* ------------------------------ Segmented -------------------------------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
  size?: 'sm' | 'md'
}) {
  return (
    <div
      className={cn(
        'inline-flex w-full items-center gap-1 rounded-xl border border-border bg-secondary/40 p-1',
        className,
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-lg font-semibold transition-all',
              size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------- Skeleton -------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-secondary/60', className)} />
}

/** Shows a skeleton for a short moment on first mount to demo loading states. */
export function useDelayedReady(delay = 550) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return ready
}

/* ------------------------------- Sparkline ------------------------------- */

export function Sparkline({
  values,
  lowerIsBetter,
  className,
  width = 120,
  height = 40,
}: {
  values: number[]
  lowerIsBetter: boolean
  className?: string
  width?: number
  height?: number
}) {
  if (values.length < 2) {
    return (
      <div
        className={cn('flex items-center justify-center text-[10px] text-muted-foreground', className)}
        style={{ width, height }}
      >
        Not enough data
      </div>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 4
  const stepX = (width - pad * 2) / (values.length - 1)
  // For "lower is better" metrics we invert so that improvement always trends up.
  const points = values.map((v, i) => {
    const norm = (v - min) / range // 0..1
    const yNorm = lowerIsBetter ? norm : 1 - norm
    const y = pad + yNorm * (height - pad * 2)
    return `${pad + i * stepX},${y}`
  })
  const last = values[values.length - 1]
  const first = values[0]
  const improved = lowerIsBetter ? last < first : last > first
  const stroke = improved ? 'var(--primary)' : 'var(--muted-foreground)'

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Progress trend"
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => {
        const [cx, cy] = p.split(',').map(Number)
        const isLast = i === points.length - 1
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={isLast ? 3 : 1.8}
            fill={isLast ? stroke : 'var(--muted-foreground)'}
          />
        )
      })}
    </svg>
  )
}
