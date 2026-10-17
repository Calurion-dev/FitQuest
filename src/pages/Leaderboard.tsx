import { useEffect, useMemo } from 'react'
import { RankBadge } from '../components/RankBadge'
import { RANKS, rankFromXp, rankProgress } from '../game/ranks'
import { RIVALS } from '../game/rivals'
import { useCloud } from '../store/useCloud'
import { useStore } from '../store/useStore'

export default function Leaderboard() {
  const player = useStore((s) => s.player)
  const progress = rankProgress(player.xpTotal)
  const cloudUser = useCloud((s) => s.user)
  const onlineScores = useCloud((s) => s.scores)
  const loadScores = useCloud((s) => s.loadScores)

  useEffect(() => {
    if (cloudUser) void loadScores()
  }, [cloudUser, loadScores])

  const entries = useMemo(() => {
    return [
      ...RIVALS.map((r) => ({ id: r.id, name: r.name, xp: r.xp, emoji: r.emoji, me: false })),
      { id: 'me', name: player.pseudo || 'Toi', xp: player.xpTotal, emoji: '🦸', me: true }
    ].sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name))
  }, [player.pseudo, player.xpTotal])

  const myPosition = entries.findIndex((e) => e.me) + 1
  const beaten = entries.filter((e) => !e.me && e.xp <= player.xpTotal).length
  const ladder = [...RANKS].reverse()

  return (
    <div className="space-y-5 md:space-y-6">
      <header>
        <div className="eyebrow">Ligue</div>
        <h1 className="mt-0.5 text-3xl uppercase md:text-4xl">Classement</h1>
        <p className="mt-1.5 text-xs text-mute">
          Ton rang grimpe avec ton XP total, comme dans le mode Classé de Fortnite.
        </p>
      </header>

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
                {player.xpTotal.toLocaleString('fr-FR')} XP · #{myPosition} sur {entries.length}
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
            <h2 className="eyebrow mb-2.5">Ligue locale</h2>
            <div className="space-y-2">
              {entries.map((e, i) => {
                const rank = rankFromXp(e.xp)
                return (
                  <div
                    key={e.id}
                    className={`card flex items-center gap-3 px-3.5 py-2.5 ${e.me ? 'card-volt' : ''}`}
                  >
                    <span
                      className={`hud w-6 text-center text-xs font-bold ${
                        i === 0 ? 'text-volt' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-ember' : 'text-zinc-600'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-lg">{e.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">{e.name}</span>
                        {e.me && <span className="sticker shrink-0">toi</span>}
                      </span>
                      <span className="eyebrow mt-0.5 block">{rank.name}</span>
                    </span>
                    <span className="hud shrink-0 text-xs font-bold">
                      {e.xp.toLocaleString('fr-FR')} XP
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
              Les rivaux de la ligue locale sont simulés pour l'instant : le classement en ligne entre amis
              (et les duels) arrivera avec la V2.
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
