
import { Sparkles, Wallet, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BalanceBar, BetSelector } from '@/components/bet-selector'
import { RoundHistory } from '@/components/round-history'
import { formatBRL } from '@/lib/game-format'
import { cn } from '@/lib/utils'
import type { TumbleConfig } from '@/lib/tumble-slot-engine'
import { TumbleGrid } from './tumble-grid'
import { TumblePaytable } from './tumble-paytable'
import { useTumbleSlot } from './use-tumble-slot'

const autoOptions = [10, 25, 50]

type TumbleSlotGameProps = {
  config: TumbleConfig
  /** Classes de fundo do gabinete, únicas por jogo. */
  cabinet: string
}

export function TumbleSlotGame({ config, cabinet }: TumbleSlotGameProps) {
  const game = useTumbleSlot(config)
  const locked = game.spinning || game.autoSpins > 0 || game.freeSpins > 0

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="lg:col-start-1 lg:row-start-1">
        <div className={cn('relative overflow-hidden rounded-2xl border border-accent/30', cabinet)}>
          <div className="relative flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-background/60 px-3 py-2">
                <Wallet className="size-4 shrink-0 text-accent" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Saldo demo
                  </span>
                  <span className="font-display text-base font-bold tabular-nums">
                    {formatBRL(game.balance)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {game.multiplier > 1 ? (
                  <span className="payout-pop rounded-lg border border-accent bg-accent/15 px-3 py-2 text-xs font-bold text-accent tabular-nums">
                    Total {game.multiplier}x
                  </span>
                ) : null}
                {game.freeSpins > 0 ? (
                  <span className="payout-pop flex items-center gap-1.5 rounded-lg border border-primary bg-primary/15 px-3 py-2 text-xs font-bold text-primary">
                    <Sparkles className="size-4" />
                    {game.freeSpins} grátis
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[34rem]">
              <TumbleGrid
                config={config}
                grid={game.grid}
                spinning={game.spinning}
                winningCells={game.winningCells}
                orbs={game.orbs}
              />
            </div>

            <div className="flex min-h-16 flex-col items-center justify-center gap-1 text-center">
              {game.roundWin && game.roundWin > 0 ? (
                <>
                  <span className="payout-pop font-display text-2xl font-bold text-accent tabular-nums">
                    + {formatBRL(game.roundWin)}
                  </span>
                  <span className="text-xs font-medium text-accent/80">
                    {game.tumbles === 1 ? '1 queda' : `${game.tumbles} quedas`}
                    {game.multiplier > 1 ? ` · ${game.multiplier}x` : ''}
                  </span>
                </>
              ) : (
                <span aria-live="polite" className="text-sm font-medium text-muted-foreground">
                  {game.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-start-2 lg:row-start-1">
        <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4">
          <BetSelector bet={game.bet} locked={locked} onChange={game.changeBet} />

          <Button
            className="h-14 gap-2 text-base font-bold"
            disabled={locked || game.bet > game.balance}
            onClick={game.handleSpin}
          >
            <Zap className="size-5" />
            {game.spinning ? 'Girando...' : 'Girar'}
          </Button>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Giros automáticos
            </span>
            {game.autoSpins > 0 ? (
              <Button variant="secondary" className="h-10" onClick={game.stopAuto}>
                Parar auto ({game.autoSpins})
              </Button>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {autoOptions.map((count) => (
                  <button
                    key={count}
                    type="button"
                    disabled={locked || game.bet > game.balance}
                    onClick={() => game.startAuto(count)}
                    className="rounded-md border border-border/60 bg-secondary px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    {count}
                  </button>
                ))}
              </div>
            )}
          </div>

          <BalanceBar balance={game.balance} locked={locked} onReset={game.resetBalance} />
        </div>
      </div>

      <div className="lg:col-start-1 lg:row-start-2">
        <RoundHistory
          history={game.history}
          empty="Nenhum giro ainda. Faça sua aposta e gire."
        />
      </div>

      <div className="lg:col-start-2 lg:row-start-2">
        <TumblePaytable config={config} />
      </div>
    </div>
  )
}
