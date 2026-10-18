import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BADGES } from '../game/badges'
import { challengeById, challengeDoneDays } from '../game/challenges'
import {
  SPOT_BONUS_XP,
  SUB_XP_BASE,
  activeBonusPercent,
  countsForMetrics,
  isPrEligible,
  levelFromXp,
  movement,
  movementTotals,
  questProgress,
  setAmount,
  setXp,
  statForFamily
} from '../game/engine'
import { DIVISIONS, leagueOutcome, leagueRows } from '../game/league'
import { ensureQuests } from '../game/quests'
import { WOD_OF_DAY_BONUS, wodOfDay } from '../game/wodOfDay'
import { addDaysToKey, dayKey, previousDayKey, weekKey } from '../lib/date'
import { uid } from '../lib/id'
import type {
  AppData,
  BadgeDef,
  DayPlan,
  LootSummary,
  Quest,
  Review,
  Routine,
  Settings,
  Spot,
  StatKey,
  WeekDay,
  Workout,
  WorkoutDraft
} from '../types'
import { useUndo } from './undo'

export type AppState = AppData

const touch = () => ({ updatedAt: new Date().toISOString() })

function initialWeekPlan(): Record<WeekDay, DayPlan> {
  return {
    mon: { rest: false, routineIds: [] },
    tue: { rest: false, routineIds: [] },
    wed: { rest: false, routineIds: [] },
    thu: { rest: false, routineIds: [] },
    fri: { rest: false, routineIds: [] },
    sat: { rest: false, routineIds: [] },
    sun: { rest: false, routineIds: [] }
  }
}

const initialState: AppState = {
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
  settings: {
    restSec: 90,
    sound: 'normal',
    wakeLock: true,
    sunMode: false,
    postStretch: true,
    warmup: true,
    units: 'kg'
  },
  favorites: [],
  draft: null
}

interface Actions {
  setPseudo: (pseudo: string) => void
  setSettings: (patch: Partial<Settings>) => void
  ensureQuests: () => void
  /** Réglage hebdo de la ligue (promotion/relégation), à appeler à l'ouverture. */
  settleLeague: () => void
  dismissLeagueResult: () => void
  acceptWager: (stake: number) => void
  /** Clôture un pari dont un jour a été manqué, à appeler à l'ouverture. */
  settleWager: () => void
  dismissWager: () => void
  startChallenge: (id: string) => void
  abandonChallenge: () => void
  acceptDeload: () => void
  dismissDeload: () => void
  markReportSeen: (week: string) => void
  finishWorkout: (workout: Workout) => LootSummary
  addSpot: (data: Omit<Spot, 'id' | 'createdAt'>) => Spot
  deleteSpot: (id: string) => void
  addReview: (data: Omit<Review, 'id' | 'date'>) => void
  saveRoutine: (routine: Routine) => void
  deleteRoutine: (id: string) => void
  setDayPlan: (day: WeekDay, patch: Partial<DayPlan>) => void
  replaceAll: (data: Partial<AppData>) => void
  resetAll: () => void
  startDraft: (draft: WorkoutDraft) => void
  patchDraft: (patch: Partial<WorkoutDraft>) => void
  clearDraft: () => void
  removeDraftSet: (setId: string) => void
  toggleFavorite: (wodId: string) => void
}

export const useStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPseudo: (pseudo) => set((s) => ({ ...touch(), player: { ...s.player, pseudo } })),

      setSettings: (patch) => set((s) => ({ ...touch(), settings: { ...s.settings, ...patch } })),

      ensureQuests: () => set((s) => ({ quests: ensureQuests(s.quests) })),

      settleLeague: () => {
        const s = get()
        const wk = weekKey()
        const league = s.player.league
        if (!league) {
          set((st) => ({ ...touch(), player: { ...st.player, league: { division: 0, weekKey: wk } } }))
          return
        }
        if (league.weekKey === wk) return
        const rows = leagueRows(league.division, league.weekKey, s.workouts, s.player.pseudo)
        const outcome = leagueOutcome(rows, league.division)
        const division =
          outcome === 'promoted'
            ? Math.min(league.division + 1, DIVISIONS.length - 1)
            : outcome === 'demoted'
              ? Math.max(league.division - 1, 0)
              : league.division
        set((st) => ({
          ...touch(),
          player: { ...st.player, league: { division, weekKey: wk, lastResult: outcome, resultSeen: false } }
        }))
      },

      dismissLeagueResult: () =>
        set((s) =>
          s.player.league ? { player: { ...s.player, league: { ...s.player.league, resultSeen: true } } } : {}
        ),

      acceptWager: (stake) =>
        set((s) => {
          const p = s.player
          if (p.wager?.result === 'active') return {}
          const amount = Math.min(stake, p.xpTotal)
          if (amount <= 0) return {}
          return {
            ...touch(),
            player: {
              ...p,
              xpTotal: p.xpTotal - amount,
              wager: { startDay: dayKey(), stake: amount, days: 0, lastDay: dayKey(), result: 'active' }
            }
          }
        }),

      settleWager: () =>
        set((s) => {
          const w = s.player.wager
          if (!w || w.result !== 'active') return {}
          // Un jour entier est passé sans séance : pari perdu.
          if (dayKey() > addDaysToKey(w.lastDay, 1)) {
            return { ...touch(), player: { ...s.player, wager: { ...w, result: 'lost' } } }
          }
          return {}
        }),

      dismissWager: () => set((s) => ({ player: { ...s.player, wager: undefined } })),

      startChallenge: (id) =>
        set((s) => ({ ...touch(), player: { ...s.player, challenge: { id, startedDay: dayKey(), awarded: [] } } })),

      abandonChallenge: () => set((s) => ({ ...touch(), player: { ...s.player, challenge: undefined } })),

      acceptDeload: () => set((s) => ({ ...touch(), player: { ...s.player, lastDeloadWeekKey: weekKey() } })),

      dismissDeload: () => set((s) => ({ ...touch(), player: { ...s.player, deloadDismissedWeek: weekKey() } })),

      markReportSeen: (week) => set((s) => ({ player: { ...s.player, lastReportWeekKey: week } })),

      finishWorkout: (workout) => {
        const state = get()
        const bonusPercent = activeBonusPercent([workout, ...state.workouts])
        const xpBase = workout.sets.reduce((acc, s) => acc + setXp(s, bonusPercent), 0)
        const workouts = [workout, ...state.workouts]

        // Records personnels — séries éligibles uniquement, et rien ne bat de record en semaine allégée.
        const records: LootSummary['records'] = []
        if (!workout.deload) {
          for (const s of workout.sets) {
            const m = movement(s.movementId)
            if (!m || !isPrEligible(s)) continue
            const previous = movementTotals(state.workouts, s.movementId).best
            const value = setAmount(s)
            const already = records.find((r) => r.movementId === s.movementId)
            if (previous > 0 && value > Math.max(previous, already?.value ?? 0)) {
              if (already) {
                already.value = value
              } else {
                records.push({ movementId: s.movementId, value, previous, isHold: Boolean(m.isHold) })
              }
            }
          }
        }

        // Quêtes validées par cette séance.
        let xpQuests = 0
        const quests = state.quests.map((q) => {
          if (!q.claimed && questProgress(q, workouts) >= q.target) {
            xpQuests += q.rewardXp
            return { ...q, claimed: true }
          }
          return q
        })
        const questsCompleted = quests.filter((q) => !state.quests.find((o) => o.id === q.id)?.claimed && q.claimed)

        // Bonus explorateur : une fois par spot.
        let xpSpotBonus = 0
        const spotBonusClaimed = [...state.player.spotBonusClaimed]
        if (workout.spotId && !spotBonusClaimed.includes(workout.spotId)) {
          xpSpotBonus = SPOT_BONUS_XP
          spotBonusClaimed.push(workout.spotId)
        }

        // WOD du jour : bonus une fois par jour.
        let xpWodBonus = 0
        if (
          workout.wodId &&
          wodOfDay(workout.dayKey).id === workout.wodId &&
          !state.workouts.some((w) => w.dayKey === workout.dayKey && w.wodId === workout.wodId)
        ) {
          xpWodBonus = WOD_OF_DAY_BONUS
        }

        // Défi 21 jours : paliers payés une seule fois.
        let xpChallenge = 0
        let challenge = state.player.challenge
        if (challenge) {
          const def = challengeById(challenge.id)
          if (def) {
            const days = challengeDoneDays(def, challenge.startedDay, workouts)
            const awarded = [...challenge.awarded]
            for (const m of def.milestones) {
              if (days >= m.days && !awarded.includes(m.days)) {
                awarded.push(m.days)
                xpChallenge += m.xp
              }
            }
            if (awarded.length !== challenge.awarded.length) challenge = { ...challenge, awarded }
          }
        }

        // Pari de régularité : jours consécutifs, gain à 7 jours.
        let wager = state.player.wager
        let xpWager = 0
        if (wager && wager.result === 'active') {
          if (workout.dayKey === wager.lastDay) {
            if (wager.days === 0) wager = { ...wager, days: 1 }
          } else if (workout.dayKey === previousDayKey(wager.lastDay)) {
            const days = wager.days + 1
            if (days >= 7) {
              wager = { ...wager, days, lastDay: workout.dayKey, result: 'won' }
              xpWager = wager.stake * 2
            } else {
              wager = { ...wager, days, lastDay: workout.dayKey }
            }
          } else if (workout.dayKey > previousDayKey(wager.lastDay)) {
            wager = { ...wager, result: 'lost' }
          }
        }

        // Stats de famille (hors échauffement).
        const stats = { ...state.player.stats }
        for (const s of workout.sets) {
          if (!countsForMetrics(s)) continue
          const m = movement(s.movementId)
          if (!m) continue
          stats[statForFamily(m.family)] += setAmount(s) * m.coeff
        }

        // Série de jours.
        let streakDays = state.player.streakDays
        if (state.player.lastWorkoutDay !== workout.dayKey) {
          streakDays =
            state.player.lastWorkoutDay === previousDayKey(workout.dayKey) ? state.player.streakDays + 1 : 1
        }

        const xpTotal = state.player.xpTotal + xpBase + xpQuests + xpSpotBonus + xpWodBonus + xpChallenge + xpWager
        const levelBefore = levelFromXp(state.player.xpTotal)
        const levelAfter = levelFromXp(xpTotal)

        const statLevelUps: LootSummary['statLevelUps'] = []
        for (const key of Object.keys(stats) as StatKey[]) {
          const before = levelFromXp(state.player.stats[key], SUB_XP_BASE)
          const after = levelFromXp(stats[key], SUB_XP_BASE)
          if (after > before) statLevelUps.push({ stat: key, before, after })
        }

        const player = {
          ...state.player,
          xpTotal,
          stats,
          streakDays,
          lastWorkoutDay: workout.dayKey,
          spotBonusClaimed,
          wager,
          challenge
        }

        // Badges.
        const badges = { ...state.badges }
        const badgesUnlocked: BadgeDef[] = []
        const ctx = { workouts, player, quests, level: levelAfter, weekPlan: state.weekPlan }
        for (const b of BADGES) {
          if (!badges[b.id] && b.check(ctx)) {
            badges[b.id] = new Date().toISOString()
            badgesUnlocked.push({ id: b.id, name: b.name, description: b.description, icon: b.icon })
          }
        }

        set({ ...touch(), player, workouts, quests, badges, draft: null })

        return {
          xpBase,
          xpQuests,
          xpSpotBonus,
          xpWodBonus,
          xpChallenge,
          xpWager,
          bonusPercent,
          xpTotal: xpBase + xpQuests + xpSpotBonus + xpWodBonus + xpChallenge + xpWager,
          levelBefore,
          levelAfter,
          statLevelUps,
          questsCompleted,
          badgesUnlocked,
          records,
          streakDays,
          totalReps: workout.sets.filter(countsForMetrics).reduce((a, s) => a + (s.reps ?? 0), 0),
          durationSec: workout.durationSec,
          setCount: workout.sets.length
        }
      },

      addSpot: (data) => {
        const spot: Spot = { id: uid(), createdAt: new Date().toISOString(), ...data }
        set((s) => ({ ...touch(), spots: [...s.spots, spot] }))
        return spot
      },

      deleteSpot: (id) => {
        const s = get()
        const spot = s.spots.find((x) => x.id === id)
        if (!spot) return
        const reviews = s.reviews.filter((r) => r.spotId === id)
        set({
          ...touch(),
          spots: s.spots.filter((x) => x.id !== id),
          reviews: s.reviews.filter((r) => r.spotId !== id)
        })
        useUndo.getState().offer('Spot supprimé', () =>
          set((st) => ({ ...touch(), spots: [...st.spots, spot], reviews: [...st.reviews, ...reviews] }))
        )
      },

      addReview: (data) => {
        const review: Review = { id: uid(), date: new Date().toISOString(), ...data }
        set((s) => ({ ...touch(), reviews: [...s.reviews, review] }))
      },

      saveRoutine: (routine) =>
        set((s) => ({
          ...touch(),
          routines: s.routines.some((r) => r.id === routine.id)
            ? s.routines.map((r) => (r.id === routine.id ? routine : r))
            : [...s.routines, routine]
        })),

      deleteRoutine: (id) => {
        const s = get()
        const routine = s.routines.find((r) => r.id === id)
        if (!routine) return
        const previousPlan = s.weekPlan
        const weekPlan = Object.fromEntries(
          Object.entries(s.weekPlan).map(([day, plan]) => [
            day,
            { ...plan, routineIds: plan.routineIds.filter((rid) => rid !== id) }
          ])
        ) as Record<WeekDay, DayPlan>
        set({ ...touch(), routines: s.routines.filter((r) => r.id !== id), weekPlan })
        useUndo.getState().offer('Routine supprimée', () =>
          set((st) => ({ ...touch(), routines: [...st.routines, routine], weekPlan: previousPlan }))
        )
      },

      setDayPlan: (day, patch) =>
        set((s) => ({ ...touch(), weekPlan: { ...s.weekPlan, [day]: { ...s.weekPlan[day], ...patch } } })),

      replaceAll: (data) => {
        const mergePlan = (plan: Partial<Record<WeekDay, DayPlan>> | undefined) =>
          plan && typeof plan === 'object' ? { ...initialWeekPlan(), ...plan } : initialWeekPlan()
        set({
          updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date(0).toISOString(),
          player: {
            ...initialState.player,
            ...(data.player ?? {}),
            stats: { ...initialState.player.stats, ...(data.player?.stats ?? {}) }
          },
          workouts: Array.isArray(data.workouts) ? data.workouts : [],
          routines: Array.isArray(data.routines) ? data.routines : [],
          weekPlan: mergePlan(data.weekPlan),
          spots: Array.isArray(data.spots) ? data.spots : [],
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
          quests: Array.isArray(data.quests) ? data.quests : [],
          badges: data.badges && typeof data.badges === 'object' ? data.badges : {},
          settings: { ...initialState.settings, ...(data.settings ?? {}) },
          favorites: Array.isArray(data.favorites) ? data.favorites : [],
          // Le brouillon de séance ne vient jamais d'une sauvegarde (locale ou cloud).
          draft: null
        })
      },

      resetAll: () => set({ ...initialState, weekPlan: initialWeekPlan() }),

      // Les actions de brouillon ne touchent pas `updatedAt` : pas de synchro cloud pour un état local.
      startDraft: (draft) => set({ draft }),

      patchDraft: (patch) => set((s) => (s.draft ? { draft: { ...s.draft, ...patch } } : {})),

      clearDraft: () => set({ draft: null }),

      removeDraftSet: (setId) => {
        const draft = get().draft
        if (!draft) return
        const index = draft.sets.findIndex((x) => x.id === setId)
        if (index < 0) return
        const removed = draft.sets[index]
        set({ draft: { ...draft, sets: draft.sets.filter((x) => x.id !== setId) } })
        useUndo.getState().offer('Série supprimée', () =>
          set((st) => {
            if (!st.draft || st.draft.sets.some((x) => x.id === setId)) return {}
            const sets = [...st.draft.sets]
            sets.splice(index, 0, removed)
            return { draft: { ...st.draft, sets } }
          })
        )
      },

      toggleFavorite: (wodId) =>
        set((s) => ({
          ...touch(),
          favorites: s.favorites.includes(wodId) ? s.favorites.filter((f) => f !== wodId) : [...s.favorites, wodId]
        }))
    }),
    {
      name: 'swrpg-v1',
      version: 5,
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<AppState>
        // v1→v4 : cf. historique des commentaires de migration dans git.
        // v5 : ligue/pari/défi, favoris, réglages étendus, brouillon de séance (jamais restauré).
        return {
          ...initialState,
          ...p,
          player: {
            ...initialState.player,
            ...(p.player ?? {}),
            stats: { ...initialState.player.stats, ...(p.player?.stats ?? {}) }
          },
          settings: { ...initialState.settings, ...(p.settings ?? {}) },
          weekPlan: { ...initialWeekPlan(), ...(p.weekPlan ?? {}) },
          badges: p.badges && typeof p.badges === 'object' ? p.badges : {},
          favorites: Array.isArray(p.favorites) ? p.favorites : [],
          draft: null
        }
      }
    }
  )
)

export function currentDayKey(): string {
  return dayKey()
}
