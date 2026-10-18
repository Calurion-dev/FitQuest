import type { Family } from '../types'

export interface WarmupItem {
  icon: string
  text: string
}

const BASE: WarmupItem[] = [
  { icon: '🏃', text: '2 min de montées de genoux + rotations de bras' },
  { icon: '🤸', text: "10 cercles d'épaules et de hanches" }
]

const BY_FAMILY: Record<Family, WarmupItem[]> = {
  push: [
    { icon: '🧱', text: '10 scapulas au mur (ou au sol)' },
    { icon: '💪', text: '1 série légère à 50 % du premier exo push' }
  ],
  pull: [
    { icon: '🪢', text: '30 s de suspension + 10 tractions scapulaires' },
    { icon: '💪', text: '1 série légère à 50 % du premier exo pull' }
  ],
  legs: [
    { icon: '🦵', text: '15 squats à vide, descente lente' },
    { icon: '🚶', text: '10 fentes alternées' }
  ],
  core: [
    { icon: '🧘', text: '1 planche courte (20 s)' },
    { icon: '🌀', text: '10 rotations de bassin' }
  ]
}

/** Échauffement conseillé selon les familles présentes dans la séance. */
export function warmupFor(families: Family[]): WarmupItem[] {
  const seen = new Set(BASE.map((i) => i.text))
  const items = [...BASE]
  for (const f of families) {
    for (const item of BY_FAMILY[f]) {
      if (!seen.has(item.text)) {
        seen.add(item.text)
        items.push(item)
      }
    }
  }
  return items
}
