
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBRL } from '@/lib/casino-data'
import { betOptions, formatMultiplier, mineOptions } from '@/lib/mines-engine'
import { cn } from '@/lib/utils'

type MinesControlsProps = {
  bet: number
  mines: number
  balance: number
  isPlaying: boolean
  isRoundOver: boolean
  picks: number
  currentMultiplier: number
  nextMultiplier: number
  cashoutValue: number
  nextSafeChance: number
  onChangeBet: (value: number) => void
  onChangeMines: (value: number) => void
  onStart: () => void
  onCashout: () => void
  onNewRound: () => void
  onReset: () => void
}

export function MinesControls({
  bet,
  mines,
  balance,
  isPlaying,
  isRoundOver,
  picks,
  currentMultiplier,
  nextMultiplier,
  cashoutValue,
  nextSafeChance,
  onChangeBet,
  onChangeMines,
  onStart,
  onCashout,
  onNewRound,
  onReset,
}: MinesControlsProps) {
  const betIndex = betOptions.indexOf(bet as (typeof betOptions)[number])
  const insufficient = bet > balance
  const locked = isPlaying

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Valor da aposta
          </span>
          <span className="font-display text-xl font-bold tabular-nums">{formatBRL(bet)}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="secondary"
            aria-label="Diminuir aposta"
            disabled={locked || betIndex <= 0}
            onClick={() => onChangeBet(betOptions[Math.max(0, betIndex - 1)])}
          >
            <Minus className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            aria-label="Aumentar aposta"
            disabled={locked || betIndex >= betOptions.length - 1}
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
            disabled={locked}
            aria-label={`Apostar R$ ${option}`}
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

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Quantidade de minas
        </span>
        <div className="flex flex-wrap gap-1.5">
          {mineOptions.map((option) => (
            <button
              key={option}
              type="button"
              disabled={locked}
              aria-label={`Jogar com ${option} minas`}
              onClick={() => onChangeMines(option)}
              className={cn(
                'flex-1 rounded-md border px-2 py-1.5 text-xs font-semibold tabular-nums transition-colors disabled:opacity-50',
                option === mines
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border/60 bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {isPlaying ? (
        <div className="flex flex-col gap-3">
          <dl className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-secondary/50 p-3 text-center">
            <div className="flex flex-col gap-0.5">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Atual
              </dt>
              <dd className="font-display text-lg font-bold tabular-nums text-accent">
                {formatMultiplier(currentMultiplier)}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Próxima gema
              </dt>
              <dd className="font-display text-lg font-bold tabular-nums">
                {formatMultiplier(nextMultiplier)}
              </dd>
            </div>
          </dl>

          <p className="text-center text-xs text-muted-foreground tabular-nums">
            {nextSafeChance.toFixed(1)}% de chance da próxima casa ser segura
          </p>

          <Button
            size="lg"
            onClick={onCashout}
            disabled={picks === 0}
            className="h-14 bg-accent font-display text-base font-bold text-accent-foreground hover:bg-accent/90"
          >
            {picks === 0 ? 'Abra uma casa para sacar' : `Sacar ${formatBRL(cashoutValue)}`}
          </Button>
        </div>
      ) : isRoundOver ? (
        <Button
          size="lg"
          onClick={onNewRound}
          className="h-14 font-display text-base font-bold"
        >
          Nova rodada
        </Button>
      ) : (
        <Button
          size="lg"
          onClick={onStart}
          disabled={insufficient}
          className="h-14 bg-accent font-display text-base font-bold text-accent-foreground hover:bg-accent/90"
        >
          {insufficient ? 'Saldo insuficiente' : 'Começar rodada'}
        </Button>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
        <span className="text-xs text-muted-foreground">
          Saldo{' '}
          <strong className="font-semibold text-foreground tabular-nums">
            {formatBRL(balance)}
          </strong>
        </span>

        <button
          type="button"
          onClick={onReset}
          disabled={locked}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <RotateCcw className="size-3.5" />
          Recarregar saldo
        </button>
      </div>
    </div>
  )
}
