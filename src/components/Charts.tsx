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
      <div className="flex h-28 items-end gap-1">
        {data.map((d, i) => (
          <div key={i} className="flex h-full flex-1 items-end" title={`${d.label} : ${d.value} reps`}>
            <div
              className="w-full rounded-t bg-volt/80"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 3 : 1 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1">
        {data.map((d, i) => (
          <div key={i} className="hud flex-1 text-center text-[9px] text-zinc-500">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Sparkline({ points, className }: { points: number[]; className?: string }) {
  if (points.length < 2) {
    return <div className="text-[10px] text-zinc-600">Pas encore assez de séances</div>
  }
  const max = Math.max(...points, 1)
  const step = 100 / (points.length - 1)
  const path = points.map((p, i) => `${(i * step).toFixed(1)},${(28 - (p / max) * 26).toFixed(1)}`).join(' ')
  const last = points[points.length - 1]
  const lastX = 100
  const lastY = 28 - (last / max) * 26
  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className={`h-8 w-full text-volt ${className ?? ''}`}
      aria-hidden="true"
    >
      <polyline
        points={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill="currentColor" />
    </svg>
  )
}
