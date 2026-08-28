
import { useEffect, useRef, useState } from 'react'
import { Plane } from 'lucide-react'
import { curveProgress, formatMultiplier } from '@/lib/aviator-engine'
import { cn } from '@/lib/utils'
import type { Phase } from './use-aviator'

const PAD = { left: 40, right: 60, top: 48, bottom: 36 }

type Point = { x: number; y: number }

function pointAt(seconds: number, width: number, height: number): Point {
  const { x, y } = curveProgress(seconds)
  return {
    x: PAD.left + x * Math.max(0, width - PAD.left - PAD.right),
    y: height - PAD.bottom - y * Math.max(0, height - PAD.top - PAD.bottom),
  }
}

export function AviatorStage({
  phase,
  multiplier,
  elapsed,
  countdown,
}: {
  phase: Phase
  multiplier: number
  elapsed: number
  countdown: number
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const node = wrapperRef.current
    if (!node) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const { width, height } = size
    if (!canvas || width === 0 || height === 0) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    // Grade de fundo discreta.
    ctx.strokeStyle = 'rgba(139, 160, 198, 0.12)'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 6])
    for (let i = 1; i <= 4; i += 1) {
      const y = PAD.top + ((height - PAD.top - PAD.bottom) / 4) * i
      ctx.beginPath()
      ctx.moveTo(PAD.left, y)
      ctx.lineTo(width - 12, y)
      ctx.stroke()
    }
    for (let i = 1; i <= 5; i += 1) {
      const x = PAD.left + ((width - PAD.left - PAD.right) / 5) * i
      ctx.beginPath()
      ctx.moveTo(x, PAD.top)
      ctx.lineTo(x, height - PAD.bottom)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Eixo base.
    ctx.strokeStyle = 'rgba(139, 160, 198, 0.35)'
    ctx.beginPath()
    ctx.moveTo(PAD.left, height - PAD.bottom)
    ctx.lineTo(width - 12, height - PAD.bottom)
    ctx.stroke()

    const crashed = phase === 'crashed'
    const stroke = crashed ? '#e0453e' : '#ffb020'
    const samples = 64
    const path: Point[] = []
    for (let i = 0; i <= samples; i += 1) {
      path.push(pointAt((elapsed * i) / samples, width, height))
    }
    const tip = path[path.length - 1]

    // Área sob a curva.
    const gradient = ctx.createLinearGradient(0, PAD.top, 0, height - PAD.bottom)
    gradient.addColorStop(0, crashed ? 'rgba(224, 69, 62, 0.30)' : 'rgba(255, 176, 32, 0.28)')
    gradient.addColorStop(1, 'rgba(24, 99, 209, 0.02)')

    ctx.beginPath()
    ctx.moveTo(PAD.left, height - PAD.bottom)
    path.forEach((point) => ctx.lineTo(point.x, point.y))
    ctx.lineTo(tip.x, height - PAD.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Traçado do voo.
    ctx.beginPath()
    path.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    })
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = stroke
    ctx.shadowColor = stroke
    ctx.shadowBlur = 16
    ctx.stroke()
    ctx.shadowBlur = 0
  }, [size, elapsed, phase])

  const { width, height } = size
  const tip = pointAt(elapsed, width, height)
  const previous = pointAt(Math.max(0, elapsed - 0.4), width, height)
  const angle = (Math.atan2(tip.y - previous.y, tip.x - previous.x) * 180) / Math.PI

  return (
    <div
      ref={wrapperRef}
      className="relative h-[300px] w-full overflow-hidden rounded-xl border border-border/60 bg-[#070c18] sm:h-[380px]"
      role="img"
      aria-label={
        phase === 'flying'
          ? `Avião voando em ${formatMultiplier(multiplier)}`
          : phase === 'crashed'
            ? `Rodada encerrada em ${formatMultiplier(multiplier)}`
            : 'Aguardando início da próxima rodada'
      }
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />

      {phase !== 'betting' && width > 0 ? (
        <span
          className={cn(
            'absolute transition-opacity duration-300',
            phase === 'crashed' ? 'opacity-0' : 'opacity-100',
          )}
          style={{ left: tip.x, top: tip.y, transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
          aria-hidden="true"
        >
          <Plane className="size-9 rotate-45 fill-accent text-accent drop-shadow-[0_0_12px_rgba(255,176,32,0.6)]" />
        </span>
      ) : null}

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
        {phase === 'betting' ? (
          <>
            <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
              Próxima rodada
            </p>
            <p className="font-display text-5xl font-bold tabular-nums sm:text-6xl">
              {countdown.toFixed(1)}s
            </p>
            <p className="text-sm text-muted-foreground">Faça sua aposta agora</p>
          </>
        ) : (
          <>
            {phase === 'crashed' ? (
              <p className="font-display text-sm font-bold tracking-[0.3em] text-destructive uppercase">
                Voou embora
              </p>
            ) : null}
            <p
              className={cn(
                'font-display text-6xl font-bold tabular-nums drop-shadow-lg sm:text-7xl',
                phase === 'crashed' ? 'text-destructive' : 'text-foreground',
              )}
            >
              {formatMultiplier(multiplier)}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
