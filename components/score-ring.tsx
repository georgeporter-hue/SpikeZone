import { cn } from '@/lib/utils'

/** Circular gauge: the ring fill represents confidence, the center shows the score. */
export function ScoreRing({
  score,
  confidence,
  size = 132,
  className,
}: {
  score: number
  confidence?: number
  size?: number
  className?: string
}) {
  const stroke = size * 0.08
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = ((confidence ?? 100) / 100) * c

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-bold leading-none tracking-tight">
          {score}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Spike Score
        </span>
      </div>
    </div>
  )
}
