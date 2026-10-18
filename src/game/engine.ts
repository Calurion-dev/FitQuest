import { MOVEMENTS } from '../data/movements'
import { addDaysToKey, dateFromKey, dayKey, weekKey } from '../lib/date'
import type { DayPlan, Family, Movement, Quest, StatKey, WeekDay, Workout, WorkoutSet } from '../types'

export const PLAYER_XP_BASE = 100
export const SUB_XP_BASE = 50
export const SPOT_BONUS_XP = 50

export function xpForLevel(level: number, base: number = PLAYER_XP_BASE): number {
  return Math.round(base * Math.pow(level, 1.5))
}

export interface LevelInfo {
  level: number
  into: number
  need: number
  pct: number
}

export function levelInfo(xp: number, base: number = PLAYER_XP_BASE): LevelInfo {
  let level = 1
  let rem = Math.max(0, xp)
  while (level < 100 && rem >= xpForLevel(level, base)) {
    rem -= xpForLevel(level, base)
    level++
  }
  const need = xpForLevel(level, base)
  return { level, into: rem, need, pct: Math.min(100, Math.round((rem / need) * 100)) }
}

export function levelFromXp(xp: number, base: number = PLAYER_XP_BASE): number {
  return levelInfo(xp, base).level
}

export function movement(id: string): Movement | undefined {
  return MOVEMENTS.find((m) => m.id === id)
}

export function setAmount(s: WorkoutSet): number {
  return s.reps ?? s.seconds ?? 0
}

/** Une série compte-t-elle dans les stats, quêtes et records ? (non pour l'échauffement) */
export function countsForMetrics(s: WorkoutSet): boolean {
  return s.type !== 'warmup'
}

/** Une série peut-elle battre un record ? (ni échauffement, ni drop set) */
export function isPrEligible(s: WorkoutSet): boolean {
  return s.type !== 'warmup' && s.type !== 'drop'
}

export function setXp(s: WorkoutSet, bonusPercent = 0): number {
  if (!countsForMetrics(s)) return 0
  const m = movement(s.movementId)
  if (!m) return 0
  return Math.round(setAmount(s) * m.coeff * (1 + bonusPercent / 100))
}

export function statForFamily(family: Family): StatKey {
  return family === 'core' ? 'endurance' : family
}

/** +10% XP si au moins 3 séances sur les 7 derniers jours (bonus streak). */
export function activeBonusPercent(workouts: Workout[], ref: Date = new Date()): number {
  const from = new Date(ref)
  from.setDate(from.getDate() - 6)
  const fromKey = dayKey(from)
  const count = workouts.filter((w) => w.dayKey >= fromKey).length
  return count >= 3 ? 10 : 0
}

export function questProgress(q: Quest, workouts: Workout[]): number {
  const inPeriod = workouts.filter((w) => {
    if (q.type === 'daily') return w.dayKey === q.periodKey
    if (q.type === 'weekly') return weekKey(dateFromKey(w.dayKey)) === q.periodKey
    return w.dayKey.slice(0, 7) === q.periodKey
  })
  if (q.metric === 'sessions') return inPeriod.length
  if (q.metric === 'volume')
    return inPeriod.reduce(
      (acc, w) => acc + w.sets.filter(countsForMetrics).reduce((a, s) => a + setAmount(s), 0),
      0
    )
  return inPeriod.reduce(
    (acc, w) =>
      acc +
      w.sets
        .filter((s) => countsForMetrics(s) && (!q.movementIds || q.movementIds.includes(s.movementId)))
        .reduce((a, s) => a + setAmount(s), 0),
    0
  )
}

export function totalReps(workouts: Workout[]): number {
  return workouts.reduce(
    (acc, w) => acc + w.sets.filter(countsForMetrics).reduce((a, s) => a + (s.reps ?? 0), 0),
    0
  )
}

export function movementXp(workouts: Workout[], movementId: string): number {
  const coeff = movement(movementId)?.coeff ?? 0
  return workouts.reduce(
    (acc, w) =>
      acc +
      w.sets
        .filter((s) => s.movementId === movementId && countsForMetrics(s))
        .reduce((a, s) => a + setAmount(s) * coeff, 0),
    0
  )
}

export function movementTotals(workouts: Workout[], movementId: string): { total: number; best: number } {
  let total = 0
  let best = 0
  for (const w of workouts)
    for (const s of w.sets)
      if (s.movementId === movementId) {
        if (countsForMetrics(s)) total += setAmount(s)
        if (isPrEligible(s)) best = Math.max(best, setAmount(s))
      }
  return { total, best }
}

/** Meilleure série par séance (du plus ancien au plus récent), limité aux `limit` dernières. */
export function bestSetSeries(workouts: Workout[], movementId: string, limit = 12): number[] {
  const asc = [...workouts].sort((a, b) => a.date.localeCompare(b.date))
  const series: number[] = []
  for (const w of asc) {
    const vals = w.sets.filter((s) => s.movementId === movementId && isPrEligible(s)).map(setAmount)
    if (vals.length) series.push(Math.max(...vals))
  }
  return series.slice(-limit)
}

/** Dernière séance où le mouvement apparaît : valeurs des séries (hors échauffement). */
export function lastSessionFor(workouts: Workout[], movementId: string): { dayKey: string; values: number[] } | null {
  const sorted = [...workouts].sort((a, b) => b.dayKey.localeCompare(a.dayKey))
  for (const w of sorted) {
    const values = w.sets.filter((s) => s.movementId === movementId && countsForMetrics(s)).map(setAmount)
    if (values.length) return { dayKey: w.dayKey, values }
  }
  return null
}

export function visitedSpots(workouts: Workout[]): string[] {
  return Array.from(new Set(workouts.filter((w) => w.spotId).map((w) => w.spotId as string)))
}

/** Répétitions cumulées d'une famille (hors échauffement), depuis une date optionnelle. */
export function familyReps(workouts: Workout[], family: Family, sinceKey?: string): number {
  return workouts.reduce((acc, w) => {
    if (sinceKey && w.dayKey < sinceKey) return acc
    return (
      acc +
      w.sets
        .filter((s) => countsForMetrics(s) && movement(s.movementId)?.family === family)
        .reduce((a, s) => a + (s.reps ?? 0), 0)
    )
  }, 0)
}

/** XP gagné pendant une semaine ISO ('YYYY-Www'). */
export function weekXpOf(workouts: Workout[], week: string): number {
  return workouts.reduce((acc, w) => (weekKey(dateFromKey(w.dayKey)) === week ? acc + w.xp : acc), 0)
}

const WEEK_DAYS: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

/**
 * Semaines parfaites consécutives : chaque jour programmé (planning, hors repos)
 * doit avoir au moins une séance. La semaine en cours n'est pas jugée.
 */
export function perfectWeeks(
  workouts: Workout[],
  weekPlan: Record<WeekDay, DayPlan>,
  ref: Date = new Date()
): number {
  const done = new Set(workouts.map((w) => w.dayKey))
  let count = 0
  let cursor = new Date(ref.getTime() - 7 * 86400000)
  for (let i = 0; i < 52; i++) {
    const idx = (cursor.getDay() + 6) % 7 // 0 = lundi
    const start = new Date(cursor.getTime() - idx * 86400000)
    start.setHours(12, 0, 0, 0)
    const startKey = dayKey(start)
    const keys = WEEK_DAYS.map((_, j) => addDaysToKey(startKey, j))
    const planned = keys.filter((_, j) => {
      const p = weekPlan[WEEK_DAYS[j]]
      return p && !p.rest && p.routineIds.length > 0
    })
    if (!planned.length) break
    if (!planned.every((k) => done.has(k))) break
    count++
    cursor = new Date(cursor.getTime() - 7 * 86400000)
  }
  return count
}
