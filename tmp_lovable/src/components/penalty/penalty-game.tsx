import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { BalanceBar, BetSelector } from '@/components/bet-selector'
import { RoundHistory } from '@/components/round-history'
import { PenaltyPitch } from '@/components/penalty/penalty-pitch'
import { useDemoWallet } from '@/hooks/use-demo-wallet'
import { formatBRL } from '@/lib/game-format'
import {
  outcomeLabel,
  penaltyZones,
  shootPenalty,
  type PenaltyResult,
  type PenaltyZoneId,
} from '@/lib/penalty-engine'
import { cn } from '@/lib/utils'

type Phase = 'aim' | 'shooting' | 'result'

export function PenaltyGame() {
  const { balance, bet, history, changeBet, debit, credit, log, reset } = useDemoWallet({
    defaultBet: 5,
  })
  const [selected, setSelected] = useState<PenaltyZoneId | null>(null)
  const [phase, setPhase] = useState<Phase>('aim')
  const [result, setResult] = useState<PenaltyResult | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const insufficient = bet > balance
  const shooting = phase === 'shooting'

  const shoot = useCallback(
    (zoneId: PenaltyZoneId) => {
      if (shooting || bet > balance) return
      if (!debit(bet)) return

      const round = shootPenalty(zoneId, bet)
      setSelected(zoneId)
      setResult(round)
      setPhase('shooting')

      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        if (round.payout > 0) credit(round.payout)
        log({
          bet,
          payout: round.payout,
          multiplier: round.multiplier,
          label: `${outcomeLabel[round.outcome]} · ${round.zone.label}`,
        })
        setPhase('result')
      }, 1400)
    },
    [balance, bet, credit, debit, log, shooting],
  )

  function handleSelect(zoneId: PenaltyZoneId) {
    if (shooting) return
    if (phase === 'result') {
      setPhase('aim')
      setResult(null)
    }
    setSelected(zoneId)
  }

  function handleShoot() {
    if (!selected) return
    shoot(selected)
  }

  function handleNext() {
    setPhase('aim')
    setResult(null)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <PenaltyPitch
        selected={selected}
        phase={phase}
        result={phase === 'aim' ? null : result}
        onSelect={handleSelect}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4">
          <BetSelector bet={bet} locked={shooting} onChange={changeBet} />

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Canto escolhido
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {penaltyZones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  disabled={shooting}
                  onClick={() => handleSelect(zone.id)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50',
                    zone.id === selected
                      ? 'border-accent bg-accent/15 text-foreground'
                      : 'border-border/60 bg-secondary text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span>{zone.label}</span>
                  <span className="tabular-nums text-primary">{zone.multiplier.toFixed(2)}x</span>
                </button>
              ))}
            </div>
          </div>

          {phase === 'result' && result ? (
            <Button className="h-12 text-base font-bold" onClick={handleNext}>
              Nova cobrança
            </Button>
          ) : (
            <Button
              className="h-12 text-base font-bold"
              disabled={!selected || shooting || insufficient}
              onClick={handleShoot}
            >
              {shooting
                ? 'Cobrando...'
                : insufficient
                  ? 'Saldo insuficiente'
                  : `Chutar ${formatBRL(bet)}`}
            </Button>
          )}

          {phase === 'result' && result ? (
            <p
              className={cn(
                'rounded-lg px-3 py-2 text-center text-sm font-semibold',
                result.outcome === 'goal'
                  ? 'bg-primary/15 text-primary'
                  : 'bg-destructive/15 text-destructive',
              )}
              role="status"
            >
              {outcomeLabel[result.outcome]}{' '}
              {result.outcome === 'goal'
                ? `Você ganhou ${formatBRL(result.payout)} (${result.multiplier.toFixed(2)}x)`
                : 'Aposta perdida.'}
            </p>
          ) : null}

          <BalanceBar balance={balance} locked={shooting} onReset={reset} />
        </div>

        <RoundHistory history={history} title="Suas cobranças" empty="Nenhuma cobrança ainda." />
      </div>
    </div>
  )
}
