// Rivaux de la ligue locale.
//
// L'app n'a pas encore de backend (V2 prévue avec Supabase) : ces adversaires
// sont donc des valeurs fixes, réparties le long de l'échelle des rangs, pour
// donner un classement crédible et des paliers à dépasser en gagnant de l'XP.

export interface Rival {
  id: string
  name: string
  xp: number
  emoji: string
}

export const RIVALS: Rival[] = [
  { id: 'r01', name: 'LouAmrap', xp: 150, emoji: '🐣' },
  { id: 'r02', name: 'KarimBarfix', xp: 900, emoji: '🧢' },
  { id: 'r03', name: 'SofiaPompes', xp: 2100, emoji: '🎧' },
  { id: 'r04', name: 'ThéoDips', xp: 4000, emoji: '🔥' },
  { id: 'r05', name: 'NadiaCore', xp: 6500, emoji: '🧘' },
  { id: 'r06', name: 'MaxTractions', xp: 9500, emoji: '🧲' },
  { id: 'r07', name: 'LinaGrip', xp: 13500, emoji: '💅' },
  { id: 'r08', name: 'YanisPull', xp: 18000, emoji: '🦾' },
  { id: 'r09', name: 'ChloéLever', xp: 24000, emoji: '⚡' },
  { id: 'r10', name: 'IbraCali', xp: 31500, emoji: '🥇' },
  { id: 'r11', name: 'EmmaBarfix', xp: 42000, emoji: '🎯' },
  { id: 'r12', name: 'BilalWeighted', xp: 54000, emoji: '🏋️' },
  { id: 'r13', name: 'TomPistol', xp: 68000, emoji: '🦿' },
  { id: 'r14', name: 'SarahMuscleUp', xp: 85000, emoji: '🚀' },
  { id: 'r15', name: 'JujuFrontLever', xp: 105000, emoji: '🧬' },
  { id: 'r16', name: 'InèsCali', xp: 132000, emoji: '🥷' },
  { id: 'r17', name: 'LéoGainage', xp: 160000, emoji: '🗿' },
  { id: 'r18', name: 'KevLégende', xp: 250000, emoji: '👑' }
]
