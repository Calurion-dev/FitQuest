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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Progression</h1>

      <section className="grid grid-cols-4 gap-2 text-center">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
          <div className="text-lg font-black">{levelInfo(player.xpTotal).level}</div>
          <div className="text-[10px] text-zinc-500">niveau</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
          <div className="text-lg font-black">{workouts.length}</div>
          <div className="text-[10px] text-zinc-500">séances</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
          <div className="text-lg font-black">{totalReps(workouts).toLocaleString('fr-FR')}</div>
          <div className="text-[10px] text-zinc-500">reps</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
          <div className="text-lg font-black">{visitedSpots(workouts).length}</div>
          <div className="text-[10px] text-zinc-500">spots</div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
          Volume par semaine (répétitions)
        </h2>
        <BarChart data={weeks} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">Par mouvement</h2>
        <div className="space-y-2">
          {MOVEMENTS.map((m) => {
            const totals = movementTotals(workouts, m.id)
            if (totals.total === 0) return null
            const info = levelInfo(movementXp(workouts, m.id), SUB_XP_BASE)
            const series = bestSetSeries(workouts, m.id)
            return (
              <div key={m.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{m.emoji}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{m.name}</span>
                    <span className="block text-[11px] text-zinc-500">{FAMILY_LABELS[m.family]}</span>
                  </span>
                  <span className="rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-bold text-sky-300">
                    Nv {info.level}
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline gap-4 text-xs text-zinc-400">
                  <span>
                    Total <span className="font-bold text-zinc-200">{totals.total.toLocaleString('fr-FR')}</span>
                    {m.isHold ? 's' : ''}
                  </span>
                  <span>
                    Record <span className="font-bold text-amber-300">{totals.best}</span>
                    {m.isHold ? 's' : ''}
                  </span>
                </div>
                <div className="mt-2">
                  <Sparkline points={series} />
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full rounded-full bg-sky-500/80" style={{ width: `${info.pct}%` }} />
                </div>
              </div>
            )
          })}
          {workouts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
              Aucune séance enregistrée. Lance-toi ! 💪
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
          Badges ({Object.keys(badges).length}/{BADGES.length})
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {BADGES.map((b) => {
            const unlocked = Boolean(badges[b.id])
            return (
              <div
                key={b.id}
                className={`rounded-xl border p-3 text-center ${
                  unlocked ? 'border-amber-500/40 bg-amber-500/10' : 'border-zinc-800 bg-zinc-900/40 opacity-45'
                }`}
              >
                <div className="text-2xl">{unlocked ? b.icon : '🔒'}</div>
                <div className="mt-1 text-[11px] font-bold leading-tight">{b.name}</div>
                <div className="mt-0.5 text-[9px] leading-tight text-zinc-500">{b.description}</div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
