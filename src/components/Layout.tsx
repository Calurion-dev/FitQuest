import { NavLink, Outlet } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Héros', icon: '🦸' },
  { to: '/workout', label: 'Séance', icon: '💪' },
  { to: '/map', label: 'Spots', icon: '🗺️' },
  { to: '/progress', label: 'Progrès', icon: '📈' },
  { to: '/settings', label: 'Réglages', icon: '⚙️' }
]

export default function Layout() {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <main className="mx-auto w-full max-w-md px-4 pt-5 pb-28">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div
          className="mx-auto flex max-w-md items-stretch"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-zinc-500'
                }`
              }
            >
              <span className="text-xl leading-none">{t.icon}</span>
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
