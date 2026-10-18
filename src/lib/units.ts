/** Affichage du lest : stockage interne toujours en kg, conversion à l'affichage seulement. */

export const KG_TO_LBS = 2.20462

/** Kg (stockage) → valeur affichée dans l'unité choisie. */
export function toDisplayKg(kg: number, units: 'kg' | 'lbs'): number {
  if (units === 'lbs') return Math.round(kg * KG_TO_LBS)
  return Math.round(kg * 2) / 2
}

/** Valeur saisie (unité affichée) → kg. */
export function fromDisplayKg(value: number, units: 'kg' | 'lbs'): number {
  if (units === 'lbs') return Math.round((value / KG_TO_LBS) * 2) / 2
  return Math.round(value * 2) / 2
}

export function weightLabel(units: 'kg' | 'lbs'): string {
  return units === 'lbs' ? 'lbs' : 'kg'
}

export function formatWeight(kg: number, units: 'kg' | 'lbs'): string {
  return `${toDisplayKg(kg, units)} ${weightLabel(units)}`
}
