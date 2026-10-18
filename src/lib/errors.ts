const KEY = 'fq-errors'
const MAX = 5

/** Journal local des dernières erreurs (ring buffer), pour le bouton « Signaler un bug ». */
export function logError(message: string): void {
  try {
    const list = readErrors()
    list.unshift(`${new Date().toISOString()} ${message}`)
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    // stockage indisponible : on ignore
  }
}

export function readErrors(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}
