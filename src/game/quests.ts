import { movement } from './engine'
import { dayKey, monthKey, weekKey } from '../lib/date'
import type { Quest } from '../types'

function dailies(dk: string): Quest[] {
  return [
    {
      id: `daily-pompes-${dk}`,
      type: 'daily',
      title: 'Le mur de pompes',
      description: "50 pompes aujourd'hui",
      icon: '💪',
      metric: 'reps',
      movementIds: ['pompes'],
      target: 50,
      rewardXp: 100,
      periodKey: dk,
      claimed: false
    },
    {
      id: `daily-tirage-${dk}`,
      type: 'daily',
      title: 'Le tirage',
      description: "20 tractions ou australiennes aujourd'hui",
      icon: '🧗',
      metric: 'reps',
      movementIds: ['australiennes', 'tractions_pronation', 'tractions_supination'],
      target: 20,
      rewardXp: 150,
      periodKey: dk,
      claimed: false
    },
    {
      id: `daily-gainage-${dk}`,
      type: 'daily',
      title: 'Le pilier',
      description: "90 secondes de gainage aujourd'hui",
      icon: '🧘',
      metric: 'reps',
      movementIds: ['gainage'],
      target: 90,
      rewardXp: 100,
      periodKey: dk,
      claimed: false
    }
  ]
}

function weeklies(wk: string): Quest[] {
  return [
    {
      id: `weekly-sessions-${wk}`,
      type: 'weekly',
      title: 'Régularité',
      description: '3 séances cette semaine',
      icon: '📅',
      metric: 'sessions',
      target: 3,
      rewardXp: 300,
      periodKey: wk,
      claimed: false
    },
    {
      id: `weekly-volume-${wk}`,
      type: 'weekly',
      title: 'Gros volume',
      description: '250 répétitions cette semaine',
      icon: '📦',
      metric: 'volume',
      target: 250,
      rewardXp: 250,
      periodKey: wk,
      claimed: false
    }
  ]
}

const BOSSES: { movementId: string; title: string; target: number; rewardXp: number; icon: string }[] = [
  { movementId: 'pompes', title: 'Le Colosse de pompes', target: 300, rewardXp: 500, icon: '👹' },
  { movementId: 'dips', title: 'Le Seigneur des dips', target: 100, rewardXp: 500, icon: '👺' },
  { movementId: 'tractions_pronation', title: 'Le Maître des tractions', target: 60, rewardXp: 600, icon: '🐲' }
]

function boss(mk: string, now: Date): Quest {
  const b = BOSSES[now.getMonth() % BOSSES.length]
  return {
    id: `boss-${b.movementId}-${mk}`,
    type: 'boss',
    title: `Boss du mois : ${b.title}`,
    description: `Cumuler ${b.target} ${movement(b.movementId)?.name.toLowerCase() ?? ''} ce mois-ci`,
    icon: b.icon,
    metric: 'reps',
    movementIds: [b.movementId],
    target: b.target,
    rewardXp: b.rewardXp,
    periodKey: mk,
    claimed: false
  }
}

export function buildQuests(now: Date = new Date()): Quest[] {
  return [...dailies(dayKey(now)), ...weeklies(weekKey(now)), boss(monthKey(now), now)]
}

/** Reconstruit les quêtes actives sans perdre l'état `claimed` de la période en cours. */
export function ensureQuests(existing: Quest[], now: Date = new Date()): Quest[] {
  const fresh = buildQuests(now)
  const byId = new Map(existing.map((q) => [q.id, q]))
  return fresh.map((q) => byId.get(q.id) ?? q)
}
