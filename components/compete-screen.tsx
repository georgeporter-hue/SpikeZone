'use client'
import { Flame, Swords, TrendingUp, Trophy, Users } from 'lucide-react'
import { ScreenHeader } from '@/components/screen-header'
import { Card, ProgressBar } from '@/components/ui/primitives'
import { useStore } from '@/components/store'

const ICONS = { duel: Swords, challenge: Flame, league: Trophy } as const

export function CompeteScreen() {
  const { challenges } = useStore()
  return <div>
    <ScreenHeader title="Compete" subtitle="Challenge your limits" />
    <div className="space-y-4 px-4 py-5">
      <Card className="overflow-hidden border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary"><TrendingUp className="size-6"/></span>
          <div><p className="font-display text-lg font-bold">Most Improved</p><p className="text-xs text-muted-foreground">Progress beats perfection.</p></div>
        </div>
      </Card>
      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">Active</h2>
        <div className="space-y-2">
          {challenges.map(c => { const Icon = ICONS[c.type] ?? Flame; return <Card key={c.id} className="p-4">
            <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Icon className="size-5"/></span>
            <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="font-semibold">{c.title}</p><span className="text-xs text-muted-foreground">{c.daysLeft}d</span></div>
            <p className="mt-1 text-xs text-muted-foreground">{c.description}</p><ProgressBar value={c.progress} className="mt-3 h-1.5"/></div></div>
          </Card> })}
        </div>
      </section>
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-4"><Users className="size-5 text-primary"/><p className="mt-2 font-semibold">Friends</p><p className="text-xs text-muted-foreground">Find athletes and compete.</p></Card>
        <Card className="p-4"><Swords className="size-5 text-primary"/><p className="mt-2 font-semibold">Duels</p><p className="text-xs text-muted-foreground">Go head-to-head.</p></Card>
      </div>
    </div>
  </div>
}
