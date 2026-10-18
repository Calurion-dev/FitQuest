import type { Workout } from '../types'
import { weekXpOf } from './engine'
import { hash, rand } from './rand'
import { RIVALS } from './rivals'

export const DIVISIONS = ['Bronze', 'Argent', 'Or', 'Platine', 'Diamant', 'Street'] as const

/** Nombre de joueurs promus en haut de tableau et relégués en bas. */
export const ZONE = 5

const FACTORS = [0.35, 0.6, 1, 1.6, 2.5, 4]

export interface LeagueRow {
  id: string
  name: string
  emoji: string
  xp: number
  me: boolean
}

/** Tableau de la ligue : 18 rivaux simulés + toi, XP hebdo de la semaine `week`. */
export function leagueRows(division: number, week: string, workouts: Workout[], pseudo: string): LeagueRow[] {
  const factor = FACTORS[Math.min(division, FACTORS.length - 1)]
  const rows: LeagueRow[] = RIVALS.map((r, i) => {
    const base = (r.xp / 52) * factor
    const jitter = 0.5 + rand(hash(`${week}-${division}-${i}`)) * 1.1
    return { id: r.id, name: r.name, emoji: r.emoji, xp: Math.round(base * jitter), me: false }
  })
  rows.push({ id: 'me', name: pseudo || 'Toi', emoji: '🦸', xp: weekXpOf(workouts, week), me: true })
  rows.sort((a, b) => b.xp - a.xp)
  return rows
}

export function myPosition(rows: LeagueRow[]): number {
  return rows.findIndex((r) => r.me)
}

/** Inactivité (0 XP) : ni promotion ni relégation. */
export function leagueOutcome(rows: LeagueRow[], division: number): 'promoted' | 'demoted' | 'stayed' {
  const pos = myPosition(rows)
  const me = rows[pos]
  if (!me || me.xp === 0) return 'stayed'
  if (pos < ZONE && division < DIVISIONS.length - 1) return 'promoted'
  if (pos >= rows.length - ZONE && division > 0) return 'demoted'
  return 'stayed'
}
