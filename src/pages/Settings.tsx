import { useRef, useState } from 'react'
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
      setMessage("Fichier invalide ❌")
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black">Réglages</h1>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">Héros</h2>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-base outline-none focus:border-emerald-500"
          />
          <button
            disabled={!name.trim() || name.trim() === player.pseudo}
            onClick={() => setPseudo(name.trim())}
            className="rounded-xl bg-emerald-500 px-4 font-bold text-zinc-950 disabled:opacity-40"
          >
            OK
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
          Repos par défaut entre les séries
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {REST_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setSettings({ restSec: r })}
              className={`rounded-xl border py-2.5 text-sm font-bold ${
                settings.restSec === r
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
              }`}
            >
              {r}s
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-zinc-400">Données</h2>
        <p className="mb-3 text-xs text-zinc-500">
          {workouts.length} séance{workouts.length > 1 ? 's' : ''} · {spots.length} spot{spots.length > 1 ? 's' : ''} ·{' '}
          {reviews.length} avis. Tout est stocké localement dans ton navigateur, rien n'est envoyé sur Internet.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={exportData}
            className="rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 text-sm font-bold text-zinc-200"
          >
            ⬇️ Exporter
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 text-sm font-bold text-zinc-200"
          >
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
        {message && <div className="mt-2 text-xs text-zinc-400">{message}</div>}
        <button
          onClick={() => {
            if (confirm('Supprimer TOUTES tes données (séances, spots, avis, progression) ? Action irréversible.')) {
              resetAll()
              setMessage('Données réinitialisées')
            }
          }}
          className="mt-3 w-full rounded-xl border border-red-500/40 py-2.5 text-sm font-bold text-red-400"
        >
          🗑️ Tout réinitialiser
        </button>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs leading-relaxed text-zinc-500">
        <div className="mb-1 text-sm font-bold text-zinc-300">Street Workout RPG v0.1</div>
        <p>
          MVP web : XP, niveaux, quêtes, streak, badges, boss mensuels et carte des spots. Ajoute l'app à ton écran
          d'accueil pour l'utiliser comme une vraie app, même au parc sans réseau.
        </p>
        <p className="mt-1">Prochaine étape (V2) : comptes en ligne, clans et défis entre amis, spots partagés.</p>
      </section>
    </div>
  )
}
