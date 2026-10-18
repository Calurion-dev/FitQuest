import { useRef, useState } from 'react'
import { CloudAccount } from '../components/CloudAccount'
import { dayKey } from '../lib/date'
import { useStore } from '../store/useStore'

const REST_OPTIONS = [60, 90, 120, 180]

export default function Settings() {
  const player = useStore((s) => s.player)
  const settings = useStore((s) => s.settings)
  const workouts = useStore((s) => s.workouts)
  const spots = useStore((s) => s.spots)
  const reviews = useStore((s) => s.reviews)
  const badges = useStore((s) => s.badges)
  const setPseudo = useStore((s) => s.setPseudo)
  const setSettings = useStore((s) => s.setSettings)
  const replaceAll = useStore((s) => s.replaceAll)
  const resetAll = useStore((s) => s.resetAll)

  const [name, setName] = useState(player.pseudo)
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportData = () => {
    const data = {
      app: 'street-workout-rpg',
      version: 1,
      exportedAt: new Date().toISOString(),
      player,
      workouts,
      spots,
      reviews,
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
        </section>

        <section className="card p-4">
          <h2 className="eyebrow mb-2">Données</h2>
          <p className="mb-3.5 text-xs leading-relaxed text-mute">
            <span className="hud">{workouts.length}</span> séance{workouts.length > 1 ? 's' : ''} ·{' '}
            <span className="hud">{spots.length}</span> spot{spots.length > 1 ? 's' : ''} ·{' '}
            <span className="hud">{reviews.length}</span> avis. Tout est stocké localement dans ton
            navigateur, rien n'est envoyé sur Internet.
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
              <div className="eyebrow mt-1">v0.1 — street workout RPG</div>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-mute">
              XP, niveaux, quêtes, streak, badges, boss mensuels et carte des spots. Ajoute l'app à ton
              écran d'accueil pour l'utiliser comme une vraie app, même au parc sans réseau.
            </p>
          </div>
          <div className="mt-4 border-t-2 border-dashed border-edge pt-3">
            <div className="eyebrow mb-1.5">Crédits</div>
            <p className="text-[11px] leading-relaxed text-mute">
              Développé par{' '}
              <a
                href="https://github.com/Calurion-dev/FitQuest"
                target="_blank"
                rel="noreferrer"
                className="text-ice hover:underline"
              >
                Calurion-dev
              </a>{' '}
              — React, TypeScript, Vite, Tailwind CSS. Banque de WOD compilée à partir de ces sources
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
