import { isCloudConfigured } from '../lib/supabase'
import { useCloud } from '../store/useCloud'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

function sinceText(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `il y a ${h} h`
  return `le ${new Date(iso).toLocaleDateString('fr-FR')}`
}

export function CloudAccount() {
  const user = useCloud((s) => s.user)
  const status = useCloud((s) => s.status)
  const message = useCloud((s) => s.message)
  const lastSyncAt = useCloud((s) => s.lastSyncAt)
  const signIn = useCloud((s) => s.signIn)
  const signOut = useCloud((s) => s.signOut)
  const syncNow = useCloud((s) => s.syncNow)
  const pushNow = useCloud((s) => s.pushNow)
  const pullNow = useCloud((s) => s.pullNow)

  if (!isCloudConfigured) {
    return (
      <section className="card p-4">
        <h2 className="eyebrow mb-2">Compte Google</h2>
        <p className="text-xs leading-relaxed text-mute">
          La sauvegarde en ligne n'est pas activée sur cette version. Pour l'activer : crée un projet
          Supabase, colle les clés dans un fichier <code className="text-volt">.env</code> (voir{' '}
          <code className="text-volt">docs/SUPABASE.md</code>) puis relance{' '}
          <code className="text-volt">npm run deploy</code>. En attendant, tes données restent
          enregistrées sur cet appareil.
        </p>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="card p-4">
        <h2 className="eyebrow mb-2">Compte Google</h2>
        <p className="mb-3.5 text-xs leading-relaxed text-mute">
          Connecte-toi pour retrouver ta progression sur tous tes appareils.
        </p>
        <button
          onClick={() => void signIn()}
          disabled={status === 'syncing'}
          className="btn w-full border-white bg-white py-3.5 text-xs text-zinc-900"
        >
          <GoogleIcon /> Continuer avec Google
        </button>
        {status === 'error' && message && <p className="mt-2 text-xs text-ember">⚠️ {message}</p>}
      </section>
    )
  }

  return (
    <section className="card p-4">
      <h2 className="eyebrow mb-3">Compte Google</h2>
      <div className="flex items-center gap-3">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            referrerPolicy="no-referrer"
            className="h-11 w-11 rounded-full border-2 border-edge"
          />
        ) : (
          <div className="grid h-11 w-11 place-items-center rounded-full border-2 border-edge bg-panel-2 text-lg">
            🦸
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm uppercase">{user.name ?? 'Connecté'}</div>
          <div className="truncate text-[11px] text-mute">{user.email}</div>
        </div>
      </div>

      <div className="hud mt-3 rounded-xl border-2 border-edge bg-ink px-3 py-2 text-xs">
        {status === 'syncing' && <span className="text-ice">⏳ Synchronisation…</span>}
        {status === 'synced' && <span className="text-volt">✓ Synchronisé {sinceText(lastSyncAt)}</span>}
        {status === 'error' && <span className="text-ember">⚠️ {message}</span>}
        {message && status === 'synced' && <div className="mt-1 text-[10px] text-mute">{message}</div>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <button onClick={() => void syncNow()} className="btn py-3 text-[11px]">
          🔄 Synchroniser
        </button>
        <button onClick={() => void pushNow()} className="btn py-3 text-[11px]">
          ⬆️ Envoyer
        </button>
        <button
          onClick={() => {
            if (confirm('Remplacer les données de cet appareil par celles du cloud ?')) void pullNow()
          }}
          className="btn py-3 text-[11px]"
        >
          ⬇️ Récupérer
        </button>
        <button onClick={() => void signOut()} className="btn btn-danger py-3 text-[11px]">
          Déconnexion
        </button>
      </div>
      <p className="mt-2.5 text-[10px] leading-relaxed text-zinc-600">
        Tes données restent aussi enregistrées sur cet appareil : tu peux t'entraîner sans réseau.
      </p>
    </section>
  )
}
