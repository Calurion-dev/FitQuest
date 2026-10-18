/** Petits sons générés en WebAudio — aucun fichier audio. */

export type SoundLevel = 'off' | 'low' | 'normal'

let ctx: AudioContext | null = null

function context(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, duration: number, gain: number): void {
  const c = context()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'square'
  osc.frequency.value = freq
  const t0 = c.currentTime + start
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

function volume(level: SoundLevel): number {
  return level === 'off' ? 0 : level === 'low' ? 0.04 : 0.09
}

export function playTick(level: SoundLevel): void {
  const v = volume(level)
  if (v) tone(880, 0, 0.06, v)
}

export function playRestEnd(level: SoundLevel): void {
  const v = volume(level)
  if (!v) return
  tone(660, 0, 0.12, v)
  tone(660, 0.18, 0.12, v)
  tone(990, 0.36, 0.2, v)
}

export function playRecord(level: SoundLevel): void {
  const v = volume(level)
  if (!v) return
  tone(660, 0, 0.09, v)
  tone(880, 0.1, 0.09, v)
  tone(1320, 0.2, 0.18, v)
}

export function playLevelUp(level: SoundLevel): void {
  const v = volume(level)
  if (!v) return
  tone(523, 0, 0.1, v)
  tone(659, 0.11, 0.1, v)
  tone(784, 0.22, 0.1, v)
  tone(1047, 0.33, 0.25, v)
}
