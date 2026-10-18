import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOVEMENTS, movementById } from '../data/movements'
import { uid } from '../lib/id'
import { useStore } from '../store/useStore'
import type { Routine, RoutineItem, WeekDay } from '../types'

const clamp = (v: string, min: number, max: number) => Math.max(min, Math.min(max, Number(v) || min))

const WEEK_DAYS: { id: WeekDay; label: string }[] = [
  { id: 'mon', label: 'Lun' },
  { id: 'tue', label: 'Mar' },
  { id: 'wed', label: 'Mer' },
  { id: 'thu', label: 'Jeu' },
  { id: 'fri', label: 'Ven' },
  { id: 'sat', label: 'Sam' },
  { id: 'sun', label: 'Dim' }
]

export default function Routines() {
  const navigate = useNavigate()
  const routines = useStore((s) => s.routines)
  const weekPlan = useStore((s) => s.weekPlan)
  const saveRoutine = useStore((s) => s.saveRoutine)
  const deleteRoutine = useStore((s) => s.deleteRoutine)
  const setDayPlan = useStore((s) => s.setDayPlan)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [items, setItems] = useState<RoutineItem[]>([])
  const [openRoutineId, setOpenRoutineId] = useState<string | null>(null)

  // getDay() : 0 = dimanche → lundi = 0.
  const todayIdx = (new Date().getDay() + 6) % 7
  const openRoutine = routines.find((r) => r.id === openRoutineId)

  const openEditor = (routine?: Routine) => {
    setEditingId(routine?.id ?? null)
    setName(routine?.name ?? '')
    setItems(
      routine
        ? routine.items.map((i) => ({ ...i }))
        : [{ movementId: MOVEMENTS[0].id, sets: 3, reps: 10 }]
    )
    setOpen(true)
  }

  // L'éditeur s'ouvre au-dessus : on le ramène dans la vue (ex. clic depuis le planning en bas de page).
  useEffect(() => {
    if (open) {
      document.getElementById('routine-editor')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [open])

  const patchItem = (idx: number, patch: Partial<RoutineItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))

  const addItem = () => {
    const free = MOVEMENTS.find((m) => !items.some((i) => i.movementId === m.id)) ?? MOVEMENTS[0]
    setItems((prev) => [...prev, { movementId: free.id, sets: 3, reps: free.isHold ? 30 : 10 }])
  }

  const save = () => {
    if (!name.trim() || !items.length) return
    // Un mouvement ne peut apparaître qu'une fois : l'écran Séance ne garde qu'un objectif par mouvement.
    const unique = items.filter((i, idx) => items.findIndex((x) => x.movementId === i.movementId) === idx)
    saveRoutine({ id: editingId ?? uid(), name: name.trim(), items: unique })
    setOpen(false)
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow">Mes programmes</div>
          <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">Routines</h1>
        </div>
        {!open && (
          <button onClick={() => openEditor()} className="btn btn-volt py-3 text-xs">
            ＋ Nouvelle routine
          </button>
        )}
      </header>

      {open && (
        <section id="routine-editor" className="card border-volt/60 p-4 md:p-5">
          <h2 className="eyebrow">{editingId ? 'Modifier la routine' : 'Nouvelle routine'}</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom (ex. Push du lundi)"
            className="input mt-3"
          />
          <div className="mt-3 space-y-2">
            {items.map((item, idx) => {
              const m = movementById(item.movementId)
              return (
                <div key={idx} className="flex flex-wrap items-center gap-2">
                  <select
                    value={item.movementId}
                    onChange={(e) => patchItem(idx, { movementId: e.target.value })}
                    className="input min-w-40 flex-1"
                  >
                    {MOVEMENTS.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.emoji} {x.name}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1.5 text-[11px] text-mute">
                    séries
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={item.sets}
                      onChange={(e) => patchItem(idx, { sets: clamp(e.target.value, 1, 20) })}
                      className="input w-16 text-center"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-mute">
                    {m?.isHold ? 'sec' : 'reps'}
                    <input
                      type="number"
                      min={1}
                      max={600}
                      value={item.reps}
                      onChange={(e) => patchItem(idx, { reps: clamp(e.target.value, 1, 600) })}
                      className="input w-20 text-center"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-mute">
                    lest kg
                    <input
                      type="number"
                      min={0}
                      max={200}
                      step={0.5}
                      placeholder="0"
                      value={item.addedKg ?? 0}
                      onChange={(e) => patchItem(idx, { addedKg: clamp(e.target.value, 0, 200) })}
                      className="input w-16 text-center"
                    />
                  </label>
                  <button
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="btn px-3 py-2 text-xs"
                    aria-label="Retirer ce mouvement"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>

          <button onClick={addItem} className="btn mt-3 w-full py-3 text-xs">
            ＋ Ajouter un mouvement
          </button>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button onClick={() => setOpen(false)} className="btn py-3.5 text-xs">
              Annuler
            </button>
            <button
              disabled={!name.trim() || !items.length}
              onClick={save}
              className="btn btn-volt py-3.5 text-xs"
            >
              Enregistrer
            </button>
          </div>
        </section>
      )}

      <section className="card p-4">
        <h2 className="eyebrow mb-2.5">Planning de la semaine</h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {WEEK_DAYS.map((day, idx) => {
            const plan = weekPlan[day.id]
            const today = idx === todayIdx
            const free = routines.filter((r) => !plan.routineIds.includes(r.id))
            return (
              <div
                key={day.id}
                className={`rounded-2xl border-2 p-2.5 ${today ? 'border-volt/60' : 'border-edge'} ${
                  plan.rest ? 'bg-panel/40' : 'bg-panel'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`font-display text-[11px] uppercase ${today ? 'text-volt' : 'text-mute'}`}>
                    {day.label}
                  </span>
                  <button
                    onClick={() =>
                      setDayPlan(day.id, plan.rest ? { rest: false } : { rest: true, routineIds: [] })
                    }
                    aria-pressed={plan.rest}
                    className={`rounded-full border-2 px-1.5 py-0.5 text-[10px] font-bold ${
                      plan.rest ? 'border-ember/60 text-ember' : 'border-edge text-mute hover:border-zinc-600'
                    }`}
                  >
                    {plan.rest ? '😴 Repos' : '🏋️ Actif'}
                  </button>
                </div>
                {!plan.rest && (
                  <div className="mt-2 space-y-1.5">
                    {plan.routineIds.map((rid) => (
                      <span key={rid} className="flex items-center gap-1">
                        <button
                          onClick={() => setOpenRoutineId(rid)}
                          className="chip min-w-0 flex-1 truncate text-left text-[10px] hover:border-volt/60"
                          aria-label="Ouvrir la routine"
                        >
                          {routines.find((r) => r.id === rid)?.name ?? '—'}
                        </button>
                        <button
                          onClick={() =>
                            setDayPlan(day.id, { routineIds: plan.routineIds.filter((x) => x !== rid) })
                          }
                          className="px-0.5 text-mute hover:text-ember"
                          aria-label="Retirer cette routine du jour"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {routines.length ? (
                      <select
                        value=""
                        disabled={!free.length}
                        onChange={(e) =>
                          e.target.value &&
                          setDayPlan(day.id, { routineIds: [...plan.routineIds, e.target.value] })
                        }
                        className="input py-1.5 text-[11px]"
                        aria-label={`Ajouter une routine le ${day.label}`}
                      >
                        <option value="">{free.length ? '＋ Routine…' : 'Tout est planifié'}</option>
                        {free.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => openEditor()}
                        className="btn w-full py-1.5 text-[11px]"
                        aria-label={`Créer une routine pour le ${day.label}`}
                      >
                        ＋ Créer une routine
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {openRoutine && (
        <section className="animate-floaty card border-volt/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="eyebrow">Routine planifiée</div>
              <div className="mt-0.5 font-display text-lg uppercase">{openRoutine.name}</div>
            </div>
            <button
              onClick={() => setOpenRoutineId(null)}
              className="px-1 text-zinc-600 hover:text-ember"
              aria-label="Fermer la routine"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {openRoutine.items.map((i) => {
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
          <button
            onClick={() => navigate('/workout', { state: { routineId: openRoutine.id } })}
            className="btn btn-volt mt-3 w-full py-3 text-xs"
          >
            ▶️ Démarrer cette routine
          </button>
        </section>
      )}

      {!routines.length && !open && (
        <p className="card border-dashed p-6 text-center text-xs text-mute">
          Aucune routine pour l'instant. Compose ta première : nom, mouvements, objectifs de séries et de
          répétitions.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {routines.map((r) => (
          <section key={r.id} className="card flex flex-col p-4">
            <div className="font-display text-lg uppercase">{r.name}</div>
            <div className="hud mt-0.5 text-[11px] text-mute">
              {r.items.length} mouvement{r.items.length > 1 ? 's' : ''} ·{' '}
              {r.items.reduce((a, i) => a + i.sets, 0)} séries prévues
            </div>
            <div className="mt-3 flex flex-1 flex-wrap gap-2">
              {r.items.map((i) => {
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
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                onClick={() => navigate('/workout', { state: { routineId: r.id } })}
                className="btn btn-volt text-xs sm:col-span-2"
              >
                ▶️ Démarrer
              </button>
              <button onClick={() => openEditor(r)} className="btn text-xs">
                ✏️ Modifier
              </button>
              <button
                onClick={() => {
                  if (confirm(`Supprimer la routine « ${r.name} » ?`)) deleteRoutine(r.id)
                }}
                className="btn btn-danger text-xs"
              >
                🗑️
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
