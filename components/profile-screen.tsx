'use client'
import { ChevronRight, Medal, Target, Trophy } from 'lucide-react'
import Link from 'next/link'
import { ScreenHeader } from '@/components/screen-header'
import { AthleteAvatar } from '@/components/athlete-avatar'
import { Card } from '@/components/ui/primitives'
import { getAthlete } from '@/lib/sample-data'
import { CURRENT_ATHLETE_ID } from '@/lib/sample-data'
import { useStore, useMyResults } from '@/components/store'

export function ProfileScreen() {
  const me = getAthlete(CURRENT_ATHLETE_ID)!
  const { spike, achievements } = useStore()
  const results = useMyResults()
  const unlocked = achievements.filter(a=>a.state==='unlocked').length
  return <div>
    <ScreenHeader title="Profile" showProfile={false}/>
    <div className="space-y-4 px-4 py-5">
      <Card className="p-5">
        <div className="flex items-center gap-4"><AthleteAvatar athlete={me} className="size-16 text-lg"/><div><p className="font-display text-2xl font-bold">{me.fullName}</p><p className="text-sm text-muted-foreground">{me.username} · {me.category}</p></div></div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center"><div><p className="font-display text-2xl font-bold text-primary">{spike.score}</p><p className="text-[10px] uppercase text-muted-foreground">Score</p></div><div><p className="font-display text-2xl font-bold">{results.length}</p><p className="text-[10px] uppercase text-muted-foreground">Results</p></div><div><p className="font-display text-2xl font-bold">{unlocked}</p><p className="text-[10px] uppercase text-muted-foreground">Badges</p></div></div>
      </Card>
      <Card className="divide-y divide-border">
        <Link href="/marks" className="flex items-center gap-3 p-4"><Target className="size-5 text-primary"/><span className="flex-1 font-semibold">Personal marks</span><ChevronRight className="size-4 text-muted-foreground"/></Link>
        <Link href="/ranking" className="flex items-center gap-3 p-4"><Medal className="size-5 text-primary"/><span className="flex-1 font-semibold">My rankings</span><ChevronRight className="size-4 text-muted-foreground"/></Link>
        <Link href="/achievements" className="flex items-center gap-3 p-4"><Trophy className="size-5 text-primary"/><span className="flex-1 font-semibold">Achievements</span><ChevronRight className="size-4 text-muted-foreground"/></Link>
      </Card>
    </div>
  </div>
}
