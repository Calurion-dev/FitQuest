/** Explosion de confettis en canvas, sans dépendance (~1,6 s). */

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rot: number
  vr: number
}

const COLORS = ['#f2e600', '#ff4b2b', '#7fd1ff', '#ffffff']

export function burstConfetti(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return
  }

  const particles: Particle[] = []
  for (let i = 0; i < 90; i++) {
    const angle = -Math.PI / 2 - 0.9 + Math.random() * 1.8
    const speed = 4 + Math.random() * 7
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.5,
      y: canvas.height * 0.45,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 6,
      color: COLORS[i % COLORS.length],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3
    })
  }

  const start = performance.now()
  const tick = (now: number) => {
    const t = (now - start) / 1600
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.22
      p.rot += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = Math.max(0, 1 - t)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7)
      ctx.restore()
    }
    if (t < 1) {
      requestAnimationFrame(tick)
    } else {
      canvas.remove()
    }
  }
  requestAnimationFrame(tick)
}
