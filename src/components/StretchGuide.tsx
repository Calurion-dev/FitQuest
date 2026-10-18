import { useEffect, useMemo, useState } from 'react'
import { mobilityFor } from '../data/mobility'
import type { Family } from '../types'

interface Props {
  families: Family[]
  onClose: () => void
}

/** Guide d'étirements post-séance : une position à la fois, chronométrée. */
export function StretchGuide({ families, onClose }: Props) {
  const items = useMemo(() => mobilityFor(families), [families])
  const [index, setIndex] = useState(0)
  const [left, setLeft] = useState(items[0]?.seconds ?? 30)

  const done = index >= items.length

  useEffect(() => {
    if (done) return
    if (left <= 0) {
      const i = index + 1
      setIndex(i)
      setLeft(items[i]?.seconds ?? 0)
      return
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left, index, done, items])

  const skip = () => {
    const i = index + 1
    setIndex(i)
    setLeft(items[i]?.seconds ?? 0)
  }

  const item = items[Math.min(index, items.length - 1)]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 backdrop-blur">
      <div className="card w-full max-w-sm space-y-5 p-6 text-center">
        <div className="eyebrow">Récupération</div>
        {done ? (
          <>
            <div className="text-4xl">🧘</div>
            <div className="font-display text-xl">Étirements terminés</div>
            <p className="text-xs text-mute">Les muscles te remercient. À demain !</p>
            <button onClick={onClose} className="btn btn-volt w-full py-3.5 text-xs">
              Fermer
            </button>
          </>
        ) : (
          <>
            <div className="text-4xl">{item.icon}</div>
            <div className="font-display text-lg leading-snug">{item.name}</div>
            <div className="hud text-6xl font-bold text-ice">{left}</div>
            <div className="text-[11px] text-mute">
              {index + 1} / {items.length}
            </div>
            <div className="bar">
              <div style={{ width: `${Math.round(((index + 1) / items.length) * 100)}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setLeft((l) => l + 20)} className="btn py-3 text-xs">
                +20 s
              </button>
              <button onClick={skip} className="btn py-3 text-xs">
                Passer ⏭
              </button>
            </div>
            <button onClick={onClose} className="w-full py-1 text-center text-[11px] text-zinc-600 underline">
              Terminer
            </button>
          </>
        )}
      </div>
    </div>
  )
}
