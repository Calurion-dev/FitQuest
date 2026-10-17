import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stars } from '../components/Stars'
import { SpotMap } from '../components/SpotMap'
import { EQUIPMENTS, SPOT_TYPE_META } from '../data/movements'
import { visitedSpots } from '../game/engine'
import { distanceKm } from '../lib/geo'
import { useStore } from '../store/useStore'
import type { SpotType } from '../types'

const RATING_FILTERS: { label: string; value: number }[] = [
  { label: 'Toutes', value: 0 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
  { label: '4.5+', value: 4.5 }
]

export default function MapPage() {
  const navigate = useNavigate()
  const spots = useStore((s) => s.spots)
  const reviews = useStore((s) => s.reviews)
  const workouts = useStore((s) => s.workouts)
  const addSpot = useStore((s) => s.addSpot)
  const deleteSpot = useStore((s) => s.deleteSpot)
  const addReview = useStore((s) => s.addReview)

  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'salle' | 'parc'>('all')
  const [minRating, setMinRating] = useState(0)
  const [nearMe, setNearMe] = useState(false)
  const [adding, setAdding] = useState(false)
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<SpotType>('parc')
  const [formEquipments, setFormEquipments] = useState<string[]>([])
  const [formRating, setFormRating] = useState(0)
  const [formComment, setFormComment] = useState('')

  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')

  const ratingOf = useCallback(
    (spotId: string): number | null => {
      const rs = reviews.filter((r) => r.spotId === spotId)
      if (!rs.length) return null
      return rs.reduce((a, r) => a + r.rating, 0) / rs.length
    },
    [reviews]
  )

  const visited = useMemo(() => new Set(visitedSpots(workouts)), [workouts])

  const filtered = useMemo(() => {
    return spots.filter((s) => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false
      if (minRating > 0) {
        const r = ratingOf(s.id)
        if (r === null || r < minRating) return false
      }
      if (nearMe) {
        if (!userPos) return true
        if (distanceKm(userPos.lat, userPos.lng, s.lat, s.lng) > 5) return false
      }
      return true
    })
  }, [spots, typeFilter, minRating, nearMe, userPos, ratingOf])

  const locate = () => {
    if (!navigator.geolocation) {
      setMessage('Géolocalisation non supportée')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(p)
        setFocus(p)
        setMessage(null)
      },
      () => setMessage('Géolocalisation refusée')
    )
  }

  const resetForm = () => {
    setFormName('')
    setFormType('parc')
    setFormEquipments([])
    setFormRating(0)
    setFormComment('')
  }

  const saveSpot = () => {
    if (!pending || !formName.trim()) return
    const spot = addSpot({
      name: formName.trim(),
      type: formType,
      lat: pending.lat,
      lng: pending.lng,
      equipments: formEquipments
    })
    if (formRating > 0) {
      addReview({ spotId: spot.id, rating: formRating, comment: formComment.trim() })
    }
    resetForm()
    setPending(null)
    setAdding(false)
    setSelectedId(spot.id)
  }

  const submitReview = () => {
    if (!selectedId || reviewRating < 1) return
    addReview({ spotId: selectedId, rating: reviewRating, comment: reviewComment.trim() })
    setReviewRating(0)
    setReviewComment('')
  }

  const selected = spots.find((s) => s.id === selectedId) ?? null
  const selectedReviews = selectedId ? reviews.filter((r) => r.spotId === selectedId) : []

  return (
    <div className="space-y-5 md:space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow">Terrain</div>
          <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">Spots</h1>
        </div>
        <button onClick={locate} className="btn px-3.5 py-2.5 text-[11px]">
          📍 Ma position
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {(['all', 'parc', 'salle'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`chip ${typeFilter === t ? 'chip-on' : ''}`}
          >
            {t === 'all' ? 'Tous' : `${SPOT_TYPE_META[t].icon} ${SPOT_TYPE_META[t].label}`}
          </button>
        ))}
        {RATING_FILTERS.map((r) => (
          <button
            key={r.value}
            onClick={() => setMinRating(r.value)}
            className={`chip ${minRating === r.value ? 'chip-on' : ''}`}
          >
            ★ {r.label}
          </button>
        ))}
        <button onClick={() => setNearMe((v) => !v)} className={`chip ${nearMe ? 'chip-on' : ''}`}>
          Près de moi (5 km)
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-4 lg:col-span-2 lg:sticky lg:top-8 lg:self-start">
          <div className="card relative isolate overflow-hidden p-0">
            <SpotMap
              spots={filtered}
              selectedId={selectedId}
              ratingOf={ratingOf}
              userPos={userPos}
              focus={focus}
              adding={adding}
              onMapClick={(lat, lng) => setPending({ lat, lng })}
              onSelect={(id) => setSelectedId(id)}
              className="h-[50vh] w-full lg:h-[64vh]"
            />
          </div>

          {adding ? (
            <div className="card flex items-center gap-2 px-4 py-3 text-xs">
              <span>👆</span>
              <span className="flex-1 text-volt">Touche la carte pour placer le spot.</span>
              <button onClick={() => setAdding(false)} className="underline text-mute">
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAdding(true)
                setMessage(null)
              }}
              className="btn btn-volt w-full py-3.5 text-sm"
            >
              ➕ Ajouter un spot
            </button>
          )}

          {message && <div className="text-xs text-mute">{message}</div>}
        </div>

        <section className="space-y-2.5">
          <h2 className="eyebrow">
            {filtered.length} spot{filtered.length > 1 ? 's' : ''}
          </h2>
          {filtered.length === 0 && (
            <div className="card border-dashed p-6 text-center text-sm text-mute">
              Aucun spot pour ces filtres. Ajoute ton parc ou ta salle préférée !
            </div>
          )}
          {filtered.map((s) => {
            const r = ratingOf(s.id)
            const count = reviews.filter((x) => x.spotId === s.id).length
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedId(s.id)
                  setFocus({ lat: s.lat, lng: s.lng })
                }}
                className="card flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:border-volt/60"
              >
                <span className="text-2xl">{SPOT_TYPE_META[s.type].icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-display text-sm uppercase">{s.name}</span>
                    {visited.has(s.id) && <span className="sticker shrink-0">visité</span>}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-mute">
                    <Stars value={r ?? 0} size="sm" />
                    {r ? `${r.toFixed(1)} (${count} avis)` : 'Pas encore noté'}
                    {userPos && ` · ${distanceKm(userPos.lat, userPos.lng, s.lat, s.lng).toFixed(1)} km`}
                  </span>
                </span>
              </button>
            )
          })}
        </section>
      </div>

      {/* Sheet : ajout de spot */}
      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/70 md:items-center md:justify-center md:p-6"
          onClick={() => setPending(null)}
        >
          <div
            className="animate-floaty mx-auto max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-2 border-edge bg-panel p-5 md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tape -mx-5 -mt-5 mb-4 rounded-t-3xl" />
            <h2 className="text-xl uppercase">Nouveau spot</h2>
            <p className="hud mt-1 text-[11px] text-mute">
              {pending.lat.toFixed(5)}, {pending.lng.toFixed(5)}
            </p>
            <div className="mt-4 space-y-3.5">
              <div>
                <div className="eyebrow mb-2">Nom du spot</div>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex : Parc Wilson"
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(['parc', 'salle'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormType(t)}
                    className={`rounded-xl border-2 py-2.5 font-display text-xs uppercase transition-colors ${
                      formType === t ? 'border-volt bg-volt/10 text-volt' : 'border-edge bg-panel-2 text-mute'
                    }`}
                  >
                    {SPOT_TYPE_META[t].icon} {SPOT_TYPE_META[t].label}
                  </button>
                ))}
              </div>
              <div>
                <div className="eyebrow mb-2">Équipements</div>
                <div className="flex flex-wrap gap-1.5">
                  {EQUIPMENTS.map((eq) => {
                    const on = formEquipments.includes(eq)
                    return (
                      <button
                        key={eq}
                        onClick={() =>
                          setFormEquipments((prev) =>
                            prev.includes(eq) ? prev.filter((x) => x !== eq) : [...prev, eq]
                          )
                        }
                        className={`chip text-[11px] ${on ? 'chip-on' : ''}`}
                      >
                        {eq}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-2">Ta note (optionnel)</div>
                <Stars value={formRating} onChange={setFormRating} size="lg" />
              </div>
              {formRating > 0 && (
                <textarea
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Un commentaire ? (optionnel)"
                  rows={2}
                  className="input text-sm"
                />
              )}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button onClick={() => setPending(null)} className="btn py-3 text-xs">
                  Annuler
                </button>
                <button disabled={!formName.trim()} onClick={saveSpot} className="btn btn-volt py-3 text-xs">
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sheet : détail du spot */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/70 md:items-center md:justify-center md:p-6"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="animate-floaty mx-auto max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-2 border-edge bg-panel p-5 md:max-w-lg md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tape -mx-5 -mt-5 mb-4 rounded-t-3xl" />
            <div className="flex items-start gap-3">
              <span className="text-3xl">{SPOT_TYPE_META[selected.type].icon}</span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl uppercase">{selected.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-mute">
                  <Stars value={ratingOf(selected.id) ?? 0} size="sm" />
                  {ratingOf(selected.id)
                    ? `${ratingOf(selected.id)!.toFixed(1)} · ${selectedReviews.length} avis`
                    : 'Pas encore noté'}
                </div>
              </div>
              {visited.has(selected.id) && <span className="sticker shrink-0">visité</span>}
            </div>

            {selected.equipments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selected.equipments.map((eq) => (
                  <span key={eq} className="chip text-[11px]">
                    {eq}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate('/workout', { state: { spotId: selected.id } })}
                className="btn btn-volt py-3 text-xs"
              >
                💪 S'entraîner ici
              </button>
              <button
                onClick={() => {
                  if (confirm(`Supprimer « ${selected.name} » et ses avis ?`)) {
                    deleteSpot(selected.id)
                    setSelectedId(null)
                  }
                }}
                className="btn btn-danger py-3 text-xs"
              >
                🗑️ Supprimer
              </button>
            </div>

            <section className="mt-5">
              <h3 className="eyebrow mb-2.5">Avis ({selectedReviews.length})</h3>
              <div className="space-y-2.5">
                {selectedReviews.length === 0 && (
                  <p className="text-xs text-mute">Aucun avis. Sois le premier à noter ce spot !</p>
                )}
                {selectedReviews.map((r) => (
                  <div key={r.id} className="rounded-xl border-2 border-edge bg-panel-2 p-3">
                    <Stars value={r.rating} size="sm" />
                    {r.comment && <p className="mt-1.5 text-xs text-zinc-300">{r.comment}</p>}
                    <p className="hud mt-1.5 text-[10px] text-zinc-600">
                      {new Date(r.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border-2 border-edge bg-panel-2 p-3.5">
                <div className="eyebrow mb-2">Ta note</div>
                <Stars value={reviewRating} onChange={setReviewRating} size="lg" />
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ton avis (optionnel)"
                  rows={2}
                  className="input mt-2.5 text-sm"
                />
                <button
                  disabled={reviewRating < 1}
                  onClick={submitReview}
                  className="btn btn-volt mt-2.5 w-full py-3 text-xs"
                >
                  Publier mon avis (local)
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
