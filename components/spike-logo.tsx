import { cn } from '@/lib/utils'

export function SpikeLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('text-primary', className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M4 20 L13 4 L13 12 L20 12 L11 20 Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function SpikeWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <SpikeLogo className="size-5" />
      <span className="font-display text-lg font-bold tracking-tight">
        SPIKE<span className="text-primary">ZONE</span>
      </span>
    </span>
  )
}
