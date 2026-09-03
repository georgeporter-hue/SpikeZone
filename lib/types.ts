export type Sex = 'M' | 'F'

export type Category = 'U12' | 'U14' | 'U16' | 'U18' | 'U20' | 'U23' | 'Senior' | 'Master'

export type VerificationStatus = 'quick' | 'pending' | 'approved' | 'rejected'

export type Scope = 'World' | 'Spain' | 'Andalusia' | 'Friends'

export type Season = '2026' | '2025' | 'All-time'

/** A track & field event. `type` distinguishes field vs track for mark formatting. */
export interface EventDef {
  id: string
  name: string
  kind: 'track' | 'field'
  unit: string
  /** true when a lower mark is better (times); false for distances/heights */
  lowerIsBetter: boolean
}

export interface Athlete {
  id: string
  username: string
  fullName: string
  avatar: string
  category: Category
  sex: Sex
  club: string
  region: string
  country: string
  spikeScore: number
  confidence: number
  friendIds: string[]
}

export interface Result {
  id: string
  athleteId: string
  eventId: string
  /** Numeric mark used for comparison/sorting (seconds for track, metres for field) */
  markValue: number
  /** Human readable mark, e.g. "11.45" or "6.42" */
  markLabel: string
  unit: string
  wind: number | null
  date: string
  competition: string
  status: VerificationStatus
  fileUrl: string | null
  waPoints: number
  isPB: boolean
  isSB: boolean
  createdBy: 'self' | 'seed'
}

export type AchievementState = 'locked' | 'in-progress' | 'unlocked'
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Secret'

export interface Achievement {
  id: string
  title: string
  description: string
  requirement: string
  rarity: Rarity
  state: AchievementState
  progress?: number
  icon: string
}

export type ChallengeStatus = 'active' | 'upcoming' | 'completed'
export type ChallengeType = 'league' | 'duel' | 'challenge'

export interface Challenge {
  id: string
  title: string
  type: ChallengeType
  description: string
  participants: number
  status: ChallengeStatus
  progress: number
  reward: string
  daysLeft: number
}
