'use client'
import { Lock, Sparkles, Trophy } from 'lucide-react'
import { ScreenHeader } from '@/components/screen-header'
import { Card, ProgressBar, RarityTag } from '@/components/ui/primitives'
import { useStore } from '@/components/store'

export function AchievementsScreen() {
  const { achievements } = useStore()
  return <div>
    <ScreenHeader title="Achievements" subtitle={`${achievements.filter(a=>a.state==='unlocked').length} unlocked`} />
    <div className="space-y-2 px-4 py-5">
      {achievements.map(a => <Card key={a.id} className="p-4">
        <div className="flex items-center gap-3">
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${a.state==='unlocked'?'bg-primary/15 text-primary':'bg-secondary text-muted-foreground'}`}>
            {a.state==='unlocked' ? <Trophy className="size-5"/> : <Lock className="size-5"/>}
          </span>
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-semibold truncate">{a.title}</p><RarityTag rarity={a.rarity}/></div>
          <p className="mt-1 text-xs text-muted-foreground">{a.state==='locked' ? 'Locked achievement' : a.description}</p>
          {a.state==='in-progress' && <ProgressBar value={a.progress ?? 0} className="mt-2 h-1.5"/>}</div>
        </div>
      </Card>)}
      <p className="pt-2 text-center text-xs text-muted-foreground"><Sparkles className="mr-1 inline size-3"/> More achievements will unlock as SPIKEZONE grows.</p>
    </div>
  </div>
}
