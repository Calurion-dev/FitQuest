// Échelle des rangs, calquée sur le mode Classé de Fortnite (saison 2026) :
// Bronze → Argent → Or → Platine → Diamant → Élite → Champion, chacun en I/II/III,
// puis le rang final (Unreal en anglais, « Irréel » en français).

const TIER_GRADIENTS: Record<string, [string, string]> = {
  Bronze: ['#8d5524', '#d08c4a'],
  Argent: ['#8a95a0', '#d6dee6'],
  Or: ['#bb8a12', '#ffd75e'],
  Platine: ['#0f9d95', '#5ff0e6'],
  Diamant: ['#2b6fe0', '#8fd4ff'],
  Élite: ['#7b3ff2', '#d6b3ff'],
  Champion: ['#c81e3a', '#ff8fa3'],
  Irréel: ['#ff8a00', '#ff2d95']
}

interface RankDef {
  tier: keyof typeof TIER_GRADIENTS | string
  division?: 'I' | 'II' | 'III'
  minXp: number
  /** Nom du rang dans le client anglais, pour ceux qui jouent en VO. */
  alias?: string
}

// Les seuils montent progressivement : 500 XP ≈ 1 à 2 séances.
const LADDER: RankDef[] = [
  { tier: 'Bronze', division: 'I', minXp: 0 },
  { tier: 'Bronze', division: 'II', minXp: 400 },
  { tier: 'Bronze', division: 'III', minXp: 1200 },
  { tier: 'Argent', division: 'I', minXp: 2500 },
  { tier: 'Argent', division: 'II', minXp: 4500 },
  { tier: 'Argent', division: 'III', minXp: 7000 },
  { tier: 'Or', division: 'I', minXp: 10000 },
  { tier: 'Or', division: 'II', minXp: 14000 },
  { tier: 'Or', division: 'III', minXp: 19000 },
  { tier: 'Platine', division: 'I', minXp: 25000 },
  { tier: 'Platine', division: 'II', minXp: 33000 },
  { tier: 'Platine', division: 'III', minXp: 43000 },
  { tier: 'Diamant', division: 'I', minXp: 55000 },
  { tier: 'Diamant', division: 'II', minXp: 70000 },
  { tier: 'Diamant', division: 'III', minXp: 88000 },
  { tier: 'Élite', division: 'I', minXp: 110000 },
  { tier: 'Élite', division: 'II', minXp: 135000 },
  { tier: 'Élite', division: 'III', minXp: 165000 },
  { tier: 'Champion', division: 'I', minXp: 200000 },
  { tier: 'Champion', division: 'II', minXp: 240000 },
  { tier: 'Champion', division: 'III', minXp: 290000 },
  { tier: 'Irréel', minXp: 350000, alias: 'Unreal' }
]

export interface Rank {
  /** Position sur l'échelle, 0 = Bronze I. */
  index: number
  tier: string
  division?: 'I' | 'II' | 'III'
  /** Nom complet : « Bronze II », « Irréel ». */
  name: string
  /** Texte affiché dans l'écusson : la division, ou une étoile pour le rang final. */
  label: string
  from: string
  to: string
  minXp: number
  nextXp: number | null
  alias?: string
}

export const RANKS: Rank[] = LADDER.map((def, i) => {
  const [from, to] = TIER_GRADIENTS[def.tier] ?? ['#52525b', '#a1a1aa']
  return {
    index: i,
    tier: def.tier,
    division: def.division,
    // Le rang final s'écrit « Irréel » (alias Unreal) côté client Fortnite.
    name: def.division ? `${def.tier} ${def.division}` : def.tier,
    label: def.division ?? '★',
    from,
    to,
    minXp: def.minXp,
    nextXp: LADDER[i + 1]?.minXp ?? null,
    alias: def.alias
  }
})

export function rankFromXp(xp: number): Rank {
  let current = RANKS[0]
  for (const rank of RANKS) if (xp >= rank.minXp) current = rank
  return current
}

export interface RankProgress {
  rank: Rank
  next: Rank | null
  /** XP accumulé depuis le début du rang actuel. */
  into: number
  /** XP total nécessaire pour passer au rang suivant. */
  need: number
  pct: number
  /** XP restant avant la promotion (0 si rang max). */
  remaining: number
}

export function rankProgress(xp: number): RankProgress {
  const rank = rankFromXp(xp)
  const next = RANKS[rank.index + 1] ?? null
  const into = xp - rank.minXp
  const need = next ? next.minXp - rank.minXp : 0
  return {
    rank,
    next,
    into,
    need,
    pct: next ? Math.min(100, Math.round((into / need) * 100)) : 100,
    remaining: next ? next.minXp - xp : 0
  }
}
