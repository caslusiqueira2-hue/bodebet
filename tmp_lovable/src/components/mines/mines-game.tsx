
import { Bomb, Gem, TrendingUp } from 'lucide-react'
import { formatBRL } from '@/lib/casino-data'
import { formatMultiplier } from '@/lib/mines-engine'
import { cn } from '@/lib/utils'
import { MinesControls } from './mines-controls'
import { MinesGrid } from './mines-grid'
import { MinesHistory } from './mines-history'
import { MultiplierTable } from './multiplier-table'
import { useMines } from './use-mines'

export function MinesGame() {
  const game = useMines()

  return (
    /* No mobile: tabuleiro → controles → tabela → histórico.
       No desktop volta para duas colunas via row/col-start. */
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="lg:col-start-1 lg:row-start-1">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
          <div
            aria-live="polite"
            className="flex min-h-16 flex-col items-center justify-center gap-1 text-center"
          >
            {game.isPlaying ? (
              game.picks === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Abra uma casa para começar a multiplicar.
                </p>
              ) : (
                <>
                  <p className="flex items-center gap-1.5 font-display text-3xl font-bold tabular-nums text-accent">
                    <TrendingUp className="size-6" aria-hidden="true" />
                    {formatMultiplier(game.currentMultiplier)}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatBRL(game.cashoutValue)} disponível para saque
                  </p>
                </>
              )
            ) : game.lastResult ? (
              <>
                <p
                  className={cn(
                    'payout-pop flex items-center gap-2 font-display text-2xl font-bold',
                    game.lastResult.outcome === 'sacou' ? 'text-accent' : 'text-destructive',
                  )}
                >
                  {game.lastResult.outcome === 'sacou' ? (
                    <>
                      <Gem className="size-6" aria-hidden="true" />+
                      {formatBRL(game.lastResult.payout)}
                    </>
                  ) : (
                    <>
                      <Bomb className="size-6" aria-hidden="true" />
                      Você achou a mina
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {game.lastResult.outcome === 'sacou'
                    ? `Sacou em ${formatMultiplier(game.lastResult.multiplier)}`
                    : `Perdeu ${formatBRL(game.bet)} nesta rodada`}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Escolha quantas minas quer enfrentar e comece a rodada.
              </p>
            )}
          </div>

          <div className="mx-auto w-full max-w-[20rem]">
            <MinesGrid
              isPlaying={game.isPlaying}
              isRoundOver={game.isRoundOver}
              revealed={game.revealed}
              minePositions={game.minePositions}
              hitTile={game.hitTile}
              onReveal={game.revealTile}
            />
          </div>

          <dl className="mx-auto flex w-full max-w-[20rem] items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <dt className="text-muted-foreground">Gemas</dt>
              <dd className="font-semibold tabular-nums">
                {game.picks}/{game.safeTiles}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="text-muted-foreground">Minas</dt>
              <dd className="font-semibold tabular-nums">{game.mines}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="text-muted-foreground">Aposta</dt>
              <dd className="font-semibold tabular-nums">{formatBRL(game.bet)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="lg:col-start-2 lg:row-start-1">
        <MinesControls
          bet={game.bet}
          mines={game.mines}
          balance={game.balance}
          isPlaying={game.isPlaying}
          isRoundOver={game.isRoundOver}
          picks={game.picks}
          currentMultiplier={game.currentMultiplier}
          nextMultiplier={game.nextMultiplier}
          cashoutValue={game.cashoutValue}
          nextSafeChance={game.nextSafeChance}
          onChangeBet={game.changeBet}
          onChangeMines={game.changeMines}
          onStart={game.startRound}
          onCashout={game.cashout}
          onNewRound={game.newRound}
          onReset={game.resetBalance}
        />
      </div>

      <div className="lg:col-start-1 lg:row-start-2">
        <MinesHistory history={game.history} />
      </div>

      <div className="lg:col-start-2 lg:row-start-2">
        <MultiplierTable mines={game.mines} picks={game.picks} />
      </div>
    </div>
  )
}
