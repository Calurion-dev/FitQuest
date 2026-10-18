import type { Family } from '../types'

export interface StretchItem {
  icon: string
  name: string
  seconds: number
}

const BASE: StretchItem[] = [{ icon: '🫁', name: 'Respiration profonde, dos droit', seconds: 30 }]

const BY_FAMILY: Record<Family, StretchItem[]> = {
  push: [
    { icon: '🏛️', name: 'Pecs : avant-bras au mur, buste qui tourne', seconds: 40 },
    { icon: '🧠', name: 'Triceps : coude plié derrière la tête', seconds: 40 },
    { icon: '🤝', name: 'Épaules : bras croisé devant la poitrine', seconds: 30 }
  ],
  pull: [
    { icon: '🪝', name: 'Dorsaux : accroché à la barre, relâche le dos', seconds: 40 },
    { icon: '💪', name: 'Biceps : main au mur, épaule qui s’ouvre', seconds: 40 },
    { icon: '🖐️', name: 'Avant-bras : paume au sol, doigts vers le genou', seconds: 30 }
  ],
  legs: [
    { icon: '🦵', name: 'Quadris : talon aux fesses, genoux serrés', seconds: 40 },
    { icon: '🦿', name: 'Fléchisseurs : fente basse, hanche qui pousse', seconds: 40 },
    { icon: '🦶', name: 'Mollets : talon au sol, jambe tendue derrière', seconds: 30 }
  ],
  core: [
    { icon: '🐈', name: 'Chat-vache, à quatre pattes', seconds: 40 },
    { icon: '🐍', name: 'Cobra : buste redressé, bassin au sol', seconds: 30 },
    { icon: '🧎', name: 'Position de l’enfant, bras tendus', seconds: 40 }
  ]
}

/** Routine d'étirements adaptée aux familles travaillées (~5 min). */
export function mobilityFor(families: Family[]): StretchItem[] {
  const seen = new Set<string>()
  const out: StretchItem[] = []
  for (const item of [...BASE, ...families.flatMap((f) => BY_FAMILY[f] ?? [])]) {
    if (seen.has(item.name)) continue
    seen.add(item.name)
    out.push(item)
  }
  return out
}
