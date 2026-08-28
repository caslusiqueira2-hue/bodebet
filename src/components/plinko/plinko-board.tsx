import { slotTone } from '@/lib/plinko-engine'
import { cn } from '@/lib/utils'
import type { Ball } from './use-plinko'

type PlinkoBoardProps = {
  rows: number
  multipliers: number[]
  balls: Ball[]
  lastSlot: number | null
}

export function PlinkoBoard({ rows, multipliers, balls, lastSlot }: PlinkoBoardProps) {
  const spacing = 100 / (rows + 1)

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border border-border/60 bg-[#100a16] shadow-[inset_0_2px_28px_rgba(0,0,0,0.6)]">
        {/* Pinos */}
        {Array.from({ length: rows }, (_, row) => {
          const level = row + 1
          return Array.from({ length: level + 1 }, (_, peg) => (
            <span
              key={`${row}-${peg}`}
              aria-hidden
              className="absolute size-[1.6%] min-size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/35"
              style={{
                left: `${50 + (peg - level / 2) * spacing}%`,
                top: `${8 + (level / (rows + 1)) * 84}%`,
              }}
            />
          ))
        })}

        {/* Bolas */}
        {balls.map((ball) => {
          const level = Math.min(ball.level, rows)
          const sum = ball.path.slice(0, level).reduce((total, step) => total + step, 0)
          return (
            <span
              key={ball.id}
              aria-hidden
              className="absolute size-[3%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)] transition-all duration-100 ease-linear"
              style={{
                left: `${50 + (sum - level / 2) * spacing}%`,
                top: `${8 + (level / (rows + 1)) * 84}%`,
              }}
            />
          )
        })}
      </div>

      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${multipliers.length}, minmax(0, 1fr))` }}
      >
        {multipliers.map((multiplier, index) => (
          <span
            key={index}
            className={cn(
              'rounded-[4px] py-1 text-center text-[clamp(0.5rem,1.5vw,0.7rem)] font-bold tabular-nums transition-transform',
              slotTone(index, multipliers.length),
              lastSlot === index && 'payout-pop scale-110 ring-2 ring-accent',
            )}
          >
            {multiplier}x
          </span>
        ))}
      </div>
    </div>
  )
}
