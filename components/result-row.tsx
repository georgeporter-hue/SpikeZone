import { Wind } from 'lucide-react'
import { Badge, VerificationBadge } from '@/components/ui/primitives'
import { getEvent } from '@/lib/events'
import { cn } from '@/lib/utils'
import type { Result } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function ResultRow({
  result,
  showEvent = false,
  className,
}: {
  result: Result
  showEvent?: boolean
  className?: string
}) {
  const event = getEvent(result.eventId)
  return (
    <div className={cn('flex items-center justify-between gap-3 py-3', className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-semibold tabular-nums">
            {result.markLabel}
            <span className="ml-0.5 text-xs font-normal text-muted-foreground">
              {result.unit}
            </span>
          </span>
          {result.isPB && (
            <Badge className="bg-primary/15 text-primary">PB</Badge>
          )}
          {result.isSB && !result.isPB && (
            <Badge className="bg-gold/20 text-gold">SB</Badge>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {showEvent && event && (
            <span className="font-medium text-foreground">{event.name}</span>
          )}
          <span className="truncate">{result.competition}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(result.date)}</span>
          <span className="inline-flex items-center gap-0.5">
            <Wind className="size-3" aria-hidden />
            {result.wind === null ? 'N/A' : `${result.wind > 0 ? '+' : ''}${result.wind.toFixed(1)}`}
          </span>
        </div>
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
