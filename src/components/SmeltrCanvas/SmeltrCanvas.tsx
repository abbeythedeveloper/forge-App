import { useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

const SmeltrCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const EMBER = theme === 'dark' ? 'rgba(216,90,48,' : 'rgba(192,74,34,'

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      // Draw "SMELTR" large text with wave distortion
      const fontSize = Math.min(w * 0.28, 260)
      ctx.font = `900 ${fontSize}px 'Bebas Neue', sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Layer 1 — base ghost
      ctx.fillStyle = EMBER + '0.04)'
      ctx.fillText('SMELTR', w / 2, h / 2)

      // Layer 2 — animated offset glitch top
      const glitchX = Math.sin(t * 0.7) * 6
      const glitchY = Math.cos(t * 0.5) * 4
      ctx.save()
      ctx.globalCompositeOperation = 'source-over'

      // Clip top slice
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, w, h / 2 - 10 + Math.sin(t) * 8)
      ctx.clip()
      ctx.fillStyle = EMBER + '0.06)'
      ctx.fillText('SMELTR', w / 2 + glitchX, h / 2 + glitchY)
      ctx.restore()

      // Clip bottom slice — teal tint
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, h / 2 + 10 + Math.sin(t) * 8, w, h)
      ctx.clip()
      ctx.fillStyle = theme === 'dark'
        ? `rgba(29,158,117,0.05)`
        : `rgba(15,110,86,0.04)`
      ctx.fillText('SMELTR', w / 2 - glitchX * 0.5, h / 2 - glitchY * 0.5)
      ctx.restore()

      ctx.restore()

      // Layer 3 — scanline shimmer sweep
      const shimmerY = ((t * 40) % (h + 100)) - 50
      const shimmer = ctx.createLinearGradient(0, shimmerY, 0, shimmerY + 50)
      shimmer.addColorStop(0, 'transparent')
      shimmer.addColorStop(0.5, EMBER + '0.07)')
      shimmer.addColorStop(1, 'transparent')
      ctx.fillStyle = shimmer
      ctx.fillRect(0, shimmerY, w, 50)

      // Layer 4 — random flicker lines
      if (Math.random() < 0.04) {
        const lineY = Math.random() * h
        const lineH = Math.random() * 4 + 1
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, lineY, w, lineH)
        ctx.clip()
        ctx.fillStyle = EMBER + '0.12)'
        ctx.fillText('SMELTR', w / 2 + (Math.random() - 0.5) * 20, h / 2)
        ctx.restore()
      }

      t += 0.016
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}

export default SmeltrCanvas
