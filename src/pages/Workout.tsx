import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FAMILY_LABELS, MOVEMENTS, SPOT_TYPE_META, STAT_META, movementById } from '../data/movements'
import { setXp } from '../game/engine'
import { dayKey, formatDuration } from '../lib/date'
import { uid } from '../lib/id'
import { useStore } from '../store/useStore'
import type { LootSummary, RoutineItem, Workout, WorkoutSet } from '../types'

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
  const initialSpotId = (location.state as { spotId?: string; routineId?: string } | null)?.spotId
  const initialRoutineId = (location.state as { spotId?: string; routineId?: string } | null)?.routineId
  const spots = useStore((s) => s.spots)
  const workouts = useStore((s) => s.workouts)
  const settings = useStore((s) => s.settings)
  const finishWorkout = useStore((s) => s.finishWorkout)
  const routine = useStore((s) => s.routines).find((r) => r.id === initialRoutineId)

  const [phase, setPhase] = useState<Phase>('setup')
  const [templateId, setTemplateId] = useState('full')
  const [selected, setSelected] = useState<string[]>(TEMPLATES[3].movements)
  const [spotId, setSpotId] = useState<string | undefined>(initialSpotId)
  const [sets, setSets] = useState<WorkoutSet[]>([])
  const [current, setCurrent] = useState<string>(TEMPLATES[3].movements[0])
  const [amount, setAmount] = useState(10)
  const [weight, setWeight] = useState('')
  const [startedAt, setStartedAt] = useState(0)
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [loot, setLoot] = useState<LootSummary | null>(null)
  const [shared, setShared] = useState(false)
  const [targets, setTargets] = useState<Record<string, RoutineItem>>({})

  useEffect(() => {
    if (phase !== 'active') return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [phase])

  // Routine choisie depuis la page Routines : on pré-remplit la séance et ses objectifs.
  useEffect(() => {
    if (!routine) return
    setTemplateId('routine')
    setSelected(routine.items.map((i) => i.movementId))
    setTargets(Object.fromEntries(routine.items.map((i) => [i.movementId, i])))
    const first = routine.items[0]
    if (first) {
      setCurrent(first.movementId)
      setAmount(first.reps)
    }
  }, [routine?.id])

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
    setAmount(targets[id]?.reps ?? (m?.isHold ? 30 : 10))
    // Le lest est propre au mouvement courant, pré-rempli si la routine en définit un.
    const targetKg = targets[id]?.addedKg
    setWeight(targetKg ? String(targetKg) : '')
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
    const addedKg = Number(weight.replace(',', '.')) || 0
    const s: WorkoutSet = m.isHold
      ? { id: uid(), movementId: current, seconds: amount, addedKg: addedKg > 0 ? addedKg : undefined }
      : { id: uid(), movementId: current, reps: amount, addedKg: addedKg > 0 ? addedKg : undefined }
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
    setShared(false)
    setStartedAt(0)
    setRestEndsAt(null)
  }

  // ---------- Écran LOOT ----------
  if (phase === 'done' && loot) {
    const share = async () => {
      const text = [
        '💪 Séance terminée sur FitQuest',
        `+${loot.xpTotal} XP · ${loot.totalReps} reps · ${formatDuration(loot.durationSec)}`,
        `🔥 ${loot.streakDays} jours d'affilée`,
        ...loot.records.map((r) => {
          const m = movementById(r.movementId)
          return `🏅 Record : ${m?.name ?? r.movementId} ${r.value}${r.isHold ? ' s' : ''} (avant ${r.previous})`
        }),
        `Rejoins-moi : ${window.location.origin}${import.meta.env.BASE_URL}`
      ].join('\n')
      try {
        if (navigator.share) await navigator.share({ title: 'FitQuest', text })
        else {
          await navigator.clipboard.writeText(text)
          setShared(true)
        }
      } catch {
        /* partage annulé */
      }
    }

    return (
      <div className="animate-floaty mx-auto max-w-2xl space-y-4">
        <div className="text-center">
          <div className="text-5xl">🏆</div>
          <h1 className="mt-2 text-3xl uppercase">Séance terminée</h1>
        </div>

        <div className="card card-volt relative overflow-hidden p-5 text-center">
          <div className="tape absolute inset-x-0 top-0" />
          <div className="eyebrow mt-2">XP gagné</div>
          <div className="hud mt-1 text-5xl font-bold leading-none">+{loot.xpTotal}</div>
          <div className="mt-4 space-y-1.5 border-t-2 border-dashed border-edge pt-3 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-mute">Séries ({loot.setCount})</span>
              <span className="hud font-bold">+{loot.xpBase} XP</span>
            </div>
            {loot.xpQuests > 0 && (
              <div className="flex justify-between">
                <span className="text-mute">Quêtes accomplies</span>
                <span className="hud font-bold">+{loot.xpQuests} XP</span>
              </div>
            )}
            {loot.xpSpotBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-mute">Bonus explorateur (nouveau spot)</span>
                <span className="hud font-bold">+{loot.xpSpotBonus} XP</span>
              </div>
            )}
            {loot.bonusPercent > 0 && (
              <div className="flex justify-between">
                <span className="text-mute">Bonus régularité inclus</span>
                <span className="hud font-bold">+{loot.bonusPercent}%</span>
              </div>
            )}
          </div>
        </div>

        {loot.levelAfter > loot.levelBefore && (
          <div className="animate-pop card border-volt bg-volt/10 p-4 text-center">
            <div className="text-3xl">⬆️</div>
            <div className="mt-1 font-display text-lg uppercase text-volt">
              Niveau {loot.levelAfter} atteint !
            </div>
          </div>
        )}

        {loot.statLevelUps.map((s) => (
          <div key={s.stat} className="card flex items-center gap-3 px-4 py-3 text-sm">
            <span className="text-lg">{STAT_META[s.stat].icon}</span>
            <span className="flex-1 font-semibold">{STAT_META[s.stat].label}</span>
            <span className="hud text-xs font-bold text-ice">passe niveau {s.after}</span>
          </div>
        ))}

        {loot.records.length > 0 && (
          <div className="animate-pop card border-volt bg-volt/10 px-4 py-3">
            <div className="eyebrow text-volt">Records battus</div>
            {loot.records.map((r) => {
              const m = movementById(r.movementId)
              return (
                <div key={r.movementId} className="mt-1.5 flex items-center gap-2 text-sm">
                  <span className="text-lg">{m?.emoji}</span>
                  <span className="flex-1 truncate font-semibold">{m?.name ?? r.movementId}</span>
                  <span className="hud text-xs font-bold text-volt">
                    {r.value}
                    {r.isHold ? ' s' : ''}
                    <span className="ml-1.5 font-normal text-mute">avant {r.previous}</span>
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {loot.questsCompleted.map((q) => (
          <div key={q.id} className="card flex items-center gap-3 px-4 py-3 text-sm">
            <span className="text-lg">{q.icon}</span>
            <span className="flex-1">
              Quête accomplie : <span className="font-semibold">{q.title}</span>
            </span>
            <span className="hud text-xs font-bold text-volt">+{q.rewardXp} XP</span>
          </div>
        ))}

        {loot.badgesUnlocked.map((b) => (
          <div key={b.id} className="animate-pop card border-volt bg-volt/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{b.icon}</span>
              <span className="font-display text-sm uppercase text-volt">Badge débloqué : {b.name}</span>
            </div>
            <div className="mt-1 text-xs text-mute">{b.description}</div>
          </div>
        ))}

        <div className="grid grid-cols-3 gap-2.5">
          <div className="stat">
            <div className="hud text-sm font-bold">{formatDuration(loot.durationSec)}</div>
            <div className="eyebrow mt-1">durée</div>
          </div>
          <div className="stat">
            <div className="hud text-sm font-bold">{loot.totalReps}</div>
            <div className="eyebrow mt-1">répétitions</div>
          </div>
          <div className="stat">
            <div className="hud text-sm font-bold text-ember">🔥 {loot.streakDays}</div>
            <div className="eyebrow mt-1">jours</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={restart} className="btn py-3.5 text-xs">
            Nouvelle séance
          </button>
          <button onClick={() => navigate('/')} className="btn btn-volt py-3.5 text-xs">
            Retour au héros
          </button>
        </div>

        <button onClick={share} className="btn w-full py-3.5 text-xs">
          {shared ? '✅ Résumé copié !' : '📣 Partager ma séance'}
        </button>
      </div>
    )
  }

  // ---------- Écran SETUP ----------
  if (phase === 'setup') {
    return (
      <div className="space-y-5">
        <header>
          <div className="eyebrow">Composer</div>
          <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">Nouvelle séance</h1>
        </header>

        {spot && (
          <div className="card flex items-center gap-2 px-4 py-3 text-sm">
            <span>{SPOT_TYPE_META[spot.type].icon}</span>
            <span className="text-mute">Spot :</span>
            <span className="font-semibold text-volt">{spot.name}</span>
          </div>
        )}

        {routine && (
          <div className="card border-volt/60 p-4">
            <div className="eyebrow text-volt">Routine chargée</div>
            <div className="mt-0.5 font-display text-lg uppercase">{routine.name}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {routine.items.map((i) => {
                const m = movementById(i.movementId)
                return (
                  <span key={i.movementId} className="chip text-[11px]">
                    {m?.emoji} {m?.name}
                    <span className="hud text-mute">
                      {i.sets}×{i.reps}
                      {i.addedKg ? ` +${i.addedKg}kg` : ''}
                    </span>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          <div className="space-y-5 lg:col-span-2">
            <section>
              <h2 className="eyebrow mb-2.5">Type de séance</h2>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                {TEMPLATES.map((t) => {
                  const on = templateId === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => chooseTemplate(t.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-3.5 font-display text-[11px] uppercase transition-colors ${
                        on
                          ? 'border-volt bg-volt/10 text-volt shadow-[4px_4px_0_0_var(--color-volt-dim)]'
                          : 'border-edge bg-panel text-mute hover:border-zinc-600'
                      }`}
                    >
                      <span className="text-xl">{t.icon}</span>
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </section>

            <section>
              <h2 className="eyebrow mb-2.5">Mouvements ({selected.length})</h2>
              <div className="grid gap-2.5 md:grid-cols-2">
                {MOVEMENTS.map((m) => {
                  const on = selected.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMovement(m.id)}
                      className={`flex items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left transition-colors ${
                        on
                          ? 'border-volt/60 bg-volt/10'
                          : 'border-edge bg-panel/60 opacity-55 hover:opacity-80'
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{m.name}</span>
                        <span className="hud block text-[11px] text-mute">
                          {FAMILY_LABELS[m.family]} · {m.coeff} XP/{m.isHold ? 'sec' : 'rep'}
                        </span>
                      </span>
                      <span className={`font-display text-lg ${on ? 'text-volt' : 'text-zinc-600'}`}>
                        {on ? '✓' : '+'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            {spots.length > 0 ? (
              <section className="card p-4">
                <h2 className="eyebrow mb-2.5">Spot (optionnel)</h2>
                <select
                  value={spotId ?? ''}
                  onChange={(e) => setSpotId(e.target.value || undefined)}
                  className="input"
                >
                  <option value="">Aucun spot</option>
                  {spots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {SPOT_TYPE_META[s.type].icon} {s.name}
                    </option>
                  ))}
                </select>
              </section>
            ) : null}

            <button disabled={!selected.length} onClick={start} className="btn btn-volt w-full py-4 text-base">
              ▶️ Démarrer la séance
            </button>
            <p className="text-center text-[11px] leading-relaxed text-zinc-600">
              {selected.length} mouvement{selected.length > 1 ? 's' : ''} · repos de {settings.restSec}s
              entre les séries
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Écran ACTIVE ----------
  return (
    <div className="space-y-4 md:space-y-5">
      <div className="card flex items-center justify-between gap-3 px-4 py-3">
        <span className="hud text-2xl font-bold leading-none">⏱ {secondsToClock(elapsed)}</span>
        <span className="hud text-sm font-bold text-volt">+{liveXp} XP</span>
        {spot && (
          <span className="hidden items-center gap-1.5 text-xs text-mute sm:flex">
            {SPOT_TYPE_META[spot.type].icon} {spot.name}
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
            {selected.map((id) => {
              const m = movementById(id)
              if (!m) return null
              const count = sets.filter((s) => s.movementId === id).length
              const on = current === id
              return (
                <button
                  key={id}
                  onClick={() => pickMovement(id)}
                  className={`chip shrink-0 text-xs ${on ? 'chip-on' : ''}`}
                >
                  {m.emoji} {m.name}
                  {(count > 0 || targets[id]) && (
                    <span className={`hud rounded-full px-1.5 text-[10px] ${on ? 'bg-volt text-ink' : 'bg-panel-2'}`}>
                      {targets[id] ? `${count}/${targets[id].sets}` : count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {currentMovement && (
            <div className="card p-5 text-center md:p-6">
              <div className="text-3xl">{currentMovement.emoji}</div>
              <div className="eyebrow mt-2">{currentMovement.name}</div>
              {targets[currentMovement.id] && (
                <div className="hud mt-1 text-[11px] text-volt">
                  Objectif {targets[currentMovement.id].sets} × {targets[currentMovement.id].reps}
                  {currentMovement.isHold ? ' s' : ''}
                  {targets[currentMovement.id].addedKg ? ` · +${targets[currentMovement.id].addedKg}kg` : ''}
                </div>
              )}
              <div className="hud my-3 text-6xl font-bold leading-none md:text-7xl">{amount}</div>
              <div className="eyebrow">{currentMovement.isHold ? 'secondes' : 'répétitions'}</div>
              <div className="mx-auto mt-5 grid max-w-md grid-cols-4 gap-2">
                {[-5, -1, 1, 5].map((d) => (
                  <button
                    key={d}
                    onClick={() => setAmount((a) => Math.max(1, Math.min(600, a + d)))}
                    className="hud rounded-xl border-2 border-edge bg-panel-2 py-3 text-base font-bold active:translate-y-0.5"
                  >
                    {d > 0 ? `+${d}` : d}
                  </button>
                ))}
              </div>
              <div className="mx-auto mt-2 flex max-w-md items-center justify-center gap-2">
                <label htmlFor="lest" className="eyebrow">
                  🎒 Lest
                </label>
                <input
                  id="lest"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  placeholder="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="hud w-20 rounded-xl border-2 border-edge bg-panel-2 py-2 text-center text-base font-bold placeholder:text-zinc-600"
                />
                <span className="eyebrow">kg</span>
              </div>
              <button onClick={validateSet} className="btn btn-volt mx-auto mt-4 w-full max-w-md py-4 text-base">
                ✓ Valider la série
              </button>
            </div>
          )}

          {sets.length > 0 && (
            <section>
              <h2 className="eyebrow mb-2.5">Séries ({sets.length})</h2>
              <div className="space-y-2">
                {sets.map((s, i) => {
                  const m = movementById(s.movementId)
                  return (
                    <div key={s.id} className="card flex items-center gap-3 px-3.5 py-2.5 text-sm">
                      <span className="hud text-[11px] text-zinc-500">#{String(i + 1).padStart(2, '0')}</span>
                      <span>{m?.emoji}</span>
                      <span className="min-w-0 flex-1 truncate font-medium">{m?.name}</span>
                      <span className="hud font-bold">
                        {s.reps ?? s.seconds}
                        {m?.isHold ? 's' : ''}
                        {s.addedKg ? ` · +${s.addedKg}kg` : ''}
                      </span>
                      <span className="hud text-xs font-bold text-volt">+{setXp(s)}</span>
                      <button
                        onClick={() => setSets((prev) => prev.filter((x) => x.id !== s.id))}
                        className="px-1 text-zinc-600 hover:text-ember"
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
        </div>

        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          {restLeft !== null && (
            <div className="animate-floaty card border-ice/40 p-4 text-center">
              {restLeft > 0 ? (
                <>
                  <div className="eyebrow" style={{ color: 'var(--color-ice)' }}>
                    Repos
                  </div>
                  <div className="hud mt-1 text-5xl font-bold leading-none text-ice">{restLeft}s</div>
                  <div className="mt-4 flex justify-center gap-2">
                    <button
                      onClick={() => setRestEndsAt((e) => (e ? e + 30000 : e))}
                      className="btn px-3.5 py-2.5 text-[11px]"
                    >
                      +30s
                    </button>
                    <button
                      onClick={() => setRestEndsAt(null)}
                      className="btn px-3.5 py-2.5 text-[11px]"
                      style={{ background: 'var(--color-ice)', color: 'var(--color-ink)', borderColor: 'var(--color-ink)' }}
                    >
                      Passer
                    </button>
                  </div>
                </>
              ) : (
                <button onClick={() => setRestEndsAt(null)} className="w-full font-display text-base uppercase text-volt">
                  💥 C'est reparti !
                </button>
              )}
            </div>
          )}

          <button disabled={!sets.length} onClick={finish} className="btn w-full py-4 text-base">
            🏁 Terminer la séance
          </button>
          <button onClick={restart} className="w-full py-1 text-center text-[11px] text-zinc-600 underline">
            Abandonner (rien ne sera enregistré)
          </button>
        </div>
      </div>
    </div>
  )
}
