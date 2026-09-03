'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, ListChecks, Plus, Trophy, Swords } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/marks', label: 'Marks', Icon: ListChecks },
  { href: '/ranking', label: 'Ranking', Icon: Trophy },
  { href: '/compete', label: 'Compete', Icon: Swords },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur-md"
    >
      <div className="relative mx-auto grid max-w-md grid-cols-5 items-center px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {TABS.slice(0, 2).map(({ href, label, Icon }) => (
          <NavItem key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
        ))}

        {/* Center add-result FAB */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => router.push('/add')}
            aria-label="Add a result"
            className={cn(
              'flex size-14 -translate-y-4 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95',
              pathname.startsWith('/add') && 'ring-4 ring-primary/30',
            )}
          >
            <Plus className="size-7" strokeWidth={2.5} />
          </button>
        </div>

        {TABS.slice(2).map(({ href, label, Icon }) => (
          <NavItem key={href} href={href} label={label} Icon={Icon} active={isActive(href)} />
        ))}
      </div>
    </nav>
  )
}

function NavItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string
  label: string
  Icon: typeof Home
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
      <span>{label}</span>
    </Link>
  )
}
