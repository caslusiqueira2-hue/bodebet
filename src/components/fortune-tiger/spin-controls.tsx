
import { Gauge, Minus, Plus, RotateCcw, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatBRL } from '@/lib/casino-data'
import { betOptions } from '@/lib/fortune-tiger-engine'

type SpinControlsProps = {
  bet: number
  balance: number
  isSpinning: boolean
  autoSpins: number
  turbo: boolean
  onChangeBet: (value: number) => void
  onSpin: () => void
  onStartAuto: (count: number) => void
  onStopAuto: () => void
  onToggleTurbo: (value: boolean) => void
  onReset: () => void
}

export function SpinControls({
  bet,
  balance,
  isSpinning,
  autoSpins,
  turbo,
  onChangeBet,
  onSpin,
  onStartAuto,
  onStopAuto,
  onToggleTurbo,
  onReset,
}: SpinControlsProps) {
  const betIndex = betOptions.indexOf(bet)
  const insufficient = bet > balance

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Aposta por giro
          </span>
          <span className="font-display text-xl font-bold tabular-nums">{formatBRL(bet)}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="secondary"
            aria-label="Diminuir aposta"
            disabled={isSpinning || betIndex <= 0}
            onClick={() => onChangeBet(betOptions[Math.max(0, betIndex - 1)])}
          >
            <Minus className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            aria-label="Aumentar aposta"
            disabled={isSpinning || betIndex >= betOptions.length - 1}
            onClick={() => onChangeBet(betOptions[Math.min(betOptions.length - 1, betIndex + 1)])}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {betOptions.map((option) => (
          <button
            key={option}
            type="button"
            disabled={isSpinning}
            onClick={() => onChangeBet(option)}
            className={cn(
              'rounded-md border px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors disabled:opacity-50',
              option === bet
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border/60 bg-secondary text-muted-foreground hover:text-foreground',
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <Button
        size="lg"
        onClick={onSpin}
        disabled={isSpinning || insufficient || autoSpins > 0}
        className="h-14 bg-accent font-display text-base font-bold text-accent-foreground hover:bg-accent/90"
      >
        {isSpinning ? 'Girando...' : insufficient ? 'Saldo insuficiente' : 'Girar'}
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        {autoSpins > 0 ? (
          <Button variant="destructive" size="sm" onClick={onStopAuto} className="flex-1">
            <Square className="size-3.5" />
            Parar auto ({autoSpins})
          </Button>
        ) : (
          [10, 25, 50].map((count) => (
            <Button
              key={count}
              variant="secondary"
              size="sm"
              disabled={isSpinning || insufficient}
              onClick={() => onStartAuto(count)}
              className="flex-1"
            >
              Auto {count}
            </Button>
          ))
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
        <button
          type="button"
          onClick={() => onToggleTurbo(!turbo)}
          aria-pressed={turbo}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold transition-colors',
            turbo ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
          )}
        >
          <Gauge className="size-3.5" />
          Turbo
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={isSpinning}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <RotateCcw className="size-3.5" />
          Recarregar saldo
        </button>
      </div>
    </div>
  )
}
