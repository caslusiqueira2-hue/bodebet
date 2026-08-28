import { motion } from 'framer-motion'
import { getZone, penaltyZones, type PenaltyResult, type PenaltyZoneId } from '@/lib/penalty-engine'
import { cn } from '@/lib/utils'
import { BallSvg } from './ball-svg'
import { KeeperSvg } from './keeper-svg'

type Phase = 'aim' | 'shooting' | 'result'

type Props = {
  selected: PenaltyZoneId | null
  phase: Phase
  result: PenaltyResult | null
  onSelect: (zone: PenaltyZoneId) => void
}

const BALL_HOME = { left: 50, top: 92 }

/** Gol estilizado com as cinco zonas de chute, a bola e o goleiro. */
export function PenaltyPitch({ selected, phase, result, onSelect }: Props) {
  const target = result ? getZone(result.zone.id) : selected ? getZone(selected) : null
  const keeper = result ? getZone(result.keeperZone) : null
  const animating = phase !== 'aim' && result !== null

  const endX = animating
    ? result!.outcome === 'miss'
      ? target!.x + (target!.x > 50 ? 16 : -16)
      : target!.x
    : BALL_HOME.left
  const endY = animating
    ? result!.outcome === 'miss'
      ? Math.max(2, target!.y - 16)
      : target!.y
    : BALL_HOME.top

  // trajetória em arco: sobe acima do ponto final no meio do caminho
  const midY = Math.max(2, Math.min(endY, BALL_HOME.top) - 12)

  const ballTarget = animating
    ? {
        left: [`${BALL_HOME.left}%`, `${(BALL_HOME.left + endX) / 2}%`, `${endX}%`],
        top: [`${BALL_HOME.top}%`, `${midY}%`, `${endY}%`],
        scale: [1, 0.75, 0.5],
        rotate: [0, 360, 760],
      }
    : { left: '50%', top: '92%', scale: 1, rotate: 0 }


  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-[linear-gradient(180deg,#1b0f2e_0%,#14251a_55%,#0f3b1c_100%)] p-4">
      {/* refletores */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--accent)_35%,transparent),transparent)]" />

      <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl">
        {/* traves */}
        <div className="absolute inset-x-[4%] top-[6%] bottom-[22%] rounded-t-md border-[6px] border-b-0 border-white/85 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0_1px,transparent_1px_14px),repeating-linear-gradient(0deg,rgba(255,255,255,0.12)_0_1px,transparent_1px_14px)]" />

        {/* zonas de chute */}
        {penaltyZones.map((zone) => {
          const isSelected = zone.id === selected
          const isHit = result?.zone.id === zone.id && phase === 'result'
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelect(zone.id)}
              aria-label={`Chutar no ${zone.label} — paga ${zone.multiplier.toFixed(2)}x`}
              aria-pressed={isSelected}
              className={cn(
                'absolute flex size-[17%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 text-[10px] font-bold tabular-nums backdrop-blur-[1px] transition-colors',
                isSelected
                  ? 'border-accent bg-accent/30 text-foreground'
                  : 'border-white/40 bg-white/10 text-white/80 hover:border-accent/70 hover:bg-accent/20',
                isHit && result?.outcome === 'goal' && 'border-primary bg-primary/40',
                isHit && result?.outcome !== 'goal' && 'border-destructive bg-destructive/35',
              )}
              style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            >
              {zone.multiplier.toFixed(2)}x
            </button>
          )
        })}

        {/* goleiro */}
        <motion.div
          className="pointer-events-none absolute z-10 w-[26%] -translate-x-1/2 -translate-y-1/2"
          animate={
            keeper && phase !== 'aim'
              ? {
                  left: ['50%', '50%', `${keeper.x}%`],
                  top: ['52%', '56%', `${keeper.y}%`],
                  rotate: [0, 0, keeper.x < 50 ? -72 : keeper.x > 50 ? 72 : 0],
                  scaleY: [1, 0.88, 1],
                }
              : { left: '50%', top: '52%', rotate: 0, scaleY: 1 }
          }
          transition={{ duration: 0.65, times: [0, 0.35, 1], ease: 'easeOut' }}
          aria-hidden
        >
          <KeeperSvg className="h-auto w-full drop-shadow-[0_8px_10px_rgba(0,0,0,0.45)]" />
        </motion.div>

        {/* sombra da bola */}
        <motion.div
          className="pointer-events-none absolute z-[15] h-[3%] w-[9%] -translate-x-1/2 rounded-[50%] bg-black/40 blur-[2px]"
          animate={
            animating
              ? {
                  left: [`${BALL_HOME.left}%`, `${(BALL_HOME.left + endX) / 2}%`, `${endX}%`],
                  top: ['96%', '90%', '86%'],
                  opacity: [0.5, 0.28, 0.12],
                  scale: [1, 0.8, 0.55],
                }
              : { left: '50%', top: '96%', opacity: 0.5, scale: 1 }
          }
          transition={{ duration: animating ? 0.7 : 0.3, ease: 'easeOut' }}
          aria-hidden
        />

        {/* bola */}
        <motion.div
          className="pointer-events-none absolute z-20 size-[9%] -translate-x-1/2 -translate-y-1/2"
          animate={ballTarget}
          transition={{ duration: animating ? 0.7 : 0.3, ease: 'easeOut', times: [0, 0.5, 1] }}
          aria-hidden
        >
          <BallSvg className="size-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" />
        </motion.div>


        {/* gramado */}
        <div className="absolute inset-x-0 bottom-0 h-[20%] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.05)_0_28px,transparent_28px_56px)]" />
      </div>

      <p className="relative mt-2 text-center text-xs text-muted-foreground">
        {phase === 'result' && result
          ? `${result.zone.label} · ${result.outcome === 'goal' ? 'gol confirmado' : 'sem gol'}`
          : 'Toque no canto do gol onde quer bater e confirme o chute.'}
      </p>
    </div>
  )
}
