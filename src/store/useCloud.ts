import type { User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { rankFromXp } from '../game/ranks'
import {
  fetchScores,
  getSessionUserId,
  onAuthChange,
  pullProfile,
  pushProfile,
  pushScore,
  signInWithGoogle,
  signOutCloud,
  type CloudScore
} from '../lib/cloud'
import { isCloudConfigured, supabase } from '../lib/supabase'
import { useStore } from './useStore'
import type { AppData } from '../types'

export interface CloudUser {
  id: string
  email: string | null
  name: string | null
  avatar: string | null
}

export type CloudStatus = 'disabled' | 'signedOut' | 'syncing' | 'synced' | 'error'

interface CloudState {
  user: CloudUser | null
  status: CloudStatus
  message: string | null
  lastSyncAt: string | null
  scores: CloudScore[]
  init: () => void
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  /** Synchronisation intelligente : le plus récent gagne. */
  syncNow: () => Promise<void>
  /** Force l'envoi des données locales vers le cloud. */
  pushNow: () => Promise<void>
  /** Force le remplacement des données locales par celles du cloud. */
  pullNow: () => Promise<void>
  loadScores: () => Promise<void>
}

function mapUser(u: User): CloudUser {
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>
  return {
    id: u.id,
    email: u.email ?? null,
    name: (meta.full_name as string) || (meta.name as string) || null,
    avatar: (meta.avatar_url as string) || null
  }
}

/** Extrait du store local la charge utile à synchroniser. */
function localData(): AppData {
  const { updatedAt, player, workouts, routines, spots, reviews, quests, badges, settings } = useStore.getState()
  return { updatedAt, player, workouts, routines, spots, reviews, quests, badges, settings }
}

let initialized = false
let pushTimer: ReturnType<typeof setTimeout> | null = null

export const useCloud = create<CloudState>()((set, get) => ({
  user: null,
  status: isCloudConfigured ? 'signedOut' : 'disabled',
  message: null,
  lastSyncAt: null,
  scores: [],

  init: () => {
    if (initialized) return
    initialized = true
    if (!supabase) return

    // Session déjà présente (retour de Google ou onglet rouvert).
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) return
      set({ user: mapUser(data.session.user) })
      void get().syncNow()
    })

    onAuthChange(() => {
      void supabase!.auth.getSession().then(({ data }) => {
        const u = data.session?.user
        if (!u) {
          set({ user: null, status: 'signedOut', scores: [] })
          return
        }
        set({ user: mapUser(u) })
        void get().syncNow()
      })
    })

    // Envoi automatique (debounce) après chaque modification des données.
    useStore.subscribe((state, prev) => {
      if (state.updatedAt === prev.updatedAt) return
      if (!get().user) return
      if (pushTimer) clearTimeout(pushTimer)
      pushTimer = setTimeout(() => void get().pushNow(), 2500)
    })
  },

  signIn: async () => {
    set({ status: 'syncing', message: null })
    try {
      await signInWithGoogle()
    } catch (e) {
      set({ status: 'error', message: (e as Error).message })
    }
  },

  signOut: async () => {
    try {
      await signOutCloud()
    } finally {
      set({ user: null, status: 'signedOut', scores: [], message: null })
    }
  },

  syncNow: async () => {
    const user = get().user
    if (!user || !isCloudConfigured) return
    set({ status: 'syncing', message: null })
    try {
      const remote = await pullProfile(user.id)
      const local = localData()

      if (!remote) {
        await pushProfile(user.id, local)
        await pushScore(user.id, local.player.pseudo || 'Joueur', local.player.xpTotal, rankFromXp(local.player.xpTotal).name)
        set({
          status: 'synced',
          lastSyncAt: new Date().toISOString(),
          message: 'Données locales sauvegardées dans le cloud'
        })
        return
      }

      const localNewer = new Date(local.updatedAt).getTime() > new Date(remote.updatedAt).getTime()
      if (localNewer) {
        await pushProfile(user.id, local)
        await pushScore(user.id, local.player.pseudo || 'Joueur', local.player.xpTotal, rankFromXp(local.player.xpTotal).name)
        set({
          status: 'synced',
          lastSyncAt: new Date().toISOString(),
          message: 'Synchronisé (tes données locales étaient plus récentes)'
        })
      } else {
        useStore.getState().replaceAll({ ...remote.data, updatedAt: remote.updatedAt })
        set({
          status: 'synced',
          lastSyncAt: new Date().toISOString(),
          message: 'Données récupérées depuis le cloud'
        })
      }
      void get().loadScores()
    } catch (e) {
      set({ status: 'error', message: (e as Error).message })
    }
  },

  pushNow: async () => {
    const user = get().user
    if (!user || !isCloudConfigured) return
    set({ status: 'syncing' })
    try {
      const data = localData()
      await pushProfile(user.id, data)
      await pushScore(user.id, data.player.pseudo || 'Joueur', data.player.xpTotal, rankFromXp(data.player.xpTotal).name)
      set({ status: 'synced', lastSyncAt: new Date().toISOString(), message: null })
      void get().loadScores()
    } catch (e) {
      set({ status: 'error', message: (e as Error).message })
    }
  },

  pullNow: async () => {
    const user = get().user
    if (!user || !isCloudConfigured) return
    set({ status: 'syncing', message: null })
    try {
      const remote = await pullProfile(user.id)
      if (remote) {
        useStore.getState().replaceAll({ ...remote.data, updatedAt: remote.updatedAt })
        set({ status: 'synced', lastSyncAt: new Date().toISOString(), message: 'Données récupérées depuis le cloud' })
      } else {
        set({ status: 'synced', message: 'Aucune sauvegarde trouvée dans le cloud' })
      }
    } catch (e) {
      set({ status: 'error', message: (e as Error).message })
    }
  },

  loadScores: async () => {
    if (!isCloudConfigured) return
    const me = (await getSessionUserId()) ?? get().user?.id
    if (!me) return
    try {
      set({ scores: await fetchScores(50) })
    } catch {
      // Le classement est secondaire : on ignore silencieusement les erreurs.
    }
  }
}))
