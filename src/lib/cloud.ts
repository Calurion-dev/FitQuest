import { supabase, authRedirectUrl } from './supabase'
import type { AppData } from '../types'

const PROFILES = 'fitquest_profiles'
const SCORES = 'fitquest_scores'

export interface CloudProfile {
  data: AppData
  updatedAt: string
}

export interface CloudScore {
  userId: string
  pseudo: string
  xp: number
  rank: string
  updatedAt: string
}

export async function signInWithGoogle(): Promise<void> {
  if (!supabase) throw new Error('Cloud non configuré')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authRedirectUrl(),
      queryParams: { prompt: 'select_account' }
    }
  })
  if (error) throw error
}

export async function signOutCloud(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getSessionUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}

export function onAuthChange(cb: () => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange(() => cb())
  return () => data.subscription.unsubscribe()
}

export async function pullProfile(userId: string): Promise<CloudProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from(PROFILES)
    .select('data, updated_at')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return { data: data.data as AppData, updatedAt: data.updated_at as string }
}

export async function pushProfile(userId: string, data: AppData): Promise<string> {
  if (!supabase) throw new Error('Cloud non configuré')
  const updatedAt = new Date().toISOString()
  const { error } = await supabase
    .from(PROFILES)
    .upsert({ id: userId, data, updated_at: updatedAt })
  if (error) throw new Error(error.message)
  return updatedAt
}

/** Ligne publique du classement (pseudo + XP uniquement, pas de données perso). */
export async function pushScore(userId: string, pseudo: string, xp: number, rank: string): Promise<void> {
  if (!supabase) return
  await supabase
    .from(SCORES)
    .upsert({ user_id: userId, pseudo, xp, rank, updated_at: new Date().toISOString() })
}

export async function fetchScores(limit = 50): Promise<CloudScore[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from(SCORES)
    .select('user_id, pseudo, xp, rank, updated_at')
    .order('xp', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    userId: row.user_id as string,
    pseudo: row.pseudo as string,
    xp: row.xp as number,
    rank: row.rank as string,
    updatedAt: row.updated_at as string
  }))
}
