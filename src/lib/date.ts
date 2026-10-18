export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dateFromKey(key: string): Date {
  return new Date(`${key}T12:00:00`)
}

/** Décale une clé de jour de `days` jours (base midi : insensible au changement d'heure). */
export function addDaysToKey(key: string, days: number): string {
  const d = dateFromKey(key)
  d.setDate(d.getDate() + days)
  return dayKey(d)
}

export function weekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export function monthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function previousDayKey(key: string): string {
  const d = dateFromKey(key)
  d.setDate(d.getDate() - 1)
  return dayKey(d)
}

export function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}min${String(s).padStart(2, '0')}`
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}
