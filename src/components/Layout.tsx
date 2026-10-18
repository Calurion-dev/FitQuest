import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { logError } from '../lib/errors'
import { currentDayKey, useStore } from '../store/useStore'
import { useUndo } from '../store/undo'

const TABS = [
  { to: '/', label: 'Héros', icon: '🦸' },
  { to: '/workout', label: 'Séance', icon: '💪' },
  { to: '/routines', label: 'Routines', icon: '📋' },
  { to: '/wods', label: 'WODs', icon: '📚' },
  { to: '/map', label: 'Spots', icon: '🗺️' },
  { to: '/bodygraph', label: 'Body graph', short: 'Muscles', icon: '🧍' },
  { to: '/progress', label: 'Progrès', icon: '📈' },
  { to: '/leaderboard', label: 'Classement', short: 'Rangs', icon: '🏆' },
  { to: '/settings', label: 'Réglages', icon: '⚙️' }
]

function Logo({ size = 'text-2xl' }: { size?: string }) {
  return (
    <span className={`font-display ${size} leading-none tracking-tight`}>
      FIT<span className="text-volt">QUEST</span>
    </span>
  )
}

function secondsToClock(total: number): string {
  const s = Math.max(0, total)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Barre « séance en cours » : retour rapide à la séance, aucune perte en cas de navigation. */
function SessionBar() {
  const draft = useStore((s) => s.draft)
  const navigate = useNavigate()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  if (!draft) return null
  const elapsed = Math.floor((now - draft.startedAt) / 1000)
  return (
    <div className="sticky top-0 z-30 -mt-5 mb-4 flex items-center justify-between gap-3 border-b-2 border-volt bg-ink/95 py-2 backdrop-blur md:-mt-8">
      <span className="truncate text-xs font-bold text-volt">
        💪 Séance en cours · {draft.sets.length} série{draft.sets.length > 1 ? 's' : ''} · ⏱ {secondsToClock(elapsed)}
      </span>
      <button
        className="rounded-lg border-2 border-volt px-3 py-1 text-xs font-bold text-volt transition-colors hover:bg-volt hover:text-ink"
        onClick={() => navigate('/workout')}
      >
        Reprendre
      </button>
    </div>
  )
}

/** Compte à rebours de repos, visible sur tous les écrans sauf la séance. */
function RestBar() {
  const draft = useStore((s) => s.draft)
  const patchDraft = useStore((s) => s.patchDraft)
  const [now, setNow] = useState(Date.now())
  const endsAt = draft?.restEndsAt ?? null
  useEffect(() => {
    if (!endsAt) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [endsAt])
  if (!endsAt || endsAt <= now) return null
  const left = Math.ceil((endsAt - now) / 1000)
  return (
    <div className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-2xl border-2 border-ice/50 bg-panel px-3 py-2 shadow-hard-sm md:bottom-6">
      <span className="hud text-lg font-bold text-ice">{secondsToClock(left)}</span>
      <button
        className="rounded-lg border-2 border-edge px-2.5 py-1 text-[11px] font-bold text-ice"
        onClick={() => patchDraft({ restEndsAt: endsAt + 30000 })}
      >
        +30 s
      </button>
      <button
        className="rounded-lg px-2 py-1 text-[11px] font-semibold text-zinc-500 underline"
        onClick={() => patchDraft({ restEndsAt: null })}
      >
        Passer
      </button>
    </div>
  )
}

function UndoToast() {
  const { label, run, clear } = useUndo()
  useEffect(() => {
    if (!label) return
    const t = setTimeout(() => clear(), 8000)
    return () => clearTimeout(t)
  }, [label, clear])
  if (!label) return null
  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-xl border-2 border-edge bg-panel px-4 py-2.5 shadow-hard-sm">
      <span className="text-xs text-zinc-300">{label}</span>
      <button className="btn btn-volt px-3 py-1 text-xs" onClick={run}>
        Annuler
      </button>
    </div>
  )
}

function UpdateBanner({ visible, onReload, onDismiss }: { visible: boolean; onReload: () => void; onDismiss: () => void }) {
  if (!visible) return null
  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-xl border-2 border-volt bg-panel px-4 py-2.5 shadow-hard-sm">
      <span className="text-xs text-zinc-100">Nouvelle version disponible.</span>
      <button className="btn btn-volt px-3 py-1 text-xs" onClick={onReload}>
        Recharger
      </button>
      <button className="text-xs font-semibold text-zinc-500 underline" onClick={onDismiss}>
        Plus tard
      </button>
    </div>
  )
}

export default function Layout() {
  const location = useLocation()
  const onWorkout = location.pathname.startsWith('/workout')
  const draft = useStore((s) => s.draft)
  const sunMode = useStore((s) => s.settings.sunMode)
  const workouts = useStore((s) => s.workouts)
  const {
    needRefresh: [needRefresh, dismissNeedRefresh],
    updateServiceWorker
  } = useRegisterSW()

  // Mode plein soleil : attribut sur <html>, surchargé en CSS.
  useEffect(() => {
    if (sunMode) document.documentElement.dataset.sun = 'on'
    else delete document.documentElement.dataset.sun
  }, [sunMode])

  // Demande de stockage persistant (best effort, au cas où).
  useEffect(() => {
    navigator.storage?.persist?.().catch(() => undefined)
  }, [])

  // Pastille sur l'icône de l'app : séance du jour à faire.
  useEffect(() => {
    const nav = navigator as Navigator & {
      setAppBadge?: (n?: number) => Promise<void>
      clearAppBadge?: () => Promise<void>
    }
    const done = workouts.some((w) => w.dayKey === currentDayKey())
    const call = done ? nav.clearAppBadge?.() : nav.setAppBadge?.(1)
    call?.catch(() => undefined)
  }, [workouts])

  // Journal d'erreurs local pour le bouton « Signaler un bug ».
  useEffect(() => {
    const onError = (e: ErrorEvent) => logError(`${e.message} @ ${e.filename}:${e.lineno}`)
    const onRejection = (e: PromiseRejectionEvent) => logError(String(e.reason))
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return (
    <div className="min-h-dvh">
      <div className="md:flex">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r-2 border-edge bg-panel/50 md:flex">
          <div className="px-5 pt-6">
            <Logo />
            <div className="tape mt-4 rounded-full" />
            <p className="eyebrow mt-3">Street workout RPG</p>
          </div>
          <nav className="mt-6 flex flex-col gap-1.5 px-3">
            {TABS.map((t, i) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors ${
                    isActive
                      ? 'border-ink bg-volt text-ink shadow-[4px_4px_0_0_var(--color-volt-dim)]'
                      : 'border-transparent text-zinc-400 hover:border-edge hover:bg-panel hover:text-zinc-100'
                  }`
                }
              >
                <span className="hud text-[10px] opacity-60">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-base">{t.icon}</span>
                <span>{t.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto px-5 pb-6 text-[10px] leading-relaxed text-zinc-600">
            Tes données restent sur ton appareil.
            <br />
            Ajoute l'app à ton écran d'accueil ↗
          </div>
        </aside>

        <main className="mx-auto w-full max-w-md px-4 pt-5 pb-28 md:max-w-5xl md:px-8 md:pt-8 md:pb-12 lg:max-w-6xl">
          {!onWorkout && <SessionBar />}
          <Outlet />
        </main>
      </div>

      {/* Pile de notifications en haut : MAJ de l'app + annulation. */}
      <div className="pointer-events-none fixed inset-x-0 top-2 z-50 flex flex-col items-center gap-2 px-4">
        <UpdateBanner
          visible={needRefresh && !draft}
          onReload={() => updateServiceWorker(true)}
          onDismiss={() => dismissNeedRefresh(false)}
        />
        <UndoToast />
      </div>

      {!onWorkout && <RestBar />}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-edge bg-ink/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-md items-stretch gap-0.5 px-1 py-1">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] font-semibold ${
                  isActive ? 'bg-volt text-ink' : 'text-zinc-500'
                }`
              }
            >
              <span className="text-base">{t.icon}</span>
              <span>{t.short ?? t.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
