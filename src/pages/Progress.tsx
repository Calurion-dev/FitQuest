import { useMemo } from 'react'
import { BarChart, Sparkline } from '../components/Charts'
import { FAMILY_LABELS, MOVEMENTS } from '../data/movements'
import {
  SUB_XP_BASE,
  bestSetSeries,
  levelInfo,
  movementTotals,
  movementXp,
  totalReps,
  visitedSpots
} from '../game/engine'
import { BADGES } from '../game/badges'
import { dateFromKey, weekKey } from '../lib/date'
import { useStore } from '../store/useStore'

export default function Progress() {
  const workouts = useStore((s) => s.workouts)
  const badges = useStore((s) => s.badges)
  const player = useStore((s) => s.player)

  const weeks = useMemo(() => {
    const out: { label: string; value: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i * 7)
      const key = weekKey(d)
      const value = workouts
        .filter((w) => weekKey(dateFromKey(w.dayKey)) === key)
        .reduce((a, w) => a + w.sets.reduce((x, s) => x + (s.reps ?? 0), 0), 0)
      out.push({ label: key.slice(-2), value })
    }
    return out
  }, [workouts])

  const unlockedCount = Object.keys(badges).length

  return (
    <div className="space-y-5 md:space-y-6">
      <header>
        <div className="eyebrow">Tableau de bord</div>
        <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">Progression</h1>
      </header>

      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:gap-3">
        <div className="stat">
          <div className="hud text-2xl font-bold">{levelInfo(player.xpTotal).level}</div>
          <div className="eyebrow mt-1">niveau</div>
        </div>
        <div className="stat">
          <div className="hud text-2xl font-bold">{workouts.length}</div>
          <div className="eyebrow mt-1">séances</div>
        </div>
        <div className="stat">
          <div className="hud text-2xl font-bold">{totalReps(workouts).toLocaleString('fr-FR')}</div>
          <div className="eyebrow mt-1">répétitions</div>
        </div>
        <div className="stat">
          <div className="hud text-2xl font-bold">{visitedSpots(workouts).length}</div>
          <div className="eyebrow mt-1">spots</div>
        </div>
      </section>

      <section className="card p-4 md:p-5">
        <h2 className="eyebrow mb-3">Volume par semaine (répétitions)</h2>
        <BarChart data={weeks} />
      </section>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-3 lg:col-span-2">
          <h2 className="eyebrow">Par mouvement</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {MOVEMENTS.map((m) => {
              const totals = movementTotals(workouts, m.id)
              if (totals.total === 0) return null
              const info = levelInfo(movementXp(workouts, m.id), SUB_XP_BASE)
              const series = bestSetSeries(workouts, m.id)
              return (
                <div key={m.id} className="card p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-sm uppercase">{m.name}</span>
                      <span className="eyebrow mt-0.5 block">{FAMILY_LABELS[m.family]}</span>
                    </span>
                    <span className="hud shrink-0 rounded-lg border-2 border-volt/40 bg-volt/10 px-2 py-1 text-[11px] font-bold text-volt">
                      Nv {info.level}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-4 text-xs text-mute">
                    <span>
                      Total{' '}
                      <span className="hud font-bold text-zinc-100">
                        {totals.total.toLocaleString('fr-FR')}
                      </span>
                      {m.isHold ? 's' : ''}
                    </span>
                    <span>
                      Record <span className="hud font-bold text-volt">{totals.best}</span>
                      {m.isHold ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <Sparkline points={series} />
                  </div>
                  <div className="bar mt-2">
                    <div style={{ width: `${info.pct}%` }} />
                  </div>
                </div>
              )
            })}
            {workouts.length === 0 && (
              <div className="card border-dashed p-6 text-center text-sm text-mute md:col-span-2">
                Aucune séance enregistrée. Lance-toi ! 💪
              </div>
            )}
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="eyebrow">
            Badges ({unlockedCount}/{BADGES.length})
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2">
            {BADGES.map((b) => {
              const unlocked = Boolean(badges[b.id])
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl border-2 p-3 text-center ${
                    unlocked
                      ? 'border-volt bg-volt/10 shadow-[4px_4px_0_0_var(--color-volt-dim)]'
                      : 'border-edge bg-panel/60 opacity-45'
                  }`}
                >
                  <div className="text-2xl">{unlocked ? b.icon : '🔒'}</div>
                  <div className="mt-1.5 font-display text-[11px] uppercase leading-tight">{b.name}</div>
                  <div className="mt-1 text-[10px] leading-tight text-mute">{b.description}</div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
