import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { STANDARD_LEVELS, standardLevel } from '../data/standards'

const FIELDS = [
  { param: 't', id: 'tractions_pronation', label: 'Tractions', unit: 'reps' },
  { param: 'p', id: 'pompes', label: 'Pompes', unit: 'reps' },
  { param: 'd', id: 'dips', label: 'Dips', unit: 'reps' },
  { param: 'ps', id: 'pistol', label: 'Pistol squats', unit: 'reps' },
  { param: 'g', id: 'gainage', label: 'Gainage', unit: 'secondes' }
]

const DESCRIPTIONS = [
  'Les bases se construisent. Reste régulier et ça grimpe vite.',
  'Bon niveau ! La barre au-dessus est à portée.',
  'Solide — tu fais partie des costauds du parc.',
  'Niveau élite. Respect 🐐'
]

/** Calculateur public : aucune donnée locale, juste les repères. Lien partageable via l'URL. */
export default function Level() {
  const [params] = useSearchParams()
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.param, params.get(f.param) ?? '']))
  )
  const [copied, setCopied] = useState(false)

  const filled = FIELDS.map((f) => ({
    ...f,
    value: Math.max(0, Math.floor(Number((values[f.param] ?? '').replace(',', '.')) || 0))
  })).filter((f) => f.value > 0)

  const levels = filled.map((f) => ({ ...f, std: standardLevel(f.id, f.value) })).filter((l) => l.std)
  const overall = levels.length
    ? Math.floor(levels.reduce((a, l) => a + (l.std?.index ?? 0), 0) / levels.length)
    : null

  const shareUrl = `${window.location.origin}${window.location.pathname}#/niveau?${new URLSearchParams(
    filled.map((f) => [f.param, String(f.value)])
  ).toString()}`

  const share = async () => {
    const text = `Mon profil street workout sur FitQuest : ${overall !== null ? STANDARD_LEVELS[overall] : '—'} — ${filled
      .map((f) => `${f.value} ${f.label.toLowerCase()}`)
      .join(', ')}. Et toi ?`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'FitQuest — mon niveau', text, url: shareUrl })
        return
      } catch {
        // partage annulé : on retombe sur le presse-papiers
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // pas de presse-papiers : rien de bloquant
    }
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <header>
        <div className="eyebrow">Outil — à partager</div>
        <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">
          Quel est ton niveau<span className="text-volt"> ?</span>
        </h1>
        <p className="mt-1.5 text-xs text-mute">
          Entre tes meilleures séries (pas besoin de compte) et compare-toi aux repères calisthenics.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <section className="card p-4 md:p-5">
          <h2 className="eyebrow mb-3">Tes meilleures séries</h2>
          <div className="space-y-3">
            {FIELDS.map((f) => (
              <label key={f.param} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs">{f.label}</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={values[f.param] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.param]: e.target.value }))}
                  placeholder="0"
                  className="input flex-1"
                />
                <span className="w-16 shrink-0 text-[10px] text-mute">{f.unit}</span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
            Repères indicatifs, à prendre comme des ordres de grandeur. Gainage : temps max en planche.
          </p>
        </section>

        <section className="space-y-4">
          <div className="card card-volt p-5 text-center">
            <div className="eyebrow">Niveau global</div>
            <div className="hud mt-2 text-4xl font-bold">
              {overall !== null ? STANDARD_LEVELS[overall] : '—'}
            </div>
            <p className="mt-2 text-xs text-zinc-300">
              {overall !== null ? DESCRIPTIONS[overall] : 'Renseigne au moins une série pour voir ton niveau.'}
            </p>
            {levels.length > 0 && (
              <div className="mt-4 space-y-1.5 text-left">
                {levels.map((l) => (
                  <div key={l.param} className="flex items-center gap-2 text-xs">
                    <span className="min-w-0 flex-1 truncate">{l.label}</span>
                    <span className="hud shrink-0 text-[11px]" style={{ color: l.std?.color }}>
                      {l.std?.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={share} disabled={overall === null} className="btn btn-volt px-3 py-3 text-xs">
              {copied ? 'Lien copié ✅' : '📤 Partager'}
            </button>
            <Link to="/" className="btn px-3 py-3 text-center text-xs">
              Créer mon héros →
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
