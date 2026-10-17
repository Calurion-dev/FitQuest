import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STAT_META } from '../data/movements'
import {
  SUB_XP_BASE,
  activeBonusPercent,
  levelInfo,
  questProgress,
  totalReps,
  visitedSpots
} from '../game/engine'
import { useStore } from '../store/useStore'
import type { Quest, StatKey, Workout } from '../types'

function QuestRow({ quest, workouts }: { quest: Quest; workouts: Workout[] }) {
  const progress = Math.min(quest.target, questProgress(quest, workouts))
  const pct = Math.round((progress / quest.target) * 100)
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>{quest.icon}</span>
          {quest.title}
        </div>
        <span className={`shrink-0 text-xs font-semibold ${quest.claimed ? 'text-emerald-400' : 'text-zinc-400'}`}>
          {quest.claimed ? `✓ +${quest.rewardXp}` : `+${quest.rewardXp} XP`}
        </span>
      </div>
      <div className="mt-1 text-xs text-zinc-500">{quest.description}</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${quest.claimed ? 'bg-emerald-400' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-right text-[10px] text-zinc-500">
        {Math.round(progress)} / {quest.target}
      </div>
    </div>
  )
}

function StatBar({ stat, xp }: { stat: StatKey; xp: number }) {
  const info = levelInfo(xp, SUB_XP_BASE)
  const meta = STAT_META[stat]
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-zinc-300">
          <span>{meta.icon}</span>
          {meta.label}
        </span>
        <span className="text-zinc-500">Nv {info.level}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-sky-500/80" style={{ width: `${info.pct}%` }} />
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const player = useStore((s) => s.player)
  const workouts = useStore((s) => s.workouts)
  const quests = useStore((s) => s.quests)
  const setPseudo = useStore((s) => s.setPseudo)
  const [name, setName] = useState('')

  if (!player.pseudo) {
    return (
      <div className="flex min-h-[70vh] flex-col justify-center gap-5">
        <div className="text-center">
          <div className="text-5xl">💪</div>
          <h1 className="mt-3 text-2xl font-black">Street Workout RPG</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Transforme tes pompes, dips et tractions en XP, niveaux, quêtes et boss à vaincre.
          </p>
        </div>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton pseudo de héros"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-base outline-none focus:border-emerald-500"
          />
          <button
            disabled={!name.trim()}
            onClick={() => setPseudo(name.trim())}
            className="w-full rounded-2xl bg-emerald-500 py-3 font-bold text-zinc-950 disabled:opacity-40"
          >
            Créer mon héros
          </button>
        </div>
      </div>
    )
  }

  const info = levelInfo(player.xpTotal)
  const bonus = activeBonusPercent(workouts)
  const daily = quests.filter((q) => q.type === 'daily')
  const weekly = quests.filter((q) => q.type === 'weekly')
  const boss = quests.find((q) => q.type === 'boss')
  const reps = totalReps(workouts)
  const visited = visitedSpots(workouts).length

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-zinc-500">Héros</div>
          <h1 className="text-2xl font-black">{player.pseudo}</h1>
        </div>
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-center">
          <div className="text-lg leading-none">🔥</div>
          <div className="text-xs font-bold text-orange-400">{player.streakDays} j</div>
        </div>
      </header>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-black text-emerald-400">Niveau {info.level}</div>
            <div className="mt-0.5 text-xs text-zinc-500">
              {info.into} / {info.need} XP vers le niveau {info.level + 1}
            </div>
          </div>
          <div className="text-right text-xs text-zinc-500">
            {player.xpTotal.toLocaleString('fr-FR')} XP
            <br />
            total
          </div>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all"
            style={{ width: `${info.pct}%` }}
          />
        </div>
        {bonus > 0 && (
          <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            🔥 Bonus regularité actif : +{bonus}% XP sur chaque série (3 séances ces 7 derniers jours)
          </div>
        )}
        <button
          onClick={() => navigate('/workout')}
          className="mt-4 w-full rounded-2xl bg-emerald-500 py-4 text-base font-bold text-zinc-950 active:scale-[0.98] transition-transform"
        >
          💪 Démarrer une séance
        </button>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">Stats RPG</h2>
        <div className="space-y-3">
          {(Object.keys(player.stats) as StatKey[]).map((k) => (
            <StatBar key={k} stat={k} xp={player.stats[k]} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
          <div className="text-lg font-black text-zinc-100">{workouts.length}</div>
          <div className="text-[10px] text-zinc-500">séances</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
          <div className="text-lg font-black text-zinc-100">{reps.toLocaleString('fr-FR')}</div>
          <div className="text-[10px] text-zinc-500">répétitions</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
          <div className="text-lg font-black text-zinc-100">{visited}</div>
          <div className="text-[10px] text-zinc-500">spots visités</div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">Quêtes du jour</h2>
        <div className="space-y-2">
          {daily.map((q) => (
            <QuestRow key={q.id} quest={q} workouts={workouts} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">Cette semaine</h2>
        <div className="space-y-2">
          {weekly.map((q) => (
            <QuestRow key={q.id} quest={q} workouts={workouts} />
          ))}
        </div>
      </section>

      {boss && (
        <section className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/5 p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{boss.icon}</span>
            <div>
              <div className="text-sm font-bold text-purple-300">{boss.title}</div>
              <div className="text-xs text-zinc-400">{boss.description}</div>
            </div>
          </div>
          <div className="mt-3">
            <QuestRow quest={boss} workouts={workouts} />
          </div>
        </section>
      )}
    </div>
  )
}
