import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WODS, WOD_CATEGORIES, type Wod, type WodCategory } from '../data/wods'
import { wodDayBoard, wodOfDay } from '../game/wodOfDay'
import { dayKey } from '../lib/date'
import { useT } from '../lib/i18n'
import { useStore } from '../store/useStore'

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const clock = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`

type LevelBucket = 'debutant' | 'inter' | 'avance'
type FmtBucket = 'amrap' | 'emom' | 'fortime' | 'autre'
type DurBucket = 'court' | 'moyen' | 'long' | 'nc'
type EquipBucket = 'sol' | 'barre'

const levelBucket = (w: Wod): LevelBucket => {
  const s = normalize(w.level)
  if (s.includes('debutant')) return 'debutant'
  if (s.includes('inter')) return 'inter'
  if (s.includes('avance')) return 'avance'
  return 'inter'
}

const fmtBucket = (w: Wod): FmtBucket => {
  const s = normalize(w.format)
  if (s.includes('amrap')) return 'amrap'
  if (s.includes('emom')) return 'emom'
  if (s.includes('for time')) return 'fortime'
  return 'autre'
}

const durBucket = (w: Wod): DurBucket => {
  const m = w.format.match(/(\d+)\s*'/)
  if (!m) return 'nc'
  const d = Number(m[1])
  return d <= 15 ? 'court' : d <= 30 ? 'moyen' : 'long'
}

const equipBucket = (w: Wod): EquipBucket =>
  /barre|traction|muscle-up|pull-up|pullup|toes-to-bar|kip/.test(normalize(w.detail)) ? 'barre' : 'sol'

const LEVEL_LABELS: Record<LevelBucket, string> = { debutant: 'Débutant', inter: 'Inter', avance: 'Avancé' }
const FMT_LABELS: Record<FmtBucket, string> = { amrap: 'AMRAP', emom: 'EMOM', fortime: 'For Time', autre: 'Autre' }

export default function Wods() {
  const navigate = useNavigate()
  const t = useT()
  const workouts = useStore((s) => s.workouts)
  const favorites = useStore((s) => s.favorites)
  const toggleFavorite = useStore((s) => s.toggleFavorite)

  const [q, setQ] = useState('')
  const [cat, setCat] = useState<WodCategory | 'all'>('all')
  const [level, setLevel] = useState<LevelBucket | 'all'>('all')
  const [fmt, setFmt] = useState<FmtBucket | 'all'>('all')
  const [dur, setDur] = useState<DurBucket | 'all'>('all')
  const [equip, setEquip] = useState<EquipBucket | 'all'>('all')
  const [favOnly, setFavOnly] = useState(false)
  const [surprise, setSurprise] = useState<Wod | null>(null)

  const today = dayKey()
  const todaysWod = wodOfDay(today)
  const doneToday = workouts.some((w) => w.dayKey === today && w.wodId === todaysWod.id)
  const board = wodDayBoard(todaysWod, workouts, today)

  const doneIds = useMemo(
    () => new Set(workouts.map((w) => w.wodId).filter((id): id is string => Boolean(id))),
    [workouts]
  )

  const needle = normalize(q.trim())
  const visible = useMemo(
    () =>
      WODS.filter(
        (w) =>
          (!needle || normalize(`${w.name} ${w.format} ${w.detail} ${w.level}`).includes(needle)) &&
          (cat === 'all' || w.category === cat) &&
          (level === 'all' || levelBucket(w) === level) &&
          (fmt === 'all' || fmtBucket(w) === fmt) &&
          (dur === 'all' || durBucket(w) === dur) &&
          (equip === 'all' || equipBucket(w) === equip) &&
          (!favOnly || favorites.includes(w.id))
      ),
    [needle, cat, level, fmt, dur, equip, favOnly, favorites]
  )

  const sections = useMemo(
    () =>
      WOD_CATEGORIES.filter((c) => cat === 'all' || c.id === cat)
        .map((c) => ({ ...c, wods: visible.filter((w) => w.category === c.id) }))
        .filter((s) => s.wods.length > 0),
    [cat, visible]
  )

  const surprisePick = () => {
    if (!visible.length) return
    setSurprise(visible[Math.floor(Math.random() * visible.length)])
  }

  return (
    <div className="space-y-5">
      <header>
        <div className="eyebrow">{t('wods.eyebrow')}</div>
        <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">
          WOD<span className="text-volt">s</span>
        </h1>
        <p className="mt-1 text-xs text-mute">{t('wods.subtitle', { n: WODS.length })}</p>
      </header>

      <section className="card border-2 border-volt p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="eyebrow">{t('wods.wodOfDay')}</div>
            <div className="mt-1 truncate font-display text-sm uppercase">{todaysWod.name}</div>
            <div className="mt-0.5 truncate text-xs text-mute">
              {todaysWod.format} · {todaysWod.level} · <span className="text-volt">+50 XP bonus</span>
            </div>
          </div>
          {doneToday ? (
            <span className="sticker shrink-0">{t('home.done')}</span>
          ) : (
            <button
              onClick={() => navigate('/workout', { state: { wodId: todaysWod.id } })}
              className="btn btn-volt shrink-0 px-3 py-2 text-xs"
            >
              {t('wods.doIt')}
            </button>
          )}
        </div>

        <div className="mt-3 space-y-1 border-t-2 border-edge pt-2.5">
          <div className="eyebrow">{t('wods.board')}</div>
          {board.rows.map((r, i) => (
            <div
              key={`${r.name}-${i}`}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                r.me ? 'border-2 border-volt/60 bg-volt/10' : ''
              }`}
            >
              <span className="hud w-5 shrink-0 text-mute">{i + 1}</span>
              <span className="shrink-0">{r.emoji}</span>
              <span className={`min-w-0 flex-1 truncate font-semibold ${r.me ? 'text-volt' : 'text-zinc-300'}`}>
                {r.name}
              </span>
              <span className="hud shrink-0 text-[11px] text-mute">
                {board.unit === 'temps' ? clock(r.value) : `${r.value} reps`}
              </span>
            </div>
          ))}
          {!doneToday && <p className="pt-1 text-[10px] text-zinc-500">{t('wods.boardNote')}</p>}
        </div>
      </section>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('wods.search')}
        aria-label="Rechercher un WOD"
        className="input"
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select value={level} onChange={(e) => setLevel(e.target.value as LevelBucket | 'all')} className="input" aria-label="Filtrer par niveau">
          <option value="all">Niveau : tous</option>
          <option value="debutant">Débutant</option>
          <option value="inter">Inter</option>
          <option value="avance">Avancé</option>
        </select>
        <select value={fmt} onChange={(e) => setFmt(e.target.value as FmtBucket | 'all')} className="input" aria-label="Filtrer par format">
          <option value="all">Format : tous</option>
          <option value="amrap">AMRAP</option>
          <option value="emom">EMOM</option>
          <option value="fortime">For Time</option>
          <option value="autre">Autre</option>
        </select>
        <select value={dur} onChange={(e) => setDur(e.target.value as DurBucket | 'all')} className="input" aria-label="Filtrer par durée">
          <option value="all">Durée : toutes</option>
          <option value="court">≤ 15 min</option>
          <option value="moyen">15–30 min</option>
          <option value="long">&gt; 30 min</option>
        </select>
        <select value={equip} onChange={(e) => setEquip(e.target.value as EquipBucket | 'all')} className="input" aria-label="Filtrer par matériel">
          <option value="all">Matériel : tous</option>
          <option value="sol">Sans matériel</option>
          <option value="barre">Barre</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFavOnly((v) => !v)}
          aria-pressed={favOnly}
          className={`chip ${favOnly ? 'chip-on' : ''}`}
        >
          {t('wods.favorites')} <span className="hud">{favorites.length}</span>
        </button>
        <button onClick={surprisePick} disabled={!visible.length} className="chip">
          {t('wods.surprise')}
        </button>
      </div>

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

      {surprise && (
        <section className="card card-volt p-4 animate-pop">
          <div className="flex items-center justify-between gap-2">
            <div className="eyebrow">{t('wods.surpriseTitle')}</div>
            <button onClick={() => setSurprise(null)} aria-label="Fermer" className="btn px-2.5 py-1 text-[11px]">
              ✕
            </button>
          </div>
          <div className="mt-1.5 font-display text-base uppercase leading-tight">{surprise.name}</div>
          <div className="mt-1.5">
            <span className="sticker">{surprise.format}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">{surprise.detail}</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => navigate('/workout', { state: { wodId: surprise.id } })}
              className="btn btn-volt flex-1 py-2.5 text-xs"
            >
              {t('wods.doThis')}
            </button>
            <button onClick={surprisePick} aria-label="Relancer le dé" className="btn px-3 py-2.5 text-xs">
              🎲
            </button>
          </div>
        </section>
      )}

      {visible.length === 0 && (
        <p className="card border-dashed p-6 text-center text-xs text-mute">{t('wods.empty')}</p>
      )}

      <div className="flex items-center gap-3">
        <p className="text-xs text-mute">
          <span className="hud text-volt">{visible.length}</span> WOD{visible.length > 1 ? 's' : ''} affiché
          {visible.length > 1 ? 's' : ''} · formats {Object.values(FMT_LABELS).join(' / ')} · niveaux{' '}
          {Object.values(LEVEL_LABELS).join(' / ')}
        </p>
      </div>

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
              <article key={w.id} className="card relative flex flex-col p-4">
                <button
                  onClick={() => toggleFavorite(w.id)}
                  aria-pressed={favorites.includes(w.id)}
                  aria-label={favorites.includes(w.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  className="absolute right-3 top-3 text-base leading-none"
                >
                  {favorites.includes(w.id) ? '⭐' : '☆'}
                </button>
                <h3 className="pr-8 font-display text-base uppercase leading-tight">{w.name}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="sticker">{w.format}</span>
                  {doneIds.has(w.id) && <span className="sticker">{t('home.done')}</span>}
                </div>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-400">{w.detail}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t-2 border-edge pt-2.5">
                  <span className="chip text-[10px]">{w.level}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/workout', { state: { wodId: w.id } })}
                      className="chip"
                      aria-label={`Lancer ${w.name}`}
                    >
                      {t('wods.do')}
                    </button>
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
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
