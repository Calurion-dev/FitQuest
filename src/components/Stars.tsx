const SIZES = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-3xl'
} as const

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
  return (
    <span className={`inline-flex gap-0.5 ${className ?? ''}`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const on = value >= i - 0.5
        const cls = `${SIZES[size]} leading-none transition-transform ${on ? 'text-volt' : 'text-zinc-700'}`
        if (!onChange) {
          return (
            <span key={i} className={cls} aria-hidden="true">
              ★
            </span>
          )
        }
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            aria-label={`${i} étoile${i > 1 ? 's' : ''}`}
            className={`${cls} active:scale-90`}
          >
            ★
          </button>
        )
      })}
    </span>
  )
}
