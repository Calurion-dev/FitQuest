import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FAMILY_LABELS, MOVEMENTS, SPOT_TYPE_META, STAT_META, movementById } from '../data/movements'
import { setXp } from '../game/engine'
import { dayKey, formatDuration } from '../lib/date'
import { uid } from '../lib/id'
import { useStore } from '../store/useStore'
import type { LootSummary, Workout, WorkoutSet } from '../types'

const TEMPLATES: { id: string; label: string; icon: string; movements: string[] }[] = [
  { id: 'push', label: 'Push', icon: '💪', movements: ['pompes', 'pompes_larges', 'pompes_diamant', 'dips'] },
  { id: 'pull', label: 'Pull', icon: '🧗', movements: ['australiennes', 'tractions_pronation', 'tractions_supination'] },
  { id: 'legs', label: 'Jambes', icon: '🦵', movements: ['pistol_assiste', 'pistol', 'squat_saute'] },
  { id: 'full', label: 'Full body', icon: '🔥', movements: ['pompes', 'dips', 'australiennes', 'pistol_assiste', 'gainage'] },
  { id: 'libre', label: 'Libre', icon: '🎯', movements: MOVEMENTS.map((m) => m.id) }
]

type Phase = 'setup' | 'active' | 'done'

function secondsToClock(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function WorkoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialSpotId = (location.state as { spotId?: string } | null)?.spotId
  const spots = useStore((s) => s.spots)
  const workouts = useStore((s) => s.workouts)
  const settings = useStore((s) => s.settings)
  const finishWorkout = useStore((s) => s.finishWorkout)

  const [phase, setPhase] = useState<Phase>('setup')
  const [templateId, setTemplateId] = useState('full')
  const [selected, setSelected] = useState<string[]>(TEMPLATES[3].movements)
  const [spotId, setSpotId] = useState<string | undefined>(initialSpotId)
  const [sets, setSets] = useState<WorkoutSet[]>([])
  const [current, setCurrent] = useState<string>(TEMPLATES[3].movements[0])
  const [amount, setAmount] = useState(10)
  const [startedAt, setStartedAt] = useState(0)
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [loot, setLoot] = useState<LootSummary | null>(null)

  useEffect(() => {
    if (phase !== 'active') return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [phase])

  const liveXp = useMemo(() => sets.reduce((a, s) => a + setXp(s), 0), [sets])
  const currentMovement = movementById(current)
  const spot = spots.find((s) => s.id === spotId)
  const elapsed = phase === 'active' ? Math.floor((now - startedAt) / 1000) : 0
  const restLeft = restEndsAt ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : null

  const chooseTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id)
    if (!t) return
    setTemplateId(id)
    setSelected(t.movements)
    setCurrent(t.movements[0])
    const m = movementById(t.movements[0])
    setAmount(m?.isHold ? 30 : 10)
  }

  const toggleMovement = (id: string) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      if (!next.includes(current) && next.length) {
        setCurrent(next[0])
        const m = movementById(next[0])
        setAmount(m?.isHold ? 30 : 10)
      }
      return next
    })
  }

  const pickMovement = (id: string) => {
    setCurrent(id)
    const m = movementById(id)
    setAmount(m?.isHold ? 30 : 10)
  }

  const start = () => {
    if (!selected.length) return
    setSets([])
    setLoot(null)
    setStartedAt(Date.now())
    setNow(Date.now())
    setRestEndsAt(null)
    pickMovement(selected[0])
    setPhase('active')
  }

  const validateSet = () => {
    const m = movementById(current)
    if (!m) return
    const s: WorkoutSet = m.isHold
      ? { id: uid(), movementId: current, seconds: amount }
      : { id: uid(), movementId: current, reps: amount }
    setSets((prev) => [...prev, s])
    setRestEndsAt(Date.now() + settings.restSec * 1000)
  }

  const finish = () => {
    if (!sets.length) return
    const durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    const workout: Workout = {
      id: uid(),
      date: new Date().toISOString(),
      dayKey: dayKey(),
      spotId,
      durationSec,
      sets,
      xp: liveXp
    }
    const summary = finishWorkout(workout)
    setRestEndsAt(null)
    setLoot(summary)
    setPhase('done')
  }

  const restart = () => {
    setPhase('setup')
    setSets([])
    setLoot(null)
    setStartedAt(0)
    setRestEndsAt(null)
  }

  // ---------- Écran LOOT ----------
  if (phase === 'done' && loot) {
    return (
      <div className="animate-floaty space-y-4">
        <div className="text-center">
          <div className="text-5xl">🏆</div>
          <h1 className="mt-2 text-2xl font-black">Séance terminée</h1>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
          <div className="text-4xl font-black text-emerald-400">+{loot.xpTotal} XP</div>
          <div className="mt-3 space-y-1 text-left text-xs text-zinc-300">
            <div className="flex justify-between">
              <span>Séries ({loot.setCount})</span>
              <span>+{loot.xpBase} XP</span>
            </div>
            {loot.xpQuests > 0 && (
              <div className="flex justify-between">
                <span>Quêtes accomplies</span>
                <span>+{loot.xpQuests} XP</span>
              </div>
            )}
            {loot.xpSpotBonus > 0 && (
              <div className="flex justify-between">
                <span>Bonus explorateur (nouveau spot)</span>
                <span>+{loot.xpSpotBonus} XP</span>
              </div>
            )}
            {loot.bonusPercent > 0 && (
              <div className="flex justify-between text-emerald-300">
                <span>Bonus régularité inclus</span>
                <span>+{loot.bonusPercent}%</span>
              </div>
            )}
          </div>
        </div>

        {loot.levelAfter > loot.levelBefore && (
          <div className="animate-pop rounded-2xl border border-purple-500/40 bg-purple-600/20 p-4 text-center">
            <div className="text-3xl">⬆️</div>
            <div className="text-lg font-black text-purple-300">
              Niveau {loot.levelAfter} atteint !
            </div>
          </div>
        )}

        {loot.statLevelUps.map((s) => (
          <div key={s.stat} className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm">
            {STAT_META[s.stat].icon} {STAT_META[s.stat].label} passe niveau {s.after}
          </div>
        ))}

        {loot.questsCompleted.map((q) => (
          <div key={q.id} className="rounded-xl border border-emerald-500/30 bg-zinc-900/60 px-3 py-2 text-sm">
            <span className="mr-1">{q.icon}</span>
            Quête accomplie : <span className="font-semibold">{q.title}</span>{' '}
            <span className="text-emerald-400">+{q.rewardXp} XP</span>
          </div>
        ))}

        {loot.badgesUnlocked.map((b) => (
          <div key={b.id} className="animate-pop rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
            <span className="mr-1 text-lg">{b.icon}</span>
            <span className="font-semibold text-amber-300">Badge débloqué : {b.name}</span>
            <div className="text-xs text-zinc-400">{b.description}</div>
          </div>
        ))}

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="text-sm font-black">{formatDuration(loot.durationSec)}</div>
            <div className="text-[10px] text-zinc-500">durée</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="text-sm font-black">{loot.totalReps}</div>
            <div className="text-[10px] text-zinc-500">répétitions</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="text-sm font-black text-orange-400">🔥 {loot.streakDays} j</div>
            <div className="text-[10px] text-zinc-500">streak</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={restart}
            className="rounded-2xl border border-zinc-700 bg-zinc-900 py-3 font-bold text-zinc-200"
          >
            Nouvelle séance
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-2xl bg-emerald-500 py-3 font-bold text-zinc-950"
          >
            Retour au héros
          </button>
        </div>
      </div>
    )
  }

  // ---------- Écran SETUP ----------
  if (phase === 'setup') {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-black">Nouvelle séance</h1>
        {spot && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {SPOT_TYPE_META[spot.type].icon} Spot sélectionné : <span className="font-semibold">{spot.name}</span>
          </div>
        )}

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">Type de séance</h2>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => chooseTemplate(t.id)}
                className={`rounded-xl border px-2 py-3 text-center text-xs font-semibold transition-colors ${
                  templateId === t.id
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                }`}
              >
                <div className="text-xl">{t.icon}</div>
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
            Mouvements ({selected.length})
          </h2>
          <div className="space-y-2">
            {MOVEMENTS.map((m) => {
              const on = selected.includes(m.id)
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMovement(m.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    on ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900/60 opacity-60'
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{m.name}</span>
                    <span className="block text-[11px] text-zinc-500">
                      {FAMILY_LABELS[m.family]} · {m.coeff} XP/{m.isHold ? 'sec' : 'rep'}
                    </span>
                  </span>
                  <span className={`text-lg ${on ? 'text-emerald-400' : 'text-zinc-600'}`}>{on ? '✓' : '+'}</span>
                </button>
              )
            })}
          </div>
        </section>

        {spots.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">Spot (optionnel)</h2>
            <select
              value={spotId ?? ''}
              onChange={(e) => setSpotId(e.target.value || undefined)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-base outline-none focus:border-emerald-500"
            >
              <option value="">Aucun spot</option>
              {spots.map((s) => (
                <option key={s.id} value={s.id}>
                  {SPOT_TYPE_META[s.type].icon} {s.name}
                </option>
              ))}
            </select>
          </section>
        )}

        <button
          disabled={!selected.length}
          onClick={start}
          className="w-full rounded-2xl bg-emerald-500 py-4 text-base font-bold text-zinc-950 disabled:opacity-40"
        >
          ▶️ Démarrer la séance
        </button>
      </div>
    )
  }

  // ---------- Écran ACTIVE ----------
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-mono text-lg font-bold text-zinc-200">⏱ {secondsToClock(elapsed)}</span>
        <span className="font-bold text-emerald-400">+{liveXp} XP</span>
        {spot && <span className="text-xs text-zinc-500">{SPOT_TYPE_META[spot.type].icon} {spot.name}</span>}
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {selected.map((id) => {
          const m = movementById(id)
          if (!m) return null
          const count = sets.filter((s) => s.movementId === id).length
          return (
            <button
              key={id}
              onClick={() => pickMovement(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold ${
                current === id ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
              }`}
            >
              {m.emoji} {m.name}
              {count > 0 && <span className="rounded-full bg-zinc-800 px-1.5 text-[10px]">{count}</span>}
            </button>
          )
        })}
      </div>

      {currentMovement && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-center">
          <div className="text-3xl">{currentMovement.emoji}</div>
          <div className="mt-1 text-sm font-semibold text-zinc-300">{currentMovement.name}</div>
          <div className="my-2 text-6xl font-black tabular-nums text-zinc-50">{amount}</div>
          <div className="text-[11px] uppercase tracking-widest text-zinc-500">
            {currentMovement.isHold ? 'secondes' : 'répétitions'}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[-5, -1, 1, 5].map((d) => (
              <button
                key={d}
                onClick={() => setAmount((a) => Math.max(1, Math.min(600, a + d)))}
                className="rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-base font-bold text-zinc-100 active:bg-zinc-700"
              >
                {d > 0 ? `+${d}` : d}
              </button>
            ))}
          </div>
          <button
            onClick={validateSet}
            className="mt-3 w-full rounded-2xl bg-emerald-500 py-4 text-base font-bold text-zinc-950 active:scale-[0.98] transition-transform"
          >
            ✓ Valider la série
          </button>
        </div>
      )}

      {restLeft !== null && (
        <div className="animate-floaty rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-center">
          {restLeft > 0 ? (
            <>
              <div className="text-[11px] uppercase tracking-widest text-sky-300">Repos</div>
              <div className="font-mono text-4xl font-black text-sky-200">{restLeft}s</div>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  onClick={() => setRestEndsAt((e) => (e ? e + 30000 : e))}
                  className="rounded-xl border border-sky-500/40 px-4 py-2 text-sm font-semibold text-sky-200"
                >
                  +30s
                </button>
                <button
                  onClick={() => setRestEndsAt(null)}
                  className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-zinc-950"
                >
                  Passer
                </button>
              </div>
            </>
          ) : (
            <button onClick={() => setRestEndsAt(null)} className="w-full text-base font-black text-emerald-300">
              💥 C'est reparti !
            </button>
          )}
        </div>
      )}

      {sets.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
            Séries ({sets.length})
          </h2>
          <div className="space-y-1.5">
            {sets.map((s, i) => {
              const m = movementById(s.movementId)
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm">
                  <span className="text-xs text-zinc-500">#{i + 1}</span>
                  <span>{m?.emoji}</span>
                  <span className="flex-1 font-medium">{m?.name}</span>
                  <span className="font-bold tabular-nums">
                    {s.reps ?? s.seconds}
                    {m?.isHold ? 's' : ''}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">+{setXp(s)} XP</span>
                  <button
                    onClick={() => setSets((prev) => prev.filter((x) => x.id !== s.id))}
                    className="text-zinc-600 hover:text-red-400"
                    aria-label="Supprimer la série"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <button
        disabled={!sets.length}
        onClick={finish}
        className="w-full rounded-2xl bg-zinc-100 py-4 text-base font-black text-zinc-950 disabled:opacity-40"
      >
        🏁 Terminer la séance
      </button>
      <button onClick={restart} className="w-full py-2 text-xs text-zinc-500">
        Abandonner la séance (rien ne sera enregistré)
      </button>
    </div>
  )
}
