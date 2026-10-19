/**
 * Repères indicatifs de niveau par mouvement (sur la meilleure série).
 * Sources : standards calisthenics courants — à prendre comme des ordres de grandeur, pas des vérités.
 */
interface Standard {
  inter: number
  avance: number
  elite: number
}

export const STANDARDS: Record<string, Standard> = {
  pompes: { inter: 10, avance: 25, elite: 45 },
  pompes_larges: { inter: 8, avance: 20, elite: 35 },
  pompes_diamant: { inter: 5, avance: 15, elite: 30 },
  dips: { inter: 5, avance: 12, elite: 25 },
  tractions_pronation: { inter: 5, avance: 12, elite: 20 },
  tractions_supination: { inter: 5, avance: 12, elite: 20 },
  australiennes: { inter: 8, avance: 20, elite: 35 },
  pistol_assiste: { inter: 5, avance: 12, elite: 20 },
  pistol: { inter: 2, avance: 6, elite: 12 },
  squat_saute: { inter: 10, avance: 25, elite: 40 },
  gainage: { inter: 30, avance: 60, elite: 120 }
}

export const STANDARD_LEVELS = ['Débutant', 'Inter', 'Avancé', 'Élite']

const STANDARD_COLORS = ['#9a9aa3', '#7fd1ff', '#f2e600', '#ff4b2b']

export interface StandardLevel {
  index: number
  name: string
  color: string
  nextName?: string
  remaining?: number
}

/** Niveau d'une meilleure série face aux repères. Null si le mouvement n'a pas de repères ou rien n'est fait. */
export function standardLevel(movementId: string, best: number): StandardLevel | null {
  const s = STANDARDS[movementId]
  if (!s || best <= 0) return null
  const thresholds = [0, s.inter, s.avance, s.elite]
  let index = 0
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (best >= thresholds[i]) {
      index = i
      break
    }
  }
  return {
    index,
    name: STANDARD_LEVELS[index],
    color: STANDARD_COLORS[index],
    nextName: index < 3 ? STANDARD_LEVELS[index + 1] : undefined,
    remaining: index < 3 ? thresholds[index + 1] - best : undefined
  }
}
