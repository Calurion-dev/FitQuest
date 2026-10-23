import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BRANCH_COLOR,
  SKILL_BRANCHES,
  SKILL_EDGES,
  SKILL_NODES,
  type SkillBranch,
  type SkillNode
} from '../data/skills'
import { useT } from '../lib/i18n'

const ZOOMS = [1, 2, 3.5, 5, 7]
const PAD = 220
const byId = new Map(SKILL_NODES.map((n) => [n.id, n]))
const ROOT_IDS = new Set(
  SKILL_BRANCHES.map((b) => SKILL_NODES.find((n) => n.branch === b.id && n.name === b.label)?.id).filter(
    (id): id is string => Boolean(id)
  )
)
const isRoot = (n: SkillNode) => n.id === 'start' || ROOT_IDS.has(n.id)
const ROOT_BY_BRANCH: Partial<Record<SkillBranch, string>> = Object.fromEntries(
  SKILL_BRANCHES.map((b) => [b.id, SKILL_NODES.find((n) => n.branch === b.id && n.name === b.label)?.id])
)

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

/** Découpe un nom en 4 lignes max pour l'afficher dans son cercle. */
function labelLines(name: string, max = 11): string[] {
  const out: string[] = []
  let cur = ''
  for (const word of name.split(' ')) {
    if (!cur) cur = word
    else if (`${cur} ${word}`.length <= max) cur += ` ${word}`
    else {
      out.push(cur)
      cur = word
    }
  }
  if (cur) out.push(cur)
  return out.slice(0, 4)
}

export default function Skills() {
  const t = useT()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [branch, setBranch] = useState<SkillBranch | 'all'>('all')
  const [q, setQ] = useState('')
  const [zoom, setZoom] = useState(() => (window.matchMedia('(max-width: 767px)').matches ? 3 : 0))
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const needle = normalize(q.trim())
  const shown = useMemo(
    () =>
      SKILL_NODES.filter(
        (n) =>
          (!needle || normalize(n.name).includes(needle)) &&
          (needle || branch === 'all' || n.branch === branch)
      ),
    [needle, branch]
  )

  const shownIds = useMemo(() => new Set(shown.map((n) => n.id)), [shown])
  const edges = useMemo(() => SKILL_EDGES.filter(([a, b]) => shownIds.has(a) && shownIds.has(b)), [shownIds])

  const bounds = useMemo(() => {
    const xs = shown.map((n) => n.x)
    const ys = shown.map((n) => n.y)
    return {
      x: Math.min(...xs) - PAD,
      y: Math.min(...ys) - PAD,
      w: Math.max(...xs) - Math.min(...xs) + PAD * 2,
      h: Math.max(...ys) - Math.min(...ys) + PAD * 2
    }
  }, [shown])

  const selected = selectedId ? byId.get(selectedId) ?? null : null
  const parents = selected ? edges.filter(([, b]) => b === selected.id).map(([a]) => byId.get(a)!) : []
  const children = selected ? edges.filter(([a]) => a === selected.id).map(([, b]) => byId.get(b)!) : []

  // Démarre en bas de la carte, centré sur le nœud racine de la branche, comme dans l'app.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const focusId = branch === 'all' ? 'start' : ROOT_BY_BRANCH[branch]
    // Laisse le SVG se recalculer après un filtre avant de lire scrollHeight.
    const id = setTimeout(() => {
      el.scrollTop = el.scrollHeight
      const focus = focusId ? el.querySelector<SVGGElement>(`[data-node="${focusId}"]`) : null
      if (!focus) {
        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
        return
      }
      const r = focus.getBoundingClientRect()
      const box = el.getBoundingClientRect()
      const center = r.left - box.left + el.scrollLeft + r.width / 2
      el.scrollLeft = center - el.clientWidth / 2
    }, 60)
    return () => clearTimeout(id)
  }, [branch, needle, shown.length])

  useEffect(() => {
    if (!selectedId) return
    scrollRef.current
      ?.querySelector(`[data-node="${selectedId}"]`)
      ?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
  }, [selectedId])

  const zoomLabel = `${ZOOMS[zoom]}×`

  return (
    <div className="space-y-4">
      <header>
        <div className="eyebrow">{t('skills.eyebrow')}</div>
        <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">
          Skill<span className="text-volt">s</span>
        </h1>
        <p className="mt-1 text-xs text-mute">{t('skills.subtitle', { n: SKILL_NODES.length - 1 })}</p>
      </header>

      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setSelectedId(null)
        }}
        placeholder={t('skills.search')}
        aria-label={t('skills.search')}
        className="input"
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label={t('skills.branches')}>
        <button
          onClick={() => {
            setBranch('all')
            setSelectedId(null)
          }}
          aria-pressed={branch === 'all'}
          className={`chip ${branch === 'all' ? 'chip-on' : ''}`}
        >
          {t('skills.all')} <span className="hud">{SKILL_NODES.length - 1}</span>
        </button>
        {SKILL_BRANCHES.map((b) => {
          const n = SKILL_NODES.filter((x) => x.branch === b.id).length
          const on = branch === b.id
          return (
            <button
              key={b.id}
              onClick={() => {
                setBranch(b.id)
                setSelectedId(null)
              }}
              aria-pressed={on}
              className="chip"
              style={on ? { borderColor: b.color, color: b.color, background: `${b.color}14` } : undefined}
            >
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: b.color }} />
              {b.label} <span className="hud">{n}</span>
            </button>
          )
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border-2 border-edge bg-ink">
        <div className="flex items-center justify-between gap-2 border-b-2 border-edge px-3 py-2">
          <span className="text-[10px] leading-tight text-zinc-500">{t('skills.hint')}</span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0, z - 1))}
              disabled={zoom === 0}
              aria-label={t('skills.zoomOut')}
              className="btn h-7 w-7 px-0 py-0 text-sm"
            >
              −
            </button>
            <span className="hud w-10 text-center text-[11px] text-mute">{zoomLabel}</span>
            <button
              onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))}
              disabled={zoom === ZOOMS.length - 1}
              aria-label={t('skills.zoomIn')}
              className="btn h-7 w-7 px-0 py-0 text-sm"
            >
              +
            </button>
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="p-8 text-center text-xs text-mute">{t('skills.empty')}</p>
        ) : (
          <div className="relative">
            <div
              ref={scrollRef}
              className="h-[62vh] overflow-auto"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
                backgroundSize: '22px 22px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#2a2a30 transparent'
              }}
            >
            <svg
              viewBox={`${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`}
              className="block max-w-none"
              style={{ width: `${ZOOMS[zoom] * 100}%`, height: 'auto' }}
              role="group"
              aria-label={t('skills.mapAlt')}
            >
              {edges.map(([a, b]) => {
                const na = byId.get(a)!
                const nb = byId.get(b)!
                const on = selectedId === a || selectedId === b
                return (
                  <line
                    key={`${a}-${b}`}
                    x1={na.x}
                    y1={na.y}
                    x2={nb.x}
                    y2={nb.y}
                    stroke={BRANCH_COLOR[nb.branch]}
                    strokeOpacity={on ? 0.85 : selectedId ? 0.12 : 0.26}
                    strokeWidth={on ? 14 : 8}
                    strokeLinecap="round"
                    strokeDasharray="16 18"
                  />
                )
              })}

              {shown.map((n) => {
                const color = BRANCH_COLOR[n.branch]
                const root = isRoot(n)
                const r = root ? 130 : 96
                const lines = labelLines(n.name)
                const fs = root ? 52 : lines.length >= 4 ? 24 : 30
                const lh = fs + 4
                const on = selectedId === n.id
                const dim = Boolean(selectedId) && !on && !parents.some((p) => p.id === n.id) && !children.some((c) => c.id === n.id)
                return (
                  <g
                    key={n.id}
                    data-node={n.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${n.name}, ${t('skills.levelShort')} ${n.level}/10`}
                    onClick={() => setSelectedId(n.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedId(n.id)
                      }
                    }}
                    className="cursor-pointer"
                    opacity={dim ? 0.35 : 1}
                  >
                    <title>{`${n.name} — ${n.level}/10`}</title>
                    <circle cx={n.x} cy={n.y} r={r + 26} fill={on ? `${color}1f` : 'transparent'} />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r}
                      fill={on ? `${color}26` : '#0b0b0e'}
                      stroke={color}
                      strokeWidth={on ? 14 : root ? 12 : 8}
                    />
                    {zoom >= 2 && (
                      <text
                        x={n.x}
                        y={n.y - ((lines.length - 1) * lh) / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#e9e9ee"
                        fontFamily="Archivo, sans-serif"
                        fontWeight={root ? 700 : 500}
                        fontSize={fs}
                      >
                        {lines.map((line, i) => (
                          <tspan key={line + i} x={n.x} dy={i === 0 ? 0 : lh}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
            </div>
            {selected && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-2">
                <div className="pointer-events-auto max-w-full rounded-xl border-2 border-edge bg-panel/95 px-3 py-1.5 shadow-hard-sm">
                  <span className="font-display text-xs uppercase">{selected.name}</span>
                  <span className="ml-2 text-[10px] text-mute">{t('skills.level', { n: selected.level })}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t-2 border-edge px-3 py-2 text-[10px] text-zinc-500">
          {SKILL_BRANCHES.map((b) => (
            <span key={b.id} className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: b.color }} />
              {b.label}
            </span>
          ))}
          <span className="ml-auto hud text-[10px]">
            {shown.length - (shown.some((n) => n.id === 'start') ? 1 : 0)} / {SKILL_NODES.length - 1}
          </span>
        </div>
      </section>

      {selected ? (
        <section className="card p-4 animate-pop">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-lg uppercase leading-tight">{selected.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="chip" style={{ color: BRANCH_COLOR[selected.branch], borderColor: BRANCH_COLOR[selected.branch] }}>
                  {SKILL_BRANCHES.find((b) => b.id === selected.branch)?.label ?? selected.branch}
                </span>
                <span className="text-mute">{t('skills.level', { n: selected.level })}</span>
              </div>
            </div>
            <button onClick={() => setSelectedId(null)} aria-label={t('skills.close')} className="btn px-2.5 py-1 text-[11px]">
              ✕
            </button>
          </div>

          <div className="mt-3 grid gap-3 border-t-2 border-edge pt-3 sm:grid-cols-2">
            <div>
              <div className="eyebrow">{t('skills.prereq')}</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {parents.length ? (
                  parents.map((p) => (
                    <button key={p.id} onClick={() => setSelectedId(p.id)} className="chip text-[10px]">
                      {p.name}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-mute">{t('skills.none')}</span>
                )}
              </div>
            </div>
            <div>
              <div className="eyebrow">{t('skills.unlocks')}</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {children.length ? (
                  children.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className="chip text-[10px]"
                      style={{ color: BRANCH_COLOR[c.branch] }}
                    >
                      {c.name}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-mute">{t('skills.none')}</span>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <p className="card border-dashed p-4 text-center text-xs text-mute">{t('skills.pick')}</p>
      )}

      <p className="text-[10px] leading-relaxed text-zinc-600">
        {t('skills.source')}{' '}
        <a
          href="https://play.google.com/store/apps/details?id=com.valorcali.app"
          target="_blank"
          rel="noreferrer"
          className="text-ice hover:underline"
        >
          Kinetic (Valor Cali) ↗
        </a>
      </p>
    </div>
  )
}
