export function Stars({
  value,
  onChange,
  size = 'md',
  className
}: {
  value: number
  onChange?: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const textSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-sm' : 'text-lg'
  return (
    <div className={`flex items-center gap-0.5 ${className ?? ''}`}>
      {[1, 2, 3, 4, 5].map((i) =>
        onChange ? (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            aria-label={`${i} étoile${i > 1 ? 's' : ''}`}
            className={`${textSize} leading-none ${value >= i - 0.5 ? 'text-amber-400' : 'text-zinc-600'} active:scale-90 transition-transform`}
          >
            ★
          </button>
        ) : (
          <span
            key={i}
            className={`${textSize} leading-none ${value >= i - 0.5 ? 'text-amber-400' : 'text-zinc-600'}`}
          >
            ★
          </span>
        )
      )}
    </div>
  )
}
