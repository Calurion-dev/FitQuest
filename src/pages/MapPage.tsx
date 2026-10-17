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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Spots</h1>
        <button
          onClick={locate}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-200"
        >
          📍 Ma position
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'parc', 'salle'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              typeFilter === t
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
            }`}
          >
            {t === 'all' ? 'Tous' : `${SPOT_TYPE_META[t].icon} ${SPOT_TYPE_META[t].label}`}
          </button>
        ))}
        {RATING_FILTERS.map((r) => (
          <button
            key={r.value}
            onClick={() => setMinRating(r.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              minRating === r.value
                ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
            }`}
          >
            ★ {r.label}
          </button>
        ))}
        <button
          onClick={() => setNearMe((v) => !v)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
            nearMe ? 'border-sky-500 bg-sky-500/15 text-sky-300' : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
          }`}
        >
          Près de moi (5 km)
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <SpotMap
          spots={filtered}
          selectedId={selectedId}
          ratingOf={ratingOf}
          userPos={userPos}
          focus={focus}
          adding={adding}
          onMapClick={(lat, lng) => setPending({ lat, lng })}
          onSelect={(id) => setSelectedId(id)}
          className="h-[48vh] w-full"
        />
      </div>

      {adding ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          👆 Touche la carte pour placer le spot.
          <button onClick={() => setAdding(false)} className="ml-2 underline">
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setAdding(true)
            setMessage(null)
          }}
          className="w-full rounded-2xl bg-emerald-500 py-3 font-bold text-zinc-950"
        >
          ➕ Ajouter un spot
        </button>
      )}

      {message && <div className="text-xs text-zinc-400">{message}</div>}

      <section className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
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
              className="flex w-full items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 text-left"
            >
              <span className="text-2xl">{SPOT_TYPE_META[s.type].icon}</span>
              <span className="flex-1">
                <span className="flex items-center gap-2 text-sm font-bold">
                  {s.name}
                  {visited.has(s.id) && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      visité
                    </span>
                  )}
                </span>
                <span className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
                  <Stars value={r ?? 0} size="sm" />
                  {r ? `${r.toFixed(1)} (${count} avis)` : 'Pas encore noté'}
                  {userPos && ` · ${distanceKm(userPos.lat, userPos.lng, s.lat, s.lng).toFixed(1)} km`}
                </span>
              </span>
            </button>
          )
        })}
      </section>

      {/* Sheet : ajout de spot */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setPending(null)}>
          <div
            className="mx-auto max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-zinc-800 bg-zinc-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-black">Nouveau spot</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Position : {pending.lat.toFixed(5)}, {pending.lng.toFixed(5)}
            </p>
            <div className="mt-4 space-y-3">
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nom du spot (ex : Parc Wilson)"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-base outline-none focus:border-emerald-500"
              />
              <div className="grid grid-cols-2 gap-2">
                {(['parc', 'salle'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormType(t)}
                    className={`rounded-xl border py-2.5 text-sm font-bold ${
                      formType === t
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                    }`}
                  >
                    {SPOT_TYPE_META[t].icon} {SPOT_TYPE_META[t].label}
                  </button>
                ))}
              </div>
              <div>
                <div className="mb-1.5 text-xs font-semibold text-zinc-400">Équipements</div>
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
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                          on
                            ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                        }`}
                      >
                        {eq}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-xs font-semibold text-zinc-400">Ta note (optionnel)</div>
                <Stars value={formRating} onChange={setFormRating} size="lg" />
              </div>
              {formRating > 0 && (
                <textarea
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Un commentaire ? (optionnel)"
                  rows={2}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPending(null)}
                  className="rounded-2xl border border-zinc-700 bg-zinc-900 py-3 font-bold text-zinc-300"
                >
                  Annuler
                </button>
                <button
                  disabled={!formName.trim()}
                  onClick={saveSpot}
                  className="rounded-2xl bg-emerald-500 py-3 font-bold text-zinc-950 disabled:opacity-40"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sheet : détail du spot */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setSelectedId(null)}>
          <div
            className="mx-auto max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-zinc-800 bg-zinc-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{SPOT_TYPE_META[selected.type].icon}</span>
              <div className="flex-1">
                <h2 className="text-lg font-black">{selected.name}</h2>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                  <Stars value={ratingOf(selected.id) ?? 0} size="sm" />
                  {ratingOf(selected.id)
                    ? `${ratingOf(selected.id)!.toFixed(1)} · ${selectedReviews.length} avis`
                    : 'Pas encore noté'}
                </div>
              </div>
              {visited.has(selected.id) && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  visité
                </span>
              )}
            </div>

            {selected.equipments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selected.equipments.map((eq) => (
                  <span key={eq} className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-400">
                    {eq}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/workout', { state: { spotId: selected.id } })}
                className="rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-zinc-950"
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
                className="rounded-2xl border border-red-500/40 py-3 text-sm font-bold text-red-400"
              >
                🗑️ Supprimer
              </button>
            </div>

            <section className="mt-5">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
                Avis ({selectedReviews.length})
              </h3>
              <div className="space-y-2">
                {selectedReviews.length === 0 && (
                  <p className="text-xs text-zinc-500">Aucun avis. Sois le premier à noter ce spot !</p>
                )}
                {selectedReviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                    <Stars value={r.rating} size="sm" />
                    {r.comment && <p className="mt-1 text-xs text-zinc-300">{r.comment}</p>}
                    <p className="mt-1 text-[10px] text-zinc-600">
                      {new Date(r.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <div className="mb-1.5 text-xs font-semibold text-zinc-400">Ta note</div>
                <Stars value={reviewRating} onChange={setReviewRating} size="lg" />
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ton avis (optionnel)"
                  rows={2}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
                <button
                  disabled={reviewRating < 1}
                  onClick={submitReview}
                  className="mt-2 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-40"
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
