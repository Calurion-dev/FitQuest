export function BarChart({
  data,
  className
}: {
  data: { label: string; value: number }[]
  className?: string
}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className={className}>
      <div className="flex h-24 items-end gap-1">
        {data.map((d, i) => (
          <div key={i} className="flex h-full flex-1 items-end" title={`${d.label} : ${d.value} reps`}>
            <div
              className="w-full rounded-t bg-emerald-500/80"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 3 : 1 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[9px] text-zinc-500">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Sparkline({ points, className }: { points: number[]; className?: string }) {
  if (points.length < 2)
    return <div className={`text-[10px] text-zinc-600 ${className ?? ''}`}>Pas encore assez de séances</div>
  const w = 100
  const h = 28
  const max = Math.max(...points)
  const min = Math.min(...points)
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w
    const y = h - 3 - ((p - min) / Math.max(1, max - min)) * (h - 8)
    return { x, y }
  })
  const last = coords[coords.length - 1]
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`h-8 w-full text-emerald-400 ${className ?? ''}`}
      preserveAspectRatio="none"
    >
      <polyline
        points={coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last.x} cy={last.y} r="2.5" fill="currentColor" />
    </svg>
  )
}
