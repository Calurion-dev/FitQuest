export type Family = 'push' | 'pull' | 'legs' | 'core'
export type StatKey = 'push' | 'pull' | 'legs' | 'endurance'

export interface Movement {
  id: string
  name: string
  family: Family
  coeff: number
  emoji: string
  isHold?: boolean
  description: string
}

export interface WorkoutSet {
  id: string
  movementId: string
  reps?: number
  seconds?: number
  /** Lest ajouté en kg, si la série a été faite avec du poids. */
  addedKg?: number
}

export interface Workout {
  id: string
  date: string
  dayKey: string
  spotId?: string
  durationSec: number
  sets: WorkoutSet[]
  xp: number
}

export interface Player {
  pseudo: string
  xpTotal: number
  stats: Record<StatKey, number>
  streakDays: number
  lastWorkoutDay?: string
  spotBonusClaimed: string[]
}

export type QuestType = 'daily' | 'weekly' | 'boss'
export type QuestMetric = 'reps' | 'sessions' | 'volume'

export interface Quest {
  id: string
  type: QuestType
  title: string
  description: string
  icon: string
  metric: QuestMetric
  movementIds?: string[]
  target: number
  rewardXp: number
  periodKey: string
  claimed: boolean
}

export interface BadgeDef {
  id: string
  name: string
  description: string
  icon: string
}

export type SpotType = 'salle' | 'parc'

export interface Spot {
  id: string
  name: string
  type: SpotType
  lat: number
  lng: number
  equipments: string[]
  createdAt: string
}

export interface Review {
  id: string
  spotId: string
  rating: number
  comment: string
  date: string
}

export interface Settings {
  restSec: number
}

export interface RoutineItem {
  movementId: string
  /** Objectif : nombre de séries et répétitions (ou secondes) par série. */
  sets: number
  reps: number
  /** Lest cible en kg pour ce mouvement (optionnel). */
  addedKg?: number
}

export interface Routine {
  id: string
  name: string
  items: RoutineItem[]
}

export interface AppData {
  /** Date ISO de la dernière modification locale (sert à comparer avec le cloud). */
  updatedAt: string
  player: Player
  workouts: Workout[]
  routines: Routine[]
  spots: Spot[]
  reviews: Review[]
  quests: Quest[]
  badges: Record<string, string>
  settings: Settings
}

export interface LootSummary {
  xpBase: number
  xpQuests: number
  xpSpotBonus: number
  bonusPercent: number
  xpTotal: number
  levelBefore: number
  levelAfter: number
  statLevelUps: { stat: StatKey; before: number; after: number }[]
  questsCompleted: Quest[]
  badgesUnlocked: BadgeDef[]
  /** Records personnels battus pendant la séance (meilleure série par mouvement). */
  records: { movementId: string; value: number; previous: number; isHold: boolean }[]
  streakDays: number
  totalReps: number
  durationSec: number
  setCount: number
}
