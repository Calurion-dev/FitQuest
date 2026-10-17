import { useMemo } from 'react'
import { RankBadge } from '../components/RankBadge'
import { RANKS, rankFromXp, rankProgress } from '../game/ranks'
import { RIVALS } from '../game/rivals'
import { useStore } from '../store/useStore'

export default function Leaderboard() {
  const player = useStore((s) => s.player)
  const progress = rankProgress(player.xpTotal)

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
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black">Classement</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Ton rang grimpe avec ton XP total, comme dans le mode Classé de Fortnite.
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-4">
          <RankBadge from={progress.rank.from} to={progress.rank.to} label={progress.rank.label} size={76} />
          <div className="min-w-0 flex-1">
            <div className="text-xl font-black" style={{ color: progress.rank.to }}>
              {progress.rank.name}
            </div>
            <div className="text-xs text-zinc-400">
              {player.xpTotal.toLocaleString('fr-FR')} XP au total
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              #{myPosition} sur {entries.length} · {beaten} rival{beaten > 1 ? 's' : ''} dépassé
              {beaten > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="mt-4">
          {progress.next ? (
            <>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-zinc-300">
                  Vers {progress.next.name}
                </span>
                <span className="text-zinc-500">
                  encore {progress.remaining.toLocaleString('fr-FR')} XP
                </span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress.pct}%`,
                    background: `linear-gradient(90deg, ${progress.rank.from}, ${progress.rank.to})`
                  }}
                />
              </div>
              <div className="mt-1 text-right text-[10px] text-zinc-500">
                {progress.into.toLocaleString('fr-FR')} / {progress.need.toLocaleString('fr-FR')} XP
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-2 text-center text-xs font-bold text-fuchsia-300">
              🏆 Rang maximum atteint — tu es Irréel !
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">Échelle des rangs</h2>
        <div className="space-y-1.5">
          {ladder.map((r, i) => {
            const reached = player.xpTotal >= r.minXp
            const isCurrent = r.index === progress.rank.index
            return (
              <div
                key={r.index}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                  isCurrent
                    ? 'border-emerald-500/60 bg-emerald-500/10'
                    : reached
                      ? 'border-zinc-800 bg-zinc-900/60'
                      : 'border-zinc-900 bg-zinc-950/60 opacity-60'
                }`}
              >
                <span className="w-5 text-right text-[10px] text-zinc-600">{ladder.length - i}</span>
                <RankBadge from={r.from} to={r.to} label={r.label} size={isCurrent ? 30 : 24} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-bold ${reached ? 'text-zinc-100' : 'text-zinc-400'}`}>
                    {r.name}
                    {r.alias && <span className="ml-1 text-[10px] font-normal text-zinc-500">({r.alias})</span>}
                  </span>
                  <span className="block text-[10px] text-zinc-500">
                    {r.minXp === 0 ? 'Départ' : `${r.minXp.toLocaleString('fr-FR')} XP`}
                  </span>
                </span>
                {isCurrent ? (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    toi
                  </span>
                ) : reached ? (
                  <span className="text-xs text-emerald-400">✓</span>
                ) : (
                  <span className="text-[10px] text-zinc-600">
                    {(r.minXp - player.xpTotal).toLocaleString('fr-FR')} XP
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">Ligue locale</h2>
        <div className="space-y-1.5">
          {entries.map((e, i) => {
            const rank = rankFromXp(e.xp)
            return (
              <div
                key={e.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                  e.me ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900/60'
                }`}
              >
                <span
                  className={`w-6 text-center text-xs font-black ${
                    i === 0 ? 'text-amber-300' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-orange-400' : 'text-zinc-600'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-lg">{e.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`truncate text-sm font-bold ${e.me ? 'text-emerald-300' : 'text-zinc-100'}`}>
                      {e.name}
                    </span>
                    {e.me && (
                      <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        toi
                      </span>
                    )}
                  </span>
                  <span className="block text-[10px] text-zinc-500">{rank.name}</span>
                </span>
                <span className="shrink-0 text-xs font-bold tabular-nums text-zinc-300">
                  {e.xp.toLocaleString('fr-FR')} XP
                </span>
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
          Les rivaux de la ligue locale sont simulés pour l'instant : le classement en ligne entre amis (et les
          duels) arrivera avec la V2.
        </p>
      </section>
    </div>
  )
}
