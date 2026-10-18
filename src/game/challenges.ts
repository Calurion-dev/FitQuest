import { addDaysToKey, dayKey } from '../lib/date'
import type { Workout } from '../types'
import { countsForMetrics, setAmount } from './engine'

export interface ChallengeDef {
  id: string
  name: string
  icon: string
  dailyLabel: string
  dailyTarget: number
  /** Mouvements comptés pour l'objectif quotidien ; null = une séance suffit. */
  movementIds: string[] | null
  milestones: { days: number; xp: number }[]
}

export const CHALLENGE_DAYS = 21

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'regularite',
    name: '21 jours de régularité',
    icon: '🔥',
    dailyLabel: 'une séance',
    dailyTarget: 1,
    movementIds: null,
    milestones: [
      { days: 7, xp: 100 },
      { days: 14, xp: 150 },
      { days: 21, xp: 300 }
    ]
  },
  {
    id: 'gainage',
    name: '21 jours de gainage',
    icon: '🧘',
    dailyLabel: '90 s de gainage',
    dailyTarget: 90,
    movementIds: ['gainage'],
    milestones: [
      { days: 7, xp: 100 },
      { days: 14, xp: 150 },
      { days: 21, xp: 300 }
    ]
  },
  {
    id: 'pompes',
    name: '21 jours de pompes',
    icon: '💪',
    dailyLabel: '50 pompes',
    dailyTarget: 50,
    movementIds: ['pompes', 'pompes_larges', 'pompes_diamant'],
    milestones: [
      { days: 7, xp: 100 },
      { days: 14, xp: 150 },
      { days: 21, xp: 300 }
    ]
  }
]

export function challengeById(id: string): ChallengeDef | undefined {
  return CHALLENGES.find((c) => c.id === id)
}

function dayDone(def: ChallengeDef, key: string, workouts: Workout[]): boolean {
  const day = workouts.filter((w) => w.dayKey === key)
  if (!day.length) return false
  if (!def.movementIds) return true
  const amount = day.reduce(
    (acc, w) =>
      acc +
      w.sets
        .filter((s) => (def.movementIds as string[]).includes(s.movementId) && countsForMetrics(s))
        .reduce((a, s) => a + setAmount(s), 0),
    0
  )
  return amount >= def.dailyTarget
}

/** Nombre de journées validées depuis le début du défi (fenêtre de 21 jours, jours pas forcément consécutifs). */
export function challengeDoneDays(def: ChallengeDef, startedDay: string, workouts: Workout[]): number {
  const today = dayKey()
  let count = 0
  for (let i = 0; i < CHALLENGE_DAYS; i++) {
    const key = addDaysToKey(startedDay, i)
    if (key > today) break
    if (dayDone(def, key, workouts)) count++
  }
  return count
}

/** Défi terminé (réussi ou temps écoulé) ? */
export function challengeFinished(def: ChallengeDef, startedDay: string, workouts: Workout[]): boolean {
  if (challengeDoneDays(def, startedDay, workouts) >= CHALLENGE_DAYS) return true
  return dayKey() > addDaysToKey(startedDay, CHALLENGE_DAYS - 1)
}
