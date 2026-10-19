import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RankBadge } from '../components/RankBadge'
import { StretchGuide } from '../components/StretchGuide'
import { STAT_META, movementById } from '../data/movements'
import {
  SUB_XP_BASE,
  activeBonusPercent,
  levelInfo,
  perfectWeeks,
  questProgress,
  totalReps,
  visitedSpots,
  weekXpOf
} from '../game/engine'
import { CHALLENGES, challengeById, challengeDoneDays, challengeFinished } from '../game/challenges'
import { rankProgress } from '../game/ranks'
import { wodOfDay } from '../game/wodOfDay'
import { dateFromKey, dayKey, weekKey } from '../lib/date'
import { useStore } from '../store/useStore'
import type { Family, Quest, StatKey, Workout } from '../types'

function QuestRow({ quest, workouts }: { quest: Quest; workouts: Workout[] }) {
  const progress = Math.min(quest.target, questProgress(quest, workouts))
  const pct = Math.round((progress / quest.target) * 100)
  return (
    <div className="card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>{quest.icon}</span>
          {quest.title}
        </div>
        {quest.claimed ? (
          <span className="sticker shrink-0">fait</span>
        ) : (
          <span className="hud shrink-0 text-xs font-bold text-volt">+{quest.rewardXp} XP</span>
        )}
      </div>
      <div className="mt-1 text-xs text-mute">{quest.description}</div>
      <div className="bar mt-2.5">
        <div style={{ width: `${pct}%` }} />
      </div>
      <div className="hud mt-1 text-right text-[10px] text-zinc-500">
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
        <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
          <span>{meta.icon}</span>
          {meta.label}
        </span>
        <span className="hud text-[11px] text-mute">Nv {String(info.level).padStart(2, '0')}</span>
      </div>
      <div className="bar mt-1.5">
        <div style={{ width: `${info.pct}%` }} />
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
  const settings = useStore((s) => s.settings)
  const weekPlan = useStore((s) => s.weekPlan)
  const markReportSeen = useStore((s) => s.markReportSeen)
  const acceptWager = useStore((s) => s.acceptWager)
  const dismissWager = useStore((s) => s.dismissWager)
  const startChallenge = useStore((s) => s.startChallenge)
  const abandonChallenge = useStore((s) => s.abandonChallenge)
  const [name, setName] = useState('')
  const [recoveryOpen, setRecoveryOpen] = useState(false)

  if (!player.pseudo) {
    return (
      <div className="flex min-h-[70vh] flex-col justify-center gap-6 md:min-h-[60vh]">
        <div className="mx-auto w-full max-w-md text-center">
          <div className="font-display text-4xl tracking-tight md:text-5xl">
            FIT<span className="text-volt">QUEST</span>
          </div>
          <div className="tape mx-auto mt-4 w-40 rounded-full" />
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Tes pompes, dips et tractions deviennent de l'XP, des niveaux, des quêtes et des boss à
            vaincre. Crée ton héros pour lancer le compteur.
          </p>
        </div>
        <div className="card mx-auto w-full max-w-md p-4">
          <div className="eyebrow mb-2">Nom de héros</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Kevin du parc"
            className="input"
          />
          <button
            disabled={!name.trim()}
            onClick={() => setPseudo(name.trim())}
            className="btn btn-volt mt-3 w-full py-4 text-base"
          >
            Créer mon héros
          </button>
        </div>
      </div>
    )
  }

  const info = levelInfo(player.xpTotal)
  const rank = rankProgress(player.xpTotal)
  const bonus = activeBonusPercent(workouts)
  const daily = quests.filter((q) => q.type === 'daily')
  const weekly = quests.filter((q) => q.type === 'weekly')
  const boss = quests.find((q) => q.type === 'boss')
  const reps = totalReps(workouts)
  const visited = visitedSpots(workouts).length
  const today = dayKey()
  const todaysWod = wodOfDay(today)
  const wodDone = workouts.some((w) => w.dayKey === today && w.wodId === todaysWod.id)
  const wk = weekKey()
  const prevWk = weekKey(new Date(Date.now() - 7 * 86400000))
  const prevPrevWk = weekKey(new Date(Date.now() - 14 * 86400000))
  const weekOf = (w: Workout) => weekKey(dateFromKey(w.dayKey))
  const prevWeekWorkouts = workouts.filter((w) => weekOf(w) === prevWk)
  const prevPrevCount = workouts.filter((w) => weekOf(w) === prevPrevWk).length
  const showReport = player.lastReportWeekKey !== wk && prevWeekWorkouts.length > 0
  const prevReps = prevWeekWorkouts.reduce((a, w) => a + w.sets.reduce((b, s) => b + (s.reps ?? 0), 0), 0)
  const prevXp = weekXpOf(workouts, prevWk)
  const perfect = perfectWeeks(workouts, weekPlan)
  const reportDiff = prevPrevCount > 0 ? Math.round(((prevWeekWorkouts.length - prevPrevCount) / prevPrevCount) * 100) : null
  const challengeDef = player.challenge ? challengeById(player.challenge.id) : undefined
  const challengeDone = challengeDef && player.challenge ? challengeDoneDays(challengeDef, player.challenge.startedDay, workouts) : 0
  const challengeOver = challengeDef && player.challenge ? challengeFinished(challengeDef, player.challenge.startedDay, workouts) : false
  const nextMilestone = challengeDef && player.challenge ? challengeDef.milestones.find((m) => challengeDone < m.days) : undefined
  const wager = player.wager
  const wagerStake = Math.min(200, Math.floor((player.xpTotal * 0.1) / 10) * 10)
  const lastFamilies: Family[] = Array.from(
    new Set((workouts[0]?.sets ?? []).map((s) => movementById(s.movementId)?.family).filter((f): f is Family => Boolean(f)))
  )

  return (
    <div className="space-y-5 md:space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Héros</div>
          <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">{player.pseudo}</h1>
          <div className="mt-2 flex items-center gap-2">
            <RankBadge from={rank.rank.from} to={rank.rank.to} label={rank.rank.label} size={26} />
            <span className="font-display text-xs uppercase tracking-wide" style={{ color: rank.rank.to }}>
              {rank.rank.name}
            </span>
          </div>
        </div>
        <div className="card flex items-center gap-2.5 px-3.5 py-2">
          <span className="text-xl leading-none">🔥</span>
          <div>
            <div className="hud text-lg font-bold leading-none">{player.streakDays}</div>
            <div className="eyebrow mt-1">jours d'affilée</div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        {/* Colonne principale */}
        <div className="space-y-4 lg:col-span-2 lg:space-y-5">
          <section className="card card-volt relative overflow-hidden p-5">
            <div className="tape absolute inset-x-0 top-0" />
            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <div className="eyebrow">Niveau</div>
                <div className="hud text-5xl font-bold leading-none md:text-6xl">
                  {String(info.level).padStart(2, '0')}
                </div>
                <div className="hud mt-2 text-[11px] text-mute">
                  {info.into} / {info.need} XP vers le niveau {info.level + 1}
                </div>
              </div>
              <div className="text-right">
                <div className="hud text-2xl font-bold leading-none">
                  {player.xpTotal.toLocaleString('fr-FR')}
                </div>
                <div className="eyebrow mt-1.5">XP total</div>
              </div>
            </div>
            <div className="bar mt-4 h-3">
              <div style={{ width: `${info.pct}%` }} />
            </div>
            {bonus > 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="sticker">+{bonus}% XP</span>
                <span className="text-zinc-300">Bonus régularité actif (3 séances cette semaine)</span>
              </div>
            )}
            <button onClick={() => navigate('/workout')} className="btn btn-volt mt-5 w-full py-4 text-base">
              💪 Démarrer une séance
            </button>
          </section>

          <section className="card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="eyebrow">📚 WOD du jour</p>
                <div className="mt-1 truncate font-display text-sm uppercase">{todaysWod.name}</div>
                <div className="mt-0.5 truncate text-xs text-mute">
                  {todaysWod.format} · {todaysWod.level} · <span className="text-volt">+50 XP bonus</span>
                </div>
              </div>
              {wodDone ? (
                <span className="sticker shrink-0">fait ✅</span>
              ) : (
                <button
                  onClick={() => navigate('/workout', { state: { wodId: todaysWod.id } })}
                  className="btn btn-volt shrink-0 px-3 py-2 text-xs"
                >
                  Faire ⚡
                </button>
              )}
            </div>
          </section>

          <section className="grid grid-cols-3 gap-2.5 md:gap-3">
            <div className="stat">
              <div className="hud text-xl font-bold">{workouts.length}</div>
              <div className="eyebrow mt-1">séances</div>
            </div>
            <div className="stat">
              <div className="hud text-xl font-bold">{reps.toLocaleString('fr-FR')}</div>
              <div className="eyebrow mt-1">répétitions</div>
            </div>
            <div className="stat">
              <div className="hud text-xl font-bold">{visited}</div>
              <div className="eyebrow mt-1">spots visités</div>
            </div>
          </section>

          <section className="card p-4">
            <h2 className="eyebrow mb-3.5">Stats RPG</h2>
            <div className="grid gap-4 md:grid-cols-2 md:gap-x-6">
              {(Object.keys(player.stats) as StatKey[]).map((k) => (
                <StatBar key={k} stat={k} xp={player.stats[k]} />
              ))}
            </div>
          </section>

          {settings.postStretch && workouts.length > 0 && (
            <section className="card flex items-center justify-between gap-3 p-4">
              <div>
                <h2 className="eyebrow">Récupération</h2>
                <p className="mt-1 text-xs text-mute">Étirements guidés (~5 min) après tes séances.</p>
              </div>
              <button onClick={() => setRecoveryOpen(true)} className="btn shrink-0 px-3 py-2 text-xs">
                🧘 Étirements
              </button>
            </section>
          )}
          {recoveryOpen && <StretchGuide families={lastFamilies} onClose={() => setRecoveryOpen(false)} />}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4 lg:space-y-5">
          {showReport && (
            <section className="card border-2 border-volt p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="eyebrow">📊 Ta semaine dernière</h2>
                <button onClick={() => markReportSeen(wk)} className="btn px-2.5 py-1 text-[11px]">
                  Compris
                </button>
              </div>
              <div className="hud mt-2 text-2xl font-bold">
                {prevWeekWorkouts.length} séance{prevWeekWorkouts.length > 1 ? 's' : ''}
              </div>
              <p className="mt-1 text-xs text-mute">
                {prevReps.toLocaleString('fr-FR')} reps · +{prevXp} XP
                {reportDiff !== null && (
                  <span className={reportDiff >= 0 ? 'text-volt' : 'text-ember'}>
                    {' '}
                    {reportDiff >= 0 ? '+' : ''}
                    {reportDiff}% vs avant
                  </span>
                )}
              </p>
              <p className="mt-2 text-xs text-zinc-300">
                🔥 Série : {player.streakDays} jour{player.streakDays > 1 ? 's' : ''} · 📅 Semaines parfaites : {perfect}
              </p>
            </section>
          )}
          {boss && (
            <section className="card relative overflow-hidden p-4" style={{ borderColor: 'color-mix(in srgb, var(--color-ember) 45%, transparent)' }}>
              <div
                className="absolute inset-x-0 top-0 h-2"
                style={{
                  background:
                    'repeating-linear-gradient(45deg, var(--color-ember) 0 8px, var(--color-ink) 8px 16px)'
                }}
              />
              <div className="mt-2 flex items-center gap-2.5">
                <span className="text-2xl">{boss.icon}</span>
                <div className="min-w-0">
                  <div className="eyebrow" style={{ color: 'var(--color-ember)' }}>
                    Boss en cours
                  </div>
                  <div className="truncate font-display text-sm uppercase">{boss.title}</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-mute">{boss.description}</p>
              <div className="mt-3">
                <QuestRow quest={boss} workouts={workouts} />
              </div>
            </section>
          )}

          {wager && (
            <section className="card p-4">
              <h2 className="eyebrow">🎯 Pari de série</h2>
              {wager.result === 'active' ? (
                <>
                  <p className="mt-1 text-xs text-mute">
                    Mise de <span className="text-volt">{wager.stake} XP</span> — paie ×2 si tu t'entraînes
                    chaque jour.
                  </p>
                  <div className="bar mt-2.5">
                    <div style={{ width: `${(wager.days / 7) * 100}%` }} />
                  </div>
                  <div className="hud mt-1 text-right text-[10px] text-zinc-500">{wager.days} / 7 jours</div>
                </>
              ) : (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className={`text-xs ${wager.result === 'won' ? 'text-volt' : 'text-ember'}`}>
                    {wager.result === 'won'
                      ? `Gagné ! +${wager.stake * 2} XP`
                      : `Pari perdu — mise de ${wager.stake} XP envolée.`}
                  </span>
                  <button onClick={dismissWager} className="btn px-2.5 py-1 text-[11px]">
                    OK
                  </button>
                </div>
              )}
            </section>
          )}
          {!wager && wagerStake >= 50 && (
            <section className="card p-4">
              <h2 className="eyebrow">🎯 Pari de série</h2>
              <p className="mt-1 text-xs text-mute">
                Parie {wagerStake} XP : entraîne-toi 7 jours d'affilée et récupère le double. Un jour manqué,
                la mise est perdue.
              </p>
              <button onClick={() => acceptWager(wagerStake)} className="btn mt-2.5 w-full py-2.5 text-xs">
                🎯 Parier {wagerStake} XP
              </button>
            </section>
          )}

          <section className="card p-4">
            <h2 className="eyebrow">🗓️ Défi 21 jours</h2>
            {player.challenge && challengeDef ? (
              <>
                <div className="mt-1 font-display text-sm uppercase">
                  {challengeDef.icon} {challengeDef.name}
                </div>
                <div className="bar mt-2.5">
                  <div style={{ width: `${(challengeDone / 21) * 100}%` }} />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="hud text-[10px] text-zinc-500">{challengeDone} / 21 jours</span>
                  <button
                    onClick={() => {
                      if (challengeOver || confirm('Abandonner ce défi ?')) abandonChallenge()
                    }}
                    className="text-[11px] text-zinc-600 underline"
                  >
                    {challengeOver ? 'Retirer' : 'Abandonner'}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-mute">
                  Objectif quotidien : {challengeDef.dailyLabel}
                  {nextMilestone && ` · Palier ${nextMilestone.days} j : +${nextMilestone.xp} XP`}
                  {challengeOver && ' — défi terminé 🏆'}
                </p>
              </>
            ) : (
              <div className="mt-1 space-y-2">
                {CHALLENGES.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold">
                        {c.icon} {c.name}
                      </div>
                      <div className="text-[10px] text-mute">Chaque jour : {c.dailyLabel}</div>
                    </div>
                    <button onClick={() => startChallenge(c.id)} className="btn shrink-0 px-2.5 py-1 text-[11px]">
                      Démarrer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="eyebrow mb-2.5">Quêtes du jour</h2>
            <div className="space-y-2.5">
              {daily.map((q) => (
                <QuestRow key={q.id} quest={q} workouts={workouts} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="eyebrow mb-2.5">Cette semaine</h2>
            <div className="space-y-2.5">
              {weekly.map((q) => (
                <QuestRow key={q.id} quest={q} workouts={workouts} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
