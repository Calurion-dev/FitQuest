import { useMemo } from 'react'

interface Props {
  /** Couleur de départ du dégradé du rang. */
  from: string
  /** Couleur de fin du dégradé du rang. */
  to: string
  /** Division (I, II, III) ou ★ pour le rang final. */
  label: string
  size?: number
  className?: string
}

/** Écusson de rang, inspiré des badges du mode Classé de Fortnite. */
export function RankBadge({ from, to, label, size = 56, className }: Props) {
  const gid = useMemo(() => `rank-${Math.random().toString(36).slice(2)}`, [])
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`Division ${label}`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <path
        d="M50 3 L93 20 V52 C93 76 74 92 50 98 C26 92 7 76 7 52 V20 Z"
        fill={`url(#${gid})`}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="3"
      />
      <path
        d="M50 12 L85 26 V52 C85 71 69 84 50 89 C31 84 15 71 15 52 V26 Z"
        fill="rgba(0,0,0,0.18)"
      />
      <text
        x="50"
        y="63"
        textAnchor="middle"
        fontSize={label.length > 1 ? 30 : 40}
        fontWeight="800"
        fill="#0b0b0f"
      >
        {label}
      </text>
    </svg>
  )
}
