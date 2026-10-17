import type { Family } from '../types'

export type MuscleKey =
  | 'pecs'
  | 'dos'
  | 'epaules'
  | 'biceps'
  | 'triceps'
  | 'avantbras'
  | 'abdos'
  | 'obliques'
  | 'fessiers'
  | 'quadris'
  | 'ischios'
  | 'mollets'

export const MUSCLES: { key: MuscleKey; label: string }[] = [
  { key: 'pecs', label: 'Pectoraux' },
  { key: 'dos', label: 'Dos' },
  { key: 'epaules', label: 'Épaules' },
  { key: 'biceps', label: 'Biceps' },
  { key: 'triceps', label: 'Triceps' },
  { key: 'avantbras', label: 'Avant-bras' },
  { key: 'abdos', label: 'Abdos' },
  { key: 'obliques', label: 'Obliques' },
  { key: 'fessiers', label: 'Fessiers' },
  { key: 'quadris', label: 'Quadriceps' },
  { key: 'ischios', label: 'Ischio-jambiers' },
  { key: 'mollets', label: 'Mollets' }
]

/** Muscles sollicités par mouvement : approximation d'entraînement, pas d'anatomie fine. */
export const MUSCLE_MAP: Record<string, MuscleKey[]> = {
  pompes: ['pecs', 'triceps', 'epaules', 'abdos'],
  pompes_larges: ['pecs', 'epaules'],
  pompes_diamant: ['triceps', 'pecs'],
  dips: ['triceps', 'pecs', 'epaules'],
  australiennes: ['dos', 'biceps', 'epaules'],
  tractions_pronation: ['dos', 'biceps', 'avantbras'],
  tractions_supination: ['dos', 'biceps', 'avantbras'],
  pistol_assiste: ['quadris', 'fessiers', 'ischios', 'abdos'],
  pistol: ['quadris', 'fessiers', 'ischios', 'abdos'],
  squat_saute: ['quadris', 'fessiers', 'mollets'],
  gainage: ['abdos', 'obliques', 'epaules']
}

/** Repli pour un mouvement inconnu de la table : on retombe sur sa famille. */
export const FAMILY_MUSCLES: Record<Family, MuscleKey[]> = {
  push: ['pecs', 'triceps', 'epaules'],
  pull: ['dos', 'biceps'],
  legs: ['quadris', 'fessiers'],
  core: ['abdos', 'obliques']
}
