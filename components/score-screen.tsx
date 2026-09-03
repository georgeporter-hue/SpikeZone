'use client'
import { ScreenHeader } from '@/components/screen-header'
import { Card, ProgressBar } from '@/components/ui/primitives'
import { ScoreRing } from '@/components/score-ring'
import { useStore } from '@/components/store'

export function ScoreScreen() {
  const { spike } = useStore()
  return <div>
    <ScreenHeader title="SPIKE SCORE" subtitle="Performance overview" back/>
    <div className="space-y-4 px-4 py-5">
      <Card className="flex flex-col items-center p-6"><ScoreRing score={spike.score} confidence={spike.confidence}/><p className="mt-4 text-center text-sm text-muted-foreground">Your score summarizes your strongest results across events.</p></Card>
      <Card className="p-4"><p className="font-display text-sm font-bold uppercase tracking-wide">Contributing results</p><div className="mt-3 space-y-3">{spike.contributing.map(c=><div key={c.eventId}><div className="flex justify-between text-sm"><span>{c.eventId}</span><span className="font-mono">{c.points} pts</span></div><ProgressBar value={Math.min(100,c.points/12)} className="mt-1 h-1.5"/></div>)}</div></Card>
    </div>
  </div>
}
