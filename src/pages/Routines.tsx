import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOVEMENTS, movementById } from '../data/movements'
import { uid } from '../lib/id'
import { useStore } from '../store/useStore'
import type { Routine, RoutineItem } from '../types'

const clamp = (v: string, min: number, max: number) => Math.max(min, Math.min(max, Number(v) || min))

export default function Routines() {
  const navigate = useNavigate()
  const routines = useStore((s) => s.routines)
  const saveRoutine = useStore((s) => s.saveRoutine)
  const deleteRoutine = useStore((s) => s.deleteRoutine)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [items, setItems] = useState<RoutineItem[]>([])

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
        <section className="card border-volt/60 p-4 md:p-5">
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
