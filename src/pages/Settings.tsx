import { useEffect, useRef, useState } from 'react'
import { CloudAccount } from '../components/CloudAccount'
import { dayKey } from '../lib/date'
import { readErrors } from '../lib/errors'
import { useStore } from '../store/useStore'

const REST_OPTIONS = [60, 90, 120, 180]
const SOUND_OPTIONS: { id: 'off' | 'low' | 'normal'; label: string }[] = [
  { id: 'off', label: 'Off' },
  { id: 'low', label: 'Bas' },
  { id: 'normal', label: 'Normal' }
]

export default function Settings() {
  const player = useStore((s) => s.player)
  const settings = useStore((s) => s.settings)
  const workouts = useStore((s) => s.workouts)
  const routines = useStore((s) => s.routines)
  const weekPlan = useStore((s) => s.weekPlan)
  const spots = useStore((s) => s.spots)
  const reviews = useStore((s) => s.reviews)
  const badges = useStore((s) => s.badges)
  const favorites = useStore((s) => s.favorites)
  const setPseudo = useStore((s) => s.setPseudo)
  const setSettings = useStore((s) => s.setSettings)
  const replaceAll = useStore((s) => s.replaceAll)
  const resetAll = useStore((s) => s.resetAll)

  const [name, setName] = useState(player.pseudo)
  const [message, setMessage] = useState<string | null>(null)
  const [storageProtected, setStorageProtected] = useState<boolean | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    navigator.storage
      ?.persisted?.()
      .then(setStorageProtected)
      .catch(() => setStorageProtected(null))
  }, [])

  const exportData = () => {
    const data = {
      app: 'street-workout-rpg',
      version: 2,
      exportedAt: new Date().toISOString(),
      player,
      workouts,
      routines,
      weekPlan,
      spots,
      reviews,
      favorites,
      quests: useStore.getState().quests,
      badges,
      settings
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `swrpg-export-${dayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setSettings({ lastExportAt: new Date().toISOString() })
    setMessage('Sauvegarde téléchargée ✅')
  }

  const importData = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      replaceAll(data)
      setMessage('Import réussi ✅')
    } catch {
      setMessage('Fichier invalide ❌')
    }
  }

  const reportBug = () => {
    const errors = readErrors()
    const body = [
      'Décris le problème ici.',
      '',
      `Version : ${__APP_VERSION__} (${__COMMIT__})`,
      `Appareil : ${navigator.userAgent}`,
      `Page : ${location.href}`,
      errors.length ? `Dernières erreurs :\n${errors.join('\n')}` : 'Aucune erreur enregistrée.'
    ].join('\n')
    window.open(
      `https://github.com/Calurion-dev/FitQuest/issues/new?title=${encodeURIComponent('[Bug] ')}&body=${encodeURIComponent(body)}`,
      '_blank'
    )
  }

  const daysSinceExport = settings.lastExportAt
    ? Math.floor((Date.now() - new Date(settings.lastExportAt).getTime()) / 86400000)
    : null

  const toggleRow = (label: string, value: boolean, onChange: (v: boolean) => void) => (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-xs font-semibold text-zinc-300">{label}</span>
      <button
        className={`chip shrink-0 ${value ? 'chip-on' : ''}`}
        aria-pressed={value}
        onClick={() => onChange(!value)}
      >
        {value ? 'Activé' : 'Désactivé'}
      </button>
    </div>
  )

  return (
    <div className="space-y-5 md:space-y-6">
      <header>
        <div className="eyebrow">Configuration</div>
        <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">Réglages</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
        <section className="card p-4">
          <h2 className="eyebrow mb-3">Héros</h2>
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className="input flex-1" />
            <button
              disabled={!name.trim() || name.trim() === player.pseudo}
              onClick={() => setPseudo(name.trim())}
              className="btn btn-volt px-5"
            >
              OK
            </button>
          </div>
        </section>

        <CloudAccount />

        <section className="card p-4">
          <h2 className="eyebrow mb-3">Repos par défaut entre les séries</h2>
          <div className="grid grid-cols-4 gap-2">
            {REST_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setSettings({ restSec: r })}
                className={`hud rounded-xl border-2 py-2.5 text-sm font-bold transition-colors ${
                  settings.restSec === r
                    ? 'border-volt bg-volt text-ink'
                    : 'border-edge bg-panel text-mute hover:border-zinc-600'
                }`}
              >
                {r}s
              </button>
            ))}
          </div>
          <h2 className="eyebrow mt-4 mb-2">Son de l'app</h2>
          <div className="grid grid-cols-3 gap-2">
            {SOUND_OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => setSettings({ sound: o.id })}
                className={`rounded-xl border-2 py-2 text-sm font-bold transition-colors ${
                  settings.sound === o.id
                    ? 'border-volt bg-volt text-ink'
                    : 'border-edge bg-panel text-mute hover:border-zinc-600'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="eyebrow mb-2">Confort en séance</h2>
          {toggleRow("Garder l'écran allumé pendant la séance", settings.wakeLock, (v) =>
            setSettings({ wakeLock: v })
          )}
          {toggleRow('Mode plein soleil (contraste max)', settings.sunMode, (v) =>
            setSettings({ sunMode: v })
          )}
          {toggleRow('Échauffement avant la séance', settings.warmup, (v) =>
            setSettings({ warmup: v })
          )}
          {toggleRow('Étirements après la séance', settings.postStretch, (v) =>
            setSettings({ postStretch: v })
          )}
          <h2 className="eyebrow mt-4 mb-2">Unités de lest</h2>
          <div className="grid grid-cols-2 gap-2">
            {(['kg', 'lbs'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setSettings({ units: u })}
                className={`rounded-xl border-2 py-2 text-sm font-bold transition-colors ${
                  settings.units === u
                    ? 'border-volt bg-volt text-ink'
                    : 'border-edge bg-panel text-mute hover:border-zinc-600'
                }`}
              >
                {u === 'kg' ? 'Kilogrammes' : 'Livres'}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="eyebrow mb-2">Données</h2>
          <p className="mb-3.5 text-xs leading-relaxed text-mute">
            <span className="hud">{workouts.length}</span> séance{workouts.length > 1 ? 's' : ''} ·{' '}
            <span className="hud">{spots.length}</span> spot{spots.length > 1 ? 's' : ''} ·{' '}
            <span className="hud">{reviews.length}</span> avis. Tout est stocké localement dans ton
            navigateur, rien n'est envoyé sur Internet.
          </p>
          <p className="mb-3.5 text-[11px] leading-relaxed text-mute">
            Stockage :{' '}
            {storageProtected === true
              ? 'protégé ✓'
              : storageProtected === false
                ? 'non protégé ⚠️ — pense à exporter régulièrement.'
                : 'vérification…'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={exportData} className="btn py-3 text-xs">
              ⬇️ Exporter
            </button>
            <button onClick={() => fileRef.current?.click()} className="btn py-3 text-xs">
              ⬆️ Importer
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void importData(f)
              e.target.value = ''
            }}
          />
          {message && <div className="mt-2 text-xs text-mute">{message}</div>}
          <p
            className={`mt-2 text-[11px] leading-relaxed ${
              daysSinceExport === null || daysSinceExport > 7 ? 'text-ember' : 'text-mute'
            }`}
          >
            {daysSinceExport === null
              ? '⚠️ Aucune sauvegarde exportée pour le moment.'
              : daysSinceExport > 7
                ? `⚠️ Dernière sauvegarde il y a ${daysSinceExport} jours — pense à exporter.`
                : `Dernière sauvegarde il y a ${daysSinceExport === 0 ? "moins d'un jour" : `${daysSinceExport} jour${daysSinceExport > 1 ? 's' : ''}`}.`}
          </p>
          <button
            onClick={() => {
              if (
                confirm('Supprimer TOUTES tes données (séances, spots, avis, progression) ? Action irréversible.')
              ) {
                resetAll()
                setMessage('Données réinitialisées')
              }
            }}
            className="btn btn-danger mt-3 w-full py-3 text-xs"
          >
            🗑️ Tout réinitialiser
          </button>
          <p className="mt-2 text-center text-[11px] text-mute">Cette action est irréversible.</p>
        </section>

        <section className="card relative overflow-hidden p-4 md:col-span-2">
          <div className="tape absolute inset-x-0 top-0" />
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="font-display text-lg uppercase">
                FIT<span className="text-volt">QUEST</span>
              </div>
              <div className="eyebrow mt-1">
                v{__APP_VERSION__} ({__COMMIT__}) — street workout RPG
              </div>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-mute">
              XP, niveaux, quêtes, streak, badges, boss mensuels et carte des spots. Ajoute l'app à ton
              écran d'accueil pour l'utiliser comme une vraie app, même au parc sans réseau.
            </p>
          </div>
          <button onClick={reportBug} className="btn mt-4 px-4 py-2 text-xs">
            🐛 Signaler un bug
          </button>
          <div className="mt-4 border-t-2 border-dashed border-edge pt-3">
            <div className="eyebrow mb-1.5">Crédits</div>
            <p className="text-xs font-semibold text-zinc-300">
              Développement —{' '}
              <a
                href="https://github.com/Calurion-dev/FitQuest"
                target="_blank"
                rel="noreferrer"
                className="text-ice hover:underline"
              >
                Calurion
              </a>
            </p>
            <p className="mt-1.5 text-xs font-semibold text-zinc-300">
              © {new Date().getFullYear()} Calurion — Tous droits réservés.
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-mute">
              Remerciements : <span className="font-semibold text-zinc-300">Brieuc Le Dantec</span>, pour
              certaines routines.
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-mute">
              React, TypeScript, Vite, Tailwind CSS. Banque de WOD compilée à partir de ces sources
              publiques : calisthenics-parks.com, caliverse.app, callisthenies.fr, crossfit.com, darebee.com,
              decathloncoach.com, fitnessfaqs.com, halhigdon.com, hyrox.com, jimwendler.com, madbarz.com,
              mcmillanrunning.com, nike.com (NRC), planet-streetworkout.org, polar.com, fr.runningheroes.com,
              runkeeper.com, solostreetworkout.com, streetlifting.com, streetparking.com, stronglifts.com,
              thenx.com, u-run.fr, uptrackplus.com, wodwell.com, YouTube (Bar Brothers). Contenus et marques
              cités appartiennent à leurs auteurs.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
