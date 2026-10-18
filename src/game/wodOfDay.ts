import { WODS, type Wod } from '../data/wods'
import type { Workout } from '../types'
import { totalReps } from './engine'
import { hash } from './rand'

export const WOD_OF_DAY_BONUS = 50

export function wodOfDay(key: string): Wod {
  return WODS[hash(`fq-${key}`) % WODS.length]
}

export interface WodBoardRow {
  name: string
  emoji: string
  /** Durée en secondes (For Time / AMRAP) ou répétitions selon le format. */
  value: number
  me: boolean
}

const RIVAL_NAMES = ['Lou', 'Sam', 'Inès', 'Kev', 'Maya', 'Théo', 'Noa']

/** Classement du jour : les WODs "for time" se classent par durée, les autres par volume. */
export function wodDayBoard(
  wod: Wod,
  workouts: Workout[],
  key: string
): { rows: WodBoardRow[]; unit: 'temps' | 'reps' } {
  const timeBased = /for time|amrap|emom/i.test(wod.format)
  const seed = hash(`board-${key}-${wod.id}`)
  const rows: WodBoardRow[] = []
  for (let i = 0; i < 4; i++) {
    const h = hash(`${seed}-${i}`)
    rows.push({
      name: RIVAL_NAMES[h % RIVAL_NAMES.length],
      emoji: '🥷',
      value: timeBased ? 480 + (h % 1200) : 40 + (h % 260),
      me: false
    })
  }
  const mine = workouts.find((w) => w.dayKey === key && w.wodId === wod.id)
  if (mine) rows.push({ name: 'Toi', emoji: '🦸', value: timeBased ? mine.durationSec : totalReps([mine]), me: true })
  rows.sort((a, b) => (timeBased ? a.value - b.value : b.value - a.value))
  return { rows, unit: timeBased ? 'temps' : 'reps' }
}
