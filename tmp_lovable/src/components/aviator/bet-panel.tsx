
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatBRL } from '@/lib/casino-data'
import { cn } from '@/lib/utils'
import type { ActiveBet, Phase } from './use-aviator'

const QUICK_AMOUNTS = [5, 20, 50, 100]

export function BetPanel({
  phase,
  multiplier,
  balance,
  bet,
  queuedBet,
  autoCashout,
  onAutoCashoutChange,
  onPlaceBet,
  onCancelBet,
  onCashOut,
  notice,
}: {
  phase: Phase
  multiplier: number
  balance: number
  bet: ActiveBet | null
  queuedBet: number | null
  autoCashout: string
  onAutoCashoutChange: (value: string) => void
  onPlaceBet: (amount: number) => void
  onCancelBet: () => void
  onCashOut: () => void
  notice: string | null
}) {
  const [amount, setAmount] = useState('10')
  const parsed = Number.parseFloat(amount.replace(',', '.'))
  const isValid = Number.isFinite(parsed) && parsed > 0

  const canCashOut = phase === 'flying' && bet !== null && bet.cashedAt === null
  const hasPendingBet = queuedBet !== null || (phase === 'betting' && bet !== null)

  const potential = bet ? bet.amount * multiplier : 0

  return (
    <aside className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-wide text-muted-foreground uppercase">Saldo demo</span>
        <span className="font-display text-lg font-bold tabular-nums">{formatBRL(balance)}</span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="aviator-amount" className="text-xs font-medium text-muted-foreground">
          Valor da aposta
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
          <span className="text-sm text-muted-foreground">R$</span>
          <input
            id="aviator-amount"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full bg-transparent py-2.5 font-display text-lg font-semibold tabular-nums outline-none"
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(String(value))}
              className="rounded-md border border-border/60 bg-secondary py-1.5 text-xs font-semibold tabular-nums transition-colors hover:border-primary/60 hover:text-primary"
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="aviator-auto" className="text-xs font-medium text-muted-foreground">
          Retirada automática (opcional)
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
          <input
            id="aviator-auto"
            inputMode="decimal"
            placeholder="2.00"
            value={autoCashout}
            onChange={(event) => onAutoCashoutChange(event.target.value)}
            className="w-full bg-transparent py-2.5 font-display text-lg font-semibold tabular-nums outline-none placeholder:font-normal placeholder:text-muted-foreground"
          />
          <span className="text-sm text-muted-foreground">x</span>
        </div>
      </div>

      {canCashOut ? (
        <Button
          type="button"
          onClick={onCashOut}
          className="h-14 bg-accent text-base font-bold text-accent-foreground hover:bg-accent/90"
        >
          Retirar {formatBRL(potential)}
        </Button>
      ) : hasPendingBet ? (
        <Button
          type="button"
          variant="secondary"
          onClick={onCancelBet}
          className="h-14 text-base font-bold"
        >
          Cancelar aposta de {formatBRL(queuedBet ?? bet?.amount ?? 0)}
        </Button>
      ) : (
        <Button
          type="button"
          disabled={!isValid}
          onClick={() => onPlaceBet(parsed)}
          className="h-14 text-base font-bold"
        >
          {phase === 'betting' ? 'Apostar nesta rodada' : 'Apostar na próxima'}
        </Button>
      )}

      <p
        aria-live="polite"
        className={cn(
          'min-h-5 text-center text-xs',
          notice?.startsWith('Retirada') ? 'text-accent' : 'text-muted-foreground',
        )}
      >
        {notice ?? 'Aposta simulada, sem valor real.'}
      </p>
    </aside>
  )
}
