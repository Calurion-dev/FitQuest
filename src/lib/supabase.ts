import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// La synchronisation cloud est optionnelle : sans variables d'environnement,
// l'app reste 100 % locale (ce qu'elle fait déjà) et l'écran Compte explique
// simplement comment l'activer (voir docs/SUPABASE.md).

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isCloudConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isCloudConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // PKCE : le retour de Google arrive en `?code=...` (chaîne de requête),
        // ce qui cohabite bien avec le HashRouter utilisé par l'app.
        flowType: 'pkce',
        detectSessionInUrl: true
      }
    })
  : null

/** URL de retour après connexion Google (racine du site, base comprise). */
export function authRedirectUrl(): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}`
}
