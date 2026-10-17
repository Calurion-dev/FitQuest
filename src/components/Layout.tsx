import { NavLink, Outlet } from 'react-router-dom'

const TABS: { to: string; label: string; short?: string; icon: string }[] = [
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
    <div className={`font-display ${size} leading-none tracking-tight`}>
      FIT<span className="text-volt">QUEST</span>
    </div>
  )
}

export default function Layout() {
  return (
    <div className="min-h-dvh">
      <div className="md:flex">
        {/* Barre latérale — desktop */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r-2 border-edge bg-panel/50 md:flex">
          <div className="px-5 pt-6">
            <Logo />
            <div className="tape mt-4 rounded-full" />
            <div className="eyebrow mt-3">Street workout RPG</div>
          </div>

          <nav className="mt-6 flex flex-col gap-1.5 px-3">
            {TABS.map((t, i) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 font-display text-sm uppercase tracking-wide transition-colors ${
                    isActive
                      ? 'border-ink bg-volt text-ink shadow-[4px_4px_0_0_var(--color-volt-dim)]'
                      : 'border-transparent text-zinc-400 hover:border-edge hover:bg-panel hover:text-zinc-100'
                  }`
                }
              >
                <span className="text-lg leading-none">{t.icon}</span>
                <span className="flex-1">{t.label}</span>
                <span className="hud text-[10px] opacity-50">{String(i + 1).padStart(2, '0')}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto px-5 pb-6">
            <p className="text-[10px] leading-relaxed text-zinc-600">
              Tes données restent sur ton appareil.
              <br />
              Ajoute l'app à ton écran d'accueil ↗
            </p>
          </div>
        </aside>

        {/* Contenu */}
        <main className="mx-auto w-full max-w-md px-4 pt-5 pb-28 md:max-w-5xl md:px-8 md:pt-8 md:pb-12 lg:max-w-6xl">
          <Outlet />
        </main>
      </div>

      {/* Barre d'onglets — mobile */}
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
                `flex flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[9px] font-semibold transition-colors ${
                  isActive ? 'bg-volt text-ink' : 'text-zinc-500'
                }`
              }
            >
              <span className="text-base leading-none">{t.icon}</span>
              {t.short ?? t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
