import type { Movement, SpotType, StatKey } from '../types'

export const MOVEMENTS: Movement[] = [
  { id: 'pompes', name: 'Pompes', family: 'push', coeff: 10, emoji: '💪', description: 'Mains largeur épaules, corps gainé, poitrine au sol.' },
  { id: 'pompes_larges', name: 'Pompes larges', family: 'push', coeff: 10, emoji: '👐', description: 'Mains plus larges que les épaules, cible les pectoraux.' },
  { id: 'pompes_diamant', name: 'Pompes diamant', family: 'push', coeff: 12, emoji: '💎', description: 'Mains en diamant sous la poitrine, cible les triceps.' },
  { id: 'dips', name: 'Dips', family: 'push', coeff: 20, emoji: '🧗', description: 'Barres parallèles, descente contrôlée, épaules basses.' },
  { id: 'australiennes', name: 'Tractions australiennes', family: 'pull', coeff: 10, emoji: '🛶', description: 'Barre basse, corps gainé, tire la poitrine vers la barre. Progression idéale avant les tractions.' },
  { id: 'tractions_pronation', name: 'Tractions pronation', family: 'pull', coeff: 25, emoji: '🏋️', description: 'Paumes vers l\'avant, tire le menton au-dessus de la barre.' },
  { id: 'tractions_supination', name: 'Tractions supination', family: 'pull', coeff: 25, emoji: '🪢', description: 'Paumes vers toi, plus de biceps engagé.' },
  { id: 'pistol_assiste', name: 'Pistol squat assisté', family: 'legs', coeff: 15, emoji: '🦵', description: 'Une jambe, tiens-toi à un support, descente contrôlée.' },
  { id: 'pistol', name: 'Pistol squat', family: 'legs', coeff: 30, emoji: '🦿', description: 'Squat sur une jambe, sans appui, talon au sol.' },
  { id: 'squat_saute', name: 'Squats sautés', family: 'legs', coeff: 12, emoji: '🦘', description: 'Squat explosif, saut vertical, réception souple.' },
  { id: 'gainage', name: 'Gainage planche', family: 'core', coeff: 1, emoji: '🧘', isHold: true, description: 'Planche sur avant-bras, corps aligné, ne pas creuser le dos. Se compte en secondes.' }
]

export function movementById(id: string): Movement | undefined {
  return MOVEMENTS.find((m) => m.id === id)
}

export const STAT_META: Record<StatKey, { label: string; icon: string }> = {
  push: { label: 'Push', icon: '💪' },
  pull: { label: 'Pull', icon: '🧗' },
  legs: { label: 'Jambes', icon: '🦵' },
  endurance: { label: 'Endurance', icon: '💨' }
}

export const FAMILY_LABELS: Record<Movement['family'], string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Jambes',
  core: 'Gainage'
}

export const SPOT_TYPE_META: Record<SpotType, { label: string; icon: string }> = {
  salle: { label: 'Salle de sport', icon: '🏋️' },
  parc: { label: 'Parc street workout', icon: '🌳' }
}

export const EQUIPMENTS = [
  'Barre de traction',
  'Barres parallèles (dips)',
  'Barres de muscle-up',
  'Échelle',
  'Banc',
  'Sol amorti',
  "Point d'eau",
  'Éclairage'
]
