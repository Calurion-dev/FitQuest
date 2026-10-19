import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOVEMENTS, movementById } from '../data/movements'
import { FAMILY_MUSCLES, MUSCLE_MAP, MUSCLES, type MuscleKey } from '../data/muscles'
import { setAmount } from '../game/engine'
import { dateFromKey } from '../lib/date'
import { useStore } from '../store/useStore'

const WINDOWS = [
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
  { days: 0, label: 'Tout' }
]

export default function BodyGraph() {
  const workouts = useStore((s) => s.workouts)
  const navigate = useNavigate()
  const [days, setDays] = useState(30)

  // Volume par muscle sur la fenêtre choisie : chaque série crédite entièrement les muscles qu'elle sollicite.
  const { volume, max, setCount } = useMemo(() => {
    const volume = Object.fromEntries(MUSCLES.map((m) => [m.key, 0])) as Record<MuscleKey, number>
    const since = days ? new Date(Date.now() - days * 86400000) : null
    let setCount = 0
    for (const w of workouts) {
      if (since && dateFromKey(w.dayKey) < since) continue
      for (const s of w.sets) {
        const m = movementById(s.movementId)
        if (!m) continue
        setCount++
        for (const k of MUSCLE_MAP[m.id] ?? FAMILY_MUSCLES[m.family]) volume[k] += setAmount(s)
      }
    }
    return { volume, max: Math.max(1, ...Object.values(volume)), setCount }
  }, [workouts, days])

  // Zones non touchées sur les 7 derniers jours + mouvements qui les couvrent.
  const week = useMemo(() => {
    const out = Object.fromEntries(MUSCLES.map((m) => [m.key, 0])) as Record<MuscleKey, number>
    const since = new Date(Date.now() - 7 * 86400000)
    for (const w of workouts) {
      if (dateFromKey(w.dayKey) < since) continue
      for (const s of w.sets) {
        const m = movementById(s.movementId)
        if (!m) continue
        for (const k of MUSCLE_MAP[m.id] ?? FAMILY_MUSCLES[m.family]) out[k] += setAmount(s)
      }
    }
    return out
  }, [workouts])

  const untouched = MUSCLES.filter((m) => week[m.key] === 0)
  const suggestions = Array.from(
    new Set(
      untouched.flatMap((m) =>
        MOVEMENTS.filter((mv) => (MUSCLE_MAP[mv.id] ?? FAMILY_MUSCLES[mv.family]).includes(m.key)).map((mv) => mv.id)
      )
    )
  ).slice(0, 4)

  const fill = (k: MuscleKey) =>
    volume[k] ? `rgba(242, 230, 0, ${(0.18 + 0.82 * (volume[k] / max)).toFixed(2)})` : '#1a1a1e'

  const top = MUSCLES.reduce((a, b) => (volume[b.key] > volume[a.key] ? b : a), MUSCLES[0])

  /** Zone colorée (muscle) ou partie neutre du corps. */
  const Part = ({ k, x, y, w, h, r = 6 }: { k?: MuscleKey; x: number; y: number; w: number; h: number; r?: number }) => (
    <rect x={x} y={y} width={w} height={h} rx={r} fill={k ? fill(k) : '#1a1a1e'} stroke="#33333a" strokeWidth={1} />
  )

  return (
    <div className="space-y-5">
      <header>
        <div className="eyebrow">Ce que tu as travaillé</div>
        <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">Body graph</h1>
      </header>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <section className="card p-4 md:p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {WINDOWS.map((w) => (
                <button
                  key={w.label}
                  onClick={() => setDays(w.days)}
                  className={`chip text-[11px] ${days === w.days ? 'chip-on' : ''}`}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <span className="hud text-[11px] text-mute">{setCount} séries</span>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <svg
              viewBox="0 0 240 264"
              role="img"
              aria-label="Silhouette de face et de dos, colorée selon le volume travaillé par muscle"
              className="h-72 w-auto md:h-96"
            >
              {/* Face */}
              <circle cx={60} cy={26} r={15} fill="#1a1a1e" stroke="#33333a" strokeWidth={1} />
              <Part x={54} y={40} w={12} h={10} r={4} />
              <Part k="epaules" x={27} y={57} w={22} h={18} r={9} />
              <Part k="epaules" x={71} y={57} w={22} h={18} r={9} />
              <Part k="pecs" x={42} y={66} w={17} h={22} />
              <Part k="pecs" x={61} y={66} w={17} h={22} />
              <Part k="obliques" x={42} y={94} w={8} h={34} r={4} />
              <Part k="obliques" x={70} y={94} w={8} h={34} r={4} />
              <Part k="abdos" x={52} y={92} w={16} h={40} r={5} />
              <Part k="biceps" x={30} y={76} w={12} h={30} />
              <Part k="biceps" x={78} y={76} w={12} h={30} />
              <Part k="avantbras" x={30} y={108} w={11} h={30} r={5} />
              <Part k="avantbras" x={79} y={108} w={11} h={30} r={5} />
              <Part x={52} y={132} w={16} h={14} r={5} />
              <Part k="quadris" x={44} y={146} w={15} h={54} r={7} />
              <Part k="quadris" x={61} y={146} w={15} h={54} r={7} />
              <Part x={45} y={204} w={13} h={48} />
              <Part x={62} y={204} w={13} h={48} />

              {/* Dos */}
              <circle cx={180} cy={26} r={15} fill="#1a1a1e" stroke="#33333a" strokeWidth={1} />
              <Part x={174} y={40} w={12} h={10} r={4} />
              <Part k="epaules" x={147} y={57} w={22} h={18} r={9} />
              <Part k="epaules" x={191} y={57} w={22} h={18} r={9} />
              <Part k="dos" x={158} y={60} w={44} h={50} r={14} />
              <Part k="triceps" x={150} y={76} w={12} h={30} />
              <Part k="triceps" x={198} y={76} w={12} h={30} />
              <Part k="avantbras" x={150} y={108} w={11} h={30} r={5} />
              <Part k="avantbras" x={199} y={108} w={11} h={30} r={5} />
              <Part k="fessiers" x={160} y={112} w={18} h={20} r={8} />
              <Part k="fessiers" x={182} y={112} w={18} h={20} r={8} />
              <Part k="ischios" x={160} y={146} w={15} h={54} r={7} />
              <Part k="ischios" x={185} y={146} w={15} h={54} r={7} />
              <Part k="mollets" x={161} y={208} w={13} h={44} />
              <Part k="mollets" x={186} y={208} w={13} h={44} />
            </svg>
          </div>

          <p className="mt-2 text-center text-[11px] text-zinc-600">
            Face à gauche, dos à droite. Plus le jaune est vif, plus le muscle a été travaillé.
          </p>
        </section>

        <section className="card p-4 md:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="eyebrow">Détail</h2>
            {volume[top.key] > 0 && (
              <span className="hud text-[11px] text-volt">Top : {top.label}</span>
            )}
          </div>
          <div className="mt-3 space-y-2">
            {MUSCLES.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-[3px] border border-edge"
                  style={{ background: fill(key) }}
                />
                <span className="w-28 shrink-0 truncate text-xs">{label}</span>
                <div className="bar h-2.5 flex-1">
                  <div style={{ width: `${Math.round((volume[key] / max) * 100)}%` }} />
                </div>
                <span className="hud w-9 shrink-0 text-right text-[11px] text-mute">{volume[key]}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
            Volume = répétitions cumulées (et secondes pour le gainage) sur la période.
          </p>
        </section>
      </div>

      <section className="card p-4 md:p-5">
        <h2 className="eyebrow mb-2.5">Oubliés cette semaine</h2>
        {untouched.length === 0 ? (
          <p className="text-xs text-mute">Tout le corps a été touché ces 7 derniers jours 💪</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {untouched.map((m) => (
                <span key={m.key} className="chip cursor-default text-[11px]">
                  {m.label}
                </span>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] text-zinc-600">
              Zones avec zéro volume ces 7 derniers jours. Rien de grave : complète quand tu peux.
            </p>
            {suggestions.length > 0 && (
              <button
                onClick={() => navigate('/workout', { state: { movements: suggestions } })}
                className="btn mt-3 px-3 py-2 text-xs"
              >
                → Séance qui couvre ces zones
              </button>
            )}
          </>
        )}
      </section>
    </div>
  )
}
