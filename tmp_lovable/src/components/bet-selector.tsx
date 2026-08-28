
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { betOptions } from '@/hooks/use-demo-wallet'
import { formatBRL } from '@/lib/game-format'
import { cn } from '@/lib/utils'

type BetSelectorProps = {
  bet: number
  locked?: boolean
  onChange: (value: number) => void
}

/** Stepper + atalhos de valor usados por todos os jogos. */
export function BetSelector({ bet, locked = false, onChange }: BetSelectorProps) {
  const index = betOptions.indexOf(bet as (typeof betOptions)[number])

  return (
    <div className="flex flex-col gap-3">
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
            disabled={locked || index <= 0}
            onClick={() => onChange(betOptions[Math.max(0, index - 1)])}
          >
            <Minus className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            aria-label="Aumentar aposta"
            disabled={locked || index >= betOptions.length - 1}
            onClick={() => onChange(betOptions[Math.min(betOptions.length - 1, index + 1)])}
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
            onClick={() => onChange(option)}
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
    </div>
  )
}

type BalanceBarProps = {
  balance: number
  locked?: boolean
  onReset: () => void
}

/** Rodapé de saldo com o botão de recarregar o modo demonstração. */
export function BalanceBar({ balance, locked = false, onReset }: BalanceBarProps) {
  return (
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
  )
}
