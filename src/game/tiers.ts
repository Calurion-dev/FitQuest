/** Palier de force par mouvement (esprit « ranked exercises » de Liftoff). */
export interface Tier {
  name: string
  min: number
  color: string
}

export const TIERS: Tier[] = [
  { name: 'Débutant', min: 1, color: '#9a9aa3' },
  { name: 'Régulier', min: 3, color: '#7fd1ff' },
  { name: 'Solide', min: 5, color: '#f2e600' },
  { name: 'Affûté', min: 7, color: '#ff9f1c' },
  { name: 'Bête', min: 9, color: '#ff4b2b' },
  { name: 'Légende', min: 12, color: '#c084fc' }
]

export function tierFromLevel(level: number): Tier {
  let tier = TIERS[0]
  for (const t of TIERS) if (level >= t.min) tier = t
  return tier
}
