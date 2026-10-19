import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { RankBadge } from '../components/RankBadge'
import { weekXpOf } from '../game/engine'
import { DIVISIONS, ZONE, leagueRows, myPosition } from '../game/league'
import { RANKS, rankProgress } from '../game/ranks'
import { RIVALS } from '../game/rivals'
import { weekKey } from '../lib/date'
import { useT } from '../lib/i18n'
import { useCloud } from '../store/useCloud'
import { useStore } from '../store/useStore'

export default function Leaderboard() {
  const player = useStore((s) => s.player)
  const t = useT()
  const workouts = useStore((s) => s.workouts)
  const dismissLeagueResult = useStore((s) => s.dismissLeagueResult)
  const progress = rankProgress(player.xpTotal)
  const cloudUser = useCloud((s) => s.user)
  const onlineScores = useCloud((s) => s.scores)
  const loadScores = useCloud((s) => s.loadScores)

  useEffect(() => {
    if (cloudUser) void loadScores()
  }, [cloudUser, loadScores])

  const league = player.league
  const division = league?.division ?? 0
  const wk = weekKey()
  const myWeekXp = weekXpOf(workouts, wk)
  const rows = useMemo(
    () => leagueRows(division, wk, workouts, player.pseudo),
    [division, wk, workouts, player.pseudo]
  )
  const myLeaguePos = myPosition(rows) + 1
  const beaten = useMemo(() => RIVALS.filter((r) => r.xp <= player.xpTotal).length, [player.xpTotal])
  const ladder = [...RANKS].reverse()

  return (
    <div className="space-y-5 md:space-y-6">
      <header>
        <div className="eyebrow">{t('lb.eyebrow')}</div>
        <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">{t('lb.title')}</h1>
        <p className="mt-1.5 text-xs text-mute">
          {t('lb.subtitle')}{' '}
          <Link to="/niveau" className="text-ice hover:underline">
            {t('lb.estim')}
          </Link>
        </p>
      </header>

      {league && league.lastResult && !league.resultSeen && (
        <section
          className={`card border-2 p-4 ${
            league.lastResult === 'promoted'
              ? 'border-volt'
              : league.lastResult === 'demoted'
                ? 'border-ember'
                : 'border-edge'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-display text-sm uppercase">
                {league.lastResult === 'promoted'
                  ? `⬆️ Promu en ${DIVISIONS[division]} !`
                  : league.lastResult === 'demoted'
                    ? `⬇️ Relégué en ${DIVISIONS[division]}`
                    : '➖ Maintien en division'}
              </div>
              <p className="mt-1 text-xs text-mute">
                {league.lastResult === 'promoted'
                  ? "Tu montes d'une division. La semaine repart à zéro — accroche-toi."
                  : league.lastResult === 'demoted'
                    ? 'Pas de panique : les XP de cette semaine remontent vite.'
                    : 'Tu gardes ta division. On remet ça cette semaine.'}
              </p>
            </div>
            <button onClick={dismissLeagueResult} className="btn shrink-0 px-2.5 py-1 text-[11px]">
              OK
            </button>
          </div>
        </section>
      )}

      <section className="card relative overflow-hidden p-5">
        <div className="tape absolute inset-x-0 top-0" />
        <div className="mt-2 flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
          <div className="flex items-center gap-4">
            <RankBadge from={progress.rank.from} to={progress.rank.to} label={progress.rank.label} size={84} />
            <div className="min-w-0">
              <div className="eyebrow">Rang actuel</div>
              <div className="font-display text-2xl uppercase leading-tight" style={{ color: progress.rank.to }}>
                {progress.rank.name}
              </div>
              <div className="hud mt-1 text-xs text-mute">
                {player.xpTotal.toLocaleString('fr-FR')} XP · #{myLeaguePos} sur {rows.length} dans la ligue
              </div>
            </div>
          </div>

          <div className="flex-1 md:border-l-2 md:border-dashed md:border-edge md:pl-8">
            {progress.next ? (
              <>
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="font-display uppercase">
                    Vers <span className="text-volt">{progress.next.name}</span>
                  </span>
                  <span className="hud text-mute">
                    -{progress.remaining.toLocaleString('fr-FR')} XP
                  </span>
                </div>
                <div className="bar mt-2 h-3">
                  <div
                    style={{
                      width: `${progress.pct}%`,
                      background: `linear-gradient(90deg, ${progress.rank.from}, ${progress.rank.to})`
                    }}
                  />
                </div>
                <div className="hud mt-1.5 flex justify-between text-[10px] text-zinc-500">
                  <span>
                    {progress.into.toLocaleString('fr-FR')} / {progress.need.toLocaleString('fr-FR')} XP
                  </span>
                  <span>
                    {beaten} rival{beaten > 1 ? 's' : ''} dépassé{beaten > 1 ? 's' : ''}
                  </span>
                </div>
              </>
            ) : (
              <div className="card card-volt px-4 py-3 text-center">
                <div className="font-display text-sm uppercase">🏆 Rang maximum — tu es Irréel</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-5 lg:col-span-2">
          {cloudUser && (
            <section>
              <h2 className="eyebrow mb-2.5">Ligue en ligne</h2>
              <div className="space-y-2">
                {onlineScores.length === 0 && (
                  <p className="card border-dashed p-4 text-xs text-mute">
                    Personne d'autre n'est encore inscrit. Partage l'app à tes potes pour lancer la ligue !
                  </p>
                )}
                {onlineScores.map((s, i) => {
                  const me = s.userId === cloudUser.id
                  return (
                    <div
                      key={s.userId}
                      className={`card flex items-center gap-3 px-3.5 py-2.5 ${
                        me ? 'card-volt' : ''
                      }`}
                    >
                      <span
                        className={`hud w-6 text-center text-xs font-bold ${
                          i === 0 ? 'text-volt' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-ember' : 'text-zinc-600'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-lg">🌍</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold">{s.pseudo}</span>
                          {me && <span className="sticker shrink-0">toi</span>}
                        </span>
                        <span className="eyebrow mt-0.5 block">{s.rank}</span>
                      </span>
                      <span className="hud shrink-0 text-xs font-bold">
                        {s.xp.toLocaleString('fr-FR')} XP
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
                Classement partagé entre les joueurs connectés avec Google (seuls ton pseudo et ton XP sont publiés).
              </p>
            </section>
          )}

          <section>
            <h2 className="eyebrow mb-2.5">Ligue {DIVISIONS[division]}</h2>
            <div className="card mb-2.5 flex items-center justify-between gap-3 px-3.5 py-2">
              <span className="text-[10px] text-mute">
                Semaine en cours · top {ZONE} promus, {ZONE} derniers relégués
              </span>
              <span className="hud shrink-0 text-xs font-bold text-volt">
                +{myWeekXp.toLocaleString('fr-FR')} XP
              </span>
            </div>
            <div className="space-y-2">
              {rows.map((r, i) => {
                const promo = i < ZONE
                const releg = i >= rows.length - ZONE
                return (
                  <div
                    key={r.id}
                    className={`card flex items-center gap-3 px-3.5 py-2.5 ${
                      r.me ? 'card-volt' : promo ? 'border-volt/50' : releg ? 'border-ember/50' : ''
                    }`}
                  >
                    <span
                      className={`hud w-6 text-center text-xs font-bold ${
                        i === 0 ? 'text-volt' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-ember' : 'text-zinc-600'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-lg">{r.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">{r.name}</span>
                        {r.me && <span className="sticker shrink-0">toi</span>}
                      </span>
                      {(promo || releg) && (
                        <span className={`eyebrow mt-0.5 block ${promo ? 'text-volt' : 'text-ember'}`}>
                          {promo ? '▲ zone promo' : '▼ zone relégation'}
                        </span>
                      )}
                    </span>
                    <span className="hud shrink-0 text-xs font-bold">
                      {r.xp.toLocaleString('fr-FR')} XP
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
              Ligue hebdo : chaque lundi, nouveau groupe et compteur remis à zéro. Les rivaux sont simulés
              tant que la ligue en ligne n'est pas branchée.
            </p>
          </section>
        </div>

        <section className="lg:sticky lg:top-8 lg:self-start">
          <h2 className="eyebrow mb-2.5">Échelle des rangs</h2>
          <div className="space-y-2">
            {ladder.map((r, i) => {
              const reached = player.xpTotal >= r.minXp
              const isCurrent = r.index === progress.rank.index
              return (
                <div
                  key={r.index}
                  className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 ${
                    isCurrent
                      ? 'border-volt bg-volt/10'
                      : reached
                        ? 'border-edge bg-panel/60'
                        : 'border-edge/60 bg-panel/30 opacity-55'
                  }`}
                >
                  <span className="hud w-5 text-right text-[10px] text-zinc-600">
                    {ladder.length - i}
                  </span>
                  <RankBadge from={r.from} to={r.to} label={r.label} size={isCurrent ? 30 : 24} />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold ${reached ? 'text-zinc-100' : 'text-zinc-400'}`}>
                      {r.name}
                      {r.alias && (
                        <span className="ml-1 text-[10px] font-normal text-zinc-500">({r.alias})</span>
                      )}
                    </span>
                    <span className="hud block text-[10px] text-zinc-500">
                      {r.minXp === 0 ? 'Départ' : `${r.minXp.toLocaleString('fr-FR')} XP`}
                    </span>
                  </span>
                  {isCurrent ? (
                    <span className="sticker shrink-0">toi</span>
                  ) : reached ? (
                    <span className="text-xs text-volt">✓</span>
                  ) : (
                    <span className="hud shrink-0 text-[10px] text-zinc-600">
                      {(r.minXp - player.xpTotal).toLocaleString('fr-FR')}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
