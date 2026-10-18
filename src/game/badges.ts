import { isPrEligible, movementTotals, perfectWeeks } from './engine'
import type { BadgeDef, DayPlan, Player, Quest, WeekDay, Workout } from '../types'

export interface BadgeCtx {
  workouts: Workout[]
  player: Player
  quests: Quest[]
  level: number
  weekPlan: Record<WeekDay, DayPlan>
}

export interface Badge extends BadgeDef {
  check: (ctx: BadgeCtx) => boolean
}

const anySet = (ctx: BadgeCtx, movementId: string, min: number): boolean =>
  ctx.workouts.some((w) =>
    w.sets.some((s) => s.movementId === movementId && isPrEligible(s) && (s.reps ?? s.seconds ?? 0) >= min)
  )

export const BADGES: Badge[] = [
  { id: 'first_workout', name: 'Premier sang', description: 'Terminer ta première séance', icon: '🎉', check: (c) => c.workouts.length >= 1 },
  { id: 'pompes_20', name: 'Machine à pompes', description: "20 pompes d'affilée", icon: '🦾', check: (c) => anySet(c, 'pompes', 20) },
  { id: 'dips_10', name: 'Roi des dips', description: "10 dips d'affilée", icon: '👑', check: (c) => anySet(c, 'dips', 10) },
  { id: 'tractions_10', name: 'Grimpeur', description: "10 tractions d'affilée", icon: '🧲', check: (c) => anySet(c, 'tractions_pronation', 10) },
  { id: 'australiennes_15', name: 'Traction inversée', description: "15 tractions australiennes d'affilée", icon: '🛶', check: (c) => anySet(c, 'australiennes', 15) },
  { id: 'pistol_1', name: 'Équilibriste', description: 'Ton premier pistol squat', icon: '🦿', check: (c) => anySet(c, 'pistol', 1) },
  { id: 'gainage_60', name: 'Statue', description: "60 secondes de gainage d'affilée", icon: '🗿', check: (c) => anySet(c, 'gainage', 60) },
  { id: 'pompes_1000', name: 'Mille pompes', description: '1000 pompes cumulées', icon: '💯', check: (c) => movementTotals(c.workouts, 'pompes').total >= 1000 },
  { id: 'explorer_5', name: 'Explorateur', description: '5 spots différents visités', icon: '🧭', check: (c) => new Set(c.workouts.filter((w) => w.spotId).map((w) => w.spotId)).size >= 5 },
  { id: 'streak_7', name: 'Feu sacré', description: "7 jours d'entraînement d'affilée", icon: '🔥', check: (c) => c.player.streakDays >= 7 },
  { id: 'streak_30', name: 'Légende', description: "30 jours d'entraînement d'affilée", icon: '🐉', check: (c) => c.player.streakDays >= 30 },
  { id: 'level_10', name: 'Vétéran', description: 'Atteindre le niveau 10', icon: '⭐', check: (c) => c.level >= 10 },
  { id: 'boss_slayer', name: 'Tueur de boss', description: 'Vaincre un boss mensuel', icon: '⚔️', check: (c) => c.quests.some((q) => q.type === 'boss' && q.claimed) },
  { id: 'discipline', name: 'Discipline', description: 'Terminer un défi 21 jours', icon: '🗓️', check: (c) => Boolean(c.player.challenge?.awarded.includes(21)) },
  { id: 'semaine_4', name: 'Mois béton', description: "4 semaines parfaites d'affilée", icon: '📅', check: (c) => perfectWeeks(c.workouts, c.weekPlan) >= 4 },
  { id: 'semaine_12', name: 'Trimestre carré', description: "12 semaines parfaites d'affilée", icon: '🧱', check: (c) => perfectWeeks(c.workouts, c.weekPlan) >= 12 },
  { id: 'semaine_26', name: 'Semestre en acier', description: "26 semaines parfaites d'affilée", icon: '🏗️', check: (c) => perfectWeeks(c.workouts, c.weekPlan) >= 26 },
  { id: 'semaine_52', name: 'Année parfaite', description: "52 semaines parfaites d'affilée", icon: '🏆', check: (c) => perfectWeeks(c.workouts, c.weekPlan) >= 52 }
]
