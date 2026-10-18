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

/** Type de série ; `undefined` = série normale. */
export type SetType = 'warmup' | 'drop' | 'amrap' | 'failure'

export interface WorkoutSet {
  id: string
  movementId: string
  reps?: number
  seconds?: number
  /** Lest ajouté en kg, si la série a été faite avec du poids. */
  addedKg?: number
  /** Échauffement (0 XP), drop set, AMRAP, ou série poussée à l'échec. */
  type?: SetType
}

export interface Workout {
  id: string
  date: string
  dayKey: string
  spotId?: string
  durationSec: number
  sets: WorkoutSet[]
  xp: number
  /** WOD de la banque dont la séance est issue (sert au WOD du jour). */
  wodId?: string
  /** Séance d'une semaine de récupération : ses séries ne battent pas de record. */
  deload?: boolean
}

/** Séance en cours, conservée même si on quitte l'écran Séance. */
export interface WorkoutDraft {
  startedAt: number
  sets: WorkoutSet[]
  selected: string[]
  templateId: string
  spotId?: string
  wodId?: string
  targets?: Record<string, RoutineItem>
  /** Timestamp de fin du repos en cours, ou null. */
  restEndsAt: number | null
  /** Séance lancée pendant une semaine allégée. */
  deload?: boolean
}

/** Division de la ligue hebdo (0 = Bronze). */
export interface League {
  division: number
  /** Semaine (ISO) du classement en cours ou du dernier réglage. */
  weekKey: string
  lastResult?: 'promoted' | 'demoted' | 'stayed'
  resultSeen?: boolean
}

/** Pari de régularité : tenir 7 jours consécutifs de séance. */
export interface Wager {
  startDay: string
  stake: number
  /** Jours consécutifs déjà validés. */
  days: number
  lastDay: string
  result: 'active' | 'won' | 'lost'
}

/** Défi 21 jours en cours. */
export interface Challenge {
  id: string
  startedDay: string
  /** Paliers déjà payés (jours : 7, 14, 21). */
  awarded: number[]
}

export interface Player {
  pseudo: string
  xpTotal: number
  stats: Record<StatKey, number>
  streakDays: number
  lastWorkoutDay?: string
  spotBonusClaimed: string[]
  league?: League
  wager?: Wager
  challenge?: Challenge
  /** Semaine dont le rapport hebdo a déjà été affiché. */
  lastReportWeekKey?: string
  /** Dernière semaine où une semaine allégée a été acceptée. */
  lastDeloadWeekKey?: string
  /** Semaine où la suggestion de semaine allégée a été écartée. */
  deloadDismissedWeek?: string
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

export type Lang = 'fr' | 'en' | 'es'

export interface Settings {
  restSec: number
  /** Volume des sons (tic de série, fin de repos, records...). */
  sound: 'off' | 'low' | 'normal'
  /** Garder l'écran allumé pendant la séance (si le navigateur le permet). */
  wakeLock: boolean
  /** Contraste renforcé pour l'usage en plein soleil. */
  sunMode: boolean
  /** Proposer les étirements à la fin de la séance. */
  postStretch: boolean
  /** Proposer un échauffement guidé avant la séance. */
  warmup: boolean
  /** Unité d'affichage du lest (le stockage reste en kg). */
  units: 'kg' | 'lbs'
  /** Langue de l'interface ; absente = langue du navigateur. */
  lang?: Lang
  /** Date ISO du dernier export de sauvegarde. */
  lastExportAt?: string
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

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

/** Planning d'un jour de la semaine : repos, ou une à plusieurs routines prévues. */
export interface DayPlan {
  rest: boolean
  routineIds: string[]
}

export interface AppData {
  /** Date ISO de la dernière modification locale (sert à comparer avec le cloud). */
  updatedAt: string
  player: Player
  workouts: Workout[]
  routines: Routine[]
  weekPlan: Record<WeekDay, DayPlan>
  spots: Spot[]
  reviews: Review[]
  quests: Quest[]
  badges: Record<string, string>
  settings: Settings
  /** WODs mis en favoris. */
  favorites: string[]
  /** Séance en cours (brouillon), non synchronisée au cloud. */
  draft: WorkoutDraft | null
}

export interface LootSummary {
  xpBase: number
  xpQuests: number
  xpSpotBonus: number
  /** Bonus du WOD du jour, s'il a été fait le jour même. */
  xpWodBonus: number
  /** Paliers de défi 21 jours atteints pendant cette séance. */
  xpChallenge: number
  /** Pari de régularité gagné pendant cette séance (mise doublée). */
  xpWager: number
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
