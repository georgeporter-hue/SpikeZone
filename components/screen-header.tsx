'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { AthleteAvatar } from '@/components/athlete-avatar'
import { SpikeWordmark } from '@/components/spike-logo'
import { getAthlete } from '@/lib/sample-data'
import { CURRENT_ATHLETE_ID } from '@/lib/sample-data'
import { cn } from '@/lib/utils'

/** Sticky top header. Either shows the wordmark (home) or a back button + title. */
export function ScreenHeader({
  title,
  subtitle,
  back,
  showProfile = true,
  right,
  className,
}: {
  title?: string
  subtitle?: string
  back?: boolean
  showProfile?: boolean
  right?: React.ReactNode
  className?: string
}) {
  const router = useRouter()
  const me = getAthlete(CURRENT_ATHLETE_ID)!

  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {back ? (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="-ml-1 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        {title ? (
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-bold tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        ) : (
          <SpikeWordmark />
        )}
      </div>
      <div className="flex items-center gap-2">
        {right}
        {showProfile ? (
          <Link
            href="/profile"
            aria-label="Open profile"
            className="rounded-full ring-primary/50 transition-shadow hover:ring-2"
          >
            <AthleteAvatar athlete={me} className="size-9 text-xs" />
          </Link>
        ) : null}
      </div>
    </header>
  )
}
