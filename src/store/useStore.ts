import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BADGES } from '../game/badges'
import {
  SPOT_BONUS_XP,
  SUB_XP_BASE,
  activeBonusPercent,
  levelFromXp,
  movement,
  movementTotals,
  questProgress,
  setAmount,
  setXp,
  statForFamily
} from '../game/engine'
import { ensureQuests } from '../game/quests'
import { dayKey, previousDayKey } from '../lib/date'
import { uid } from '../lib/id'
import type {
  AppData,
  BadgeDef,
  DayPlan,
  LootSummary,
  Player,
  Quest,
  Review,
  Routine,
  Settings,
  Spot,
  StatKey,
  WeekDay,
  Workout
} from '../types'

export type AppState = AppData

/** Marque les données comme modifiées à l'instant (déclenche la synchro cloud). */
const touch = () => ({ updatedAt: new Date().toISOString() })

const initialWeekPlan = (): Record<WeekDay, DayPlan> => ({
  mon: { rest: false, routineIds: [] },
  tue: { rest: false, routineIds: [] },
  wed: { rest: false, routineIds: [] },
  thu: { rest: false, routineIds: [] },
  fri: { rest: false, routineIds: [] },
  sat: { rest: false, routineIds: [] },
  sun: { rest: false, routineIds: [] }
})

const initialState: AppState = {
  // Époque : tant que rien n'a été modifié localement, le cloud est considéré
  // comme plus récent (utile pour restaurer ses données sur un nouvel appareil).
  updatedAt: new Date(0).toISOString(),
  player: {
    pseudo: '',
    xpTotal: 0,
    stats: { push: 0, pull: 0, legs: 0, endurance: 0 },
    streakDays: 0,
    spotBonusClaimed: []
  },
  workouts: [],
  routines: [],
  weekPlan: initialWeekPlan(),
  spots: [],
  reviews: [],
  quests: [],
  badges: {},
  settings: { restSec: 90 }
}

interface Actions {
  setPseudo: (pseudo: string) => void
  setSettings: (patch: Partial<Settings>) => void
  ensureQuests: () => void
  finishWorkout: (workout: Workout) => LootSummary
  addSpot: (data: Omit<Spot, 'id' | 'createdAt'>) => Spot
  deleteSpot: (id: string) => void
  addReview: (data: Omit<Review, 'id' | 'date'>) => void
  saveRoutine: (routine: Routine) => void
  deleteRoutine: (id: string) => void
  setDayPlan: (day: WeekDay, patch: Partial<DayPlan>) => void
  replaceAll: (data: Partial<AppData>) => void
  resetAll: () => void
}

export const useStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPseudo: (pseudo) => set((s) => ({ ...touch(), player: { ...s.player, pseudo } })),

      setSettings: (patch) => set((s) => ({ ...touch(), settings: { ...s.settings, ...patch } })),

      ensureQuests: () => set((s) => ({ quests: ensureQuests(s.quests) })),

      addSpot: (data) => {
        const spot: Spot = { ...data, id: uid(), createdAt: new Date().toISOString() }
        set((s) => ({ ...touch(), spots: [spot, ...s.spots] }))
        return spot
      },

      deleteSpot: (id) =>
        set((s) => ({
          ...touch(),
          spots: s.spots.filter((x) => x.id !== id),
          reviews: s.reviews.filter((r) => r.spotId !== id)
        })),

      addReview: (data) =>
        set((s) => ({
          ...touch(),
          reviews: [{ ...data, id: uid(), date: new Date().toISOString() }, ...s.reviews]
        })),

      saveRoutine: (routine) =>
        set((s) => ({
          ...touch(),
          routines: s.routines.some((r) => r.id === routine.id)
            ? s.routines.map((r) => (r.id === routine.id ? routine : r))
            : [routine, ...s.routines]
        })),

      deleteRoutine: (id) =>
        set((s) => {
          // Une routine supprimée disparaît aussi du planning hebdo.
          const weekPlan = { ...s.weekPlan }
          for (const d of Object.keys(weekPlan) as WeekDay[]) {
            weekPlan[d] = { ...weekPlan[d], routineIds: weekPlan[d].routineIds.filter((x) => x !== id) }
          }
          return { ...touch(), routines: s.routines.filter((r) => r.id !== id), weekPlan }
        }),

      setDayPlan: (day, patch) =>
        set((s) => ({
          ...touch(),
          weekPlan: { ...s.weekPlan, [day]: { ...s.weekPlan[day], ...patch } }
        })),

      finishWorkout: (workout) => {
        const state = get()
        const bonusPercent = activeBonusPercent([workout, ...state.workouts])
        const xpBase = workout.sets.reduce((acc, s) => acc + setXp(s, bonusPercent), 0)
        const workouts = [workout, ...state.workouts]

        // Records personnels : on compare à ce qui existait avant cette séance.
        const records: LootSummary['records'] = []
        for (const s of workout.sets) {
          const m = movement(s.movementId)
          if (!m) continue
          const value = setAmount(s)
          const previous = movementTotals(state.workouts, s.movementId).best
          const seen = records.find((r) => r.movementId === s.movementId)
          if (previous > 0 && value > Math.max(previous, seen?.value ?? 0)) {
            if (seen) seen.value = value
            else records.push({ movementId: s.movementId, value, previous, isHold: Boolean(m.isHold) })
          }
        }

        // Quêtes : progression recalculée sur les séances, récompense versée une seule fois.
        const quests = state.quests.map((q) => ({ ...q }))
        const questsCompleted: Quest[] = []
        let xpQuests = 0
        for (const q of quests) {
          if (!q.claimed && questProgress(q, workouts) >= q.target) {
            q.claimed = true
            xpQuests += q.rewardXp
            questsCompleted.push(q)
          }
        }

        // Bonus explorateur : une seule fois par spot.
        const claimed = new Set(state.player.spotBonusClaimed)
        let xpSpotBonus = 0
        if (workout.spotId && !claimed.has(workout.spotId)) {
          xpSpotBonus = SPOT_BONUS_XP
          claimed.add(workout.spotId)
        }

        // Stats RPG par famille.
        const stats: Record<StatKey, number> = { ...state.player.stats }
        for (const s of workout.sets) {
          const m = movement(s.movementId)
          if (m) stats[statForFamily(m.family)] += setAmount(s) * m.coeff
        }

        // Streak jours consécutifs.
        let streakDays = state.player.streakDays
        const prev = state.player.lastWorkoutDay
        if (prev !== workout.dayKey) {
          streakDays = prev === previousDayKey(workout.dayKey) ? state.player.streakDays + 1 : 1
        }

        const xpTotal = state.player.xpTotal + xpBase + xpQuests + xpSpotBonus
        const levelBefore = levelFromXp(state.player.xpTotal)
        const levelAfter = levelFromXp(xpTotal)

        const statLevelUps = (Object.keys(stats) as StatKey[])
          .map((k) => ({
            stat: k,
            before: levelFromXp(state.player.stats[k], SUB_XP_BASE),
            after: levelFromXp(stats[k], SUB_XP_BASE)
          }))
          .filter((x) => x.after > x.before)

        const player: Player = {
          ...state.player,
          xpTotal,
          stats,
          streakDays,
          lastWorkoutDay: workout.dayKey,
          spotBonusClaimed: Array.from(claimed)
        }

        // Badges.
        const badges = { ...state.badges }
        const badgesUnlocked: BadgeDef[] = []
        const ctx = { workouts, player, quests, level: levelAfter }
        for (const b of BADGES) {
          if (!badges[b.id] && b.check(ctx)) {
            badges[b.id] = new Date().toISOString()
            badgesUnlocked.push(b)
          }
        }

        set({ ...touch(), player, workouts, quests, badges })

        return {
          xpBase,
          xpQuests,
          xpSpotBonus,
          bonusPercent,
          xpTotal: xpBase + xpQuests + xpSpotBonus,
          levelBefore,
          levelAfter,
          statLevelUps,
          records,
          questsCompleted,
          badgesUnlocked,
          streakDays,
          totalReps: workout.sets.reduce((a, s) => a + (s.reps ?? 0), 0),
          durationSec: workout.durationSec,
          setCount: workout.sets.length
        }
      },

      replaceAll: (data) => {
        const clean: Partial<AppState> = {}
        if (data.player && typeof data.player === 'object') {
          clean.player = { ...initialState.player, ...data.player }
        }
        if (Array.isArray(data.workouts)) clean.workouts = data.workouts
        if (Array.isArray(data.routines)) clean.routines = data.routines
        if (data.weekPlan && typeof data.weekPlan === 'object') {
          clean.weekPlan = { ...initialWeekPlan(), ...data.weekPlan }
        }
        if (Array.isArray(data.spots)) clean.spots = data.spots
        if (Array.isArray(data.reviews)) clean.reviews = data.reviews
        if (Array.isArray(data.quests)) clean.quests = data.quests
        if (data.badges && typeof data.badges === 'object') clean.badges = data.badges
        if (data.settings && typeof data.settings === 'object') {
          clean.settings = { ...initialState.settings, ...data.settings }
        }
        set({
          ...clean,
          // En restaurant une sauvegarde ou le cloud, on garde son horodatage.
          updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString()
        })
      },

      resetAll: () => set({ ...initialState })
    }),
    {
      name: 'swrpg-v1',
      version: 4,
      // v1 → v2 : horodatage `updatedAt` (comparaison local/cloud).
      // v2 → v3 : routines personnelles (`routines`), valeurs par défaut sinon.
      // v3 → v4 : planning hebdomadaire (`weekPlan`), semaine vide par défaut.
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<AppState>
        return {
          ...initialState,
          ...p,
          player: { ...initialState.player, ...(p.player ?? {}) }
        } as unknown as AppState & Actions
      }
    }
  )
)

export function currentDayKey(): string {
  return dayKey()
}
