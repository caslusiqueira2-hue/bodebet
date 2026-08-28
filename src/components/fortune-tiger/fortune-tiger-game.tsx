
import { Sparkles, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBRL } from '@/lib/casino-data'
import { winTier } from '@/lib/fortune-tiger-engine'
import { Paytable } from './paytable'
import { Reels } from './reels'
import { SpinControls } from './spin-controls'
import { SpinHistory } from './spin-history'
import { TigerVault } from './tiger-vault'

import { useFortuneTiger } from './use-fortune-tiger'

export function FortuneTigerGame() {
  const game = useFortuneTiger()
  const tier = game.lastPayout && game.lastPayout > 0 ? winTier(game.lastMultiplier) : null

  return (
    /* No mobile a ordem é rolos → controles → histórico → prêmios.
       No desktop os itens voltam para as duas colunas via row/col-start. */
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="lg:col-start-1 lg:row-start-1">
        <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-[#25121a]">
          <div
            aria-hidden
            className="absolute inset-0 bg-[url('/fortune-tiger/cabinet-bg.png')] bg-cover bg-center opacity-35"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-[#3a1520]/70 via-[#1a0d13]/80 to-[#0d0710]"
          />

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

              {game.respinPending ? (
                <span className="payout-pop flex items-center gap-1.5 rounded-lg border border-accent bg-accent/15 px-3 py-2 text-xs font-bold text-accent">
                  <Sparkles className="size-4" />
                  Giro grátis liberado
                </span>
              ) : null}
            </div>

            <div className="mx-auto w-full max-w-[22rem]">
              <Reels
                grid={game.grid}
                spinningReels={game.spinningReels}
                winningCells={game.winningCells}
              />
            </div>

            {/* Área de mensagem com altura fixa para o layout não pular. */}
            <div className="flex min-h-16 flex-col items-center justify-center gap-1 text-center">
              {game.lastPayout && game.lastPayout > 0 ? (
                <>
                  <span
                    className={cn(
                      'payout-pop font-display font-bold tabular-nums text-accent',
                      tier === 'mega' ? 'text-3xl' : tier === 'grande' ? 'text-2xl' : 'text-xl',
                    )}
                  >
                    + {formatBRL(game.lastPayout)}
                  </span>
                  <span className="text-xs font-medium text-accent/80">
                    {game.lastMultiplier.toFixed(0)}x a aposta ·{' '}
                    {game.wins.length === 1 ? '1 linha' : `${game.wins.length} linhas`}
                  </span>
                </>
              ) : (
                <span
                  aria-live="polite"
                  className="text-sm font-medium text-muted-foreground"
                >
                  {game.message}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="lg:col-start-2 lg:row-start-1">
        <SpinControls
          bet={game.bet}
          balance={game.balance}
          isSpinning={game.isSpinning}
          autoSpins={game.autoSpins}
          turbo={game.turbo}
          onChangeBet={game.changeBet}
          onSpin={game.handleSpin}
          onStartAuto={game.startAuto}
          onStopAuto={game.stopAuto}
          onToggleTurbo={game.setTurbo}
          onReset={game.resetBalance}
        />
      </div>

      <div className="lg:col-start-1 lg:row-start-2">
        <SpinHistory history={game.history} />
      </div>

      <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-2">
        <TigerVault
          cost={game.vaultCost}
          prize={game.vaultPrize}
          tries={game.vaultTries}
          opened={game.vaultOpen}
          message={game.vaultMessage}
          disabled={game.isSpinning}
          onTry={game.tryVault}
        />
        <Paytable />
      </div>
    </div>
  )
}

