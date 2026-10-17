import { useMemo, useState } from 'react'
import { WODS, WOD_CATEGORIES, type Wod, type WodCategory } from '../data/wods'

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default function Wods() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<WodCategory | 'all'>('all')

  const needle = normalize(q.trim())
  const matches = useMemo(
    () => (w: Wod) =>
      !needle || normalize(`${w.name} ${w.format} ${w.detail} ${w.level}`).includes(needle),
    [needle]
  )

  const sections = useMemo(
    () =>
      WOD_CATEGORIES.filter((c) => cat === 'all' || c.id === cat)
        .map((c) => ({ ...c, wods: WODS.filter((w) => w.category === c.id && matches(w)) }))
        .filter((s) => s.wods.length > 0),
    [cat, matches]
  )

  const total = sections.reduce((n, s) => n + s.wods.length, 0)

  return (
    <div className="space-y-5">
      <header>
        <div className="eyebrow">Banque de séances</div>
        <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">
          WOD<span className="text-volt">s</span>
        </h1>
        <p className="mt-1 text-xs text-mute">
          {WODS.length} séances calisthénie, street lifting et course — sources en bas de chaque fiche.
        </p>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Chercher un WOD, un mouvement, une distance…"
        aria-label="Rechercher un WOD"
        className="input"
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
        <button
          onClick={() => setCat('all')}
          aria-pressed={cat === 'all'}
          className={`chip ${cat === 'all' ? 'chip-on' : ''}`}
        >
          Tous <span className="hud">{WODS.length}</span>
        </button>
        {WOD_CATEGORIES.map((c) => {
          const n = WODS.filter((w) => w.category === c.id).length
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              aria-pressed={cat === c.id}
              className={`chip ${cat === c.id ? 'chip-on' : ''}`}
            >
              {c.icon} {c.label} <span className="hud">{n}</span>
            </button>
          )
        })}
      </div>

      {total === 0 && (
        <p className="card border-dashed p-6 text-center text-xs text-mute">
          Aucun WOD ne correspond à « {q.trim()} ». Essaie « run », « tractions », « AMRAP »…
        </p>
      )}

      {sections.map((s) => (
        <section key={s.id} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="eyebrow">
              {s.icon} {s.label}
            </h2>
            <span className="hud text-[11px] text-mute">{s.wods.length}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {s.wods.map((w) => (
              <article key={w.id} className="card flex flex-col p-4">
                <h3 className="font-display text-base uppercase leading-tight">{w.name}</h3>
                <div className="mt-1.5">
                  <span className="sticker">{w.format}</span>
                </div>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-400">{w.detail}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t-2 border-edge pt-2.5">
                  <span className="chip text-[10px]">{w.level}</span>
                  {w.source && (
                    <a
                      href={w.source}
                      target="_blank"
                      rel="noreferrer"
                      className="hud text-[10px] text-ice hover:underline"
                    >
                      ↗ {hostOf(w.source)}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
