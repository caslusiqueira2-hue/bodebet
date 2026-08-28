
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BalanceBar, BetSelector } from '@/components/bet-selector'
import { RoundHistory } from '@/components/round-history'
import { formatBRL } from '@/lib/game-format'
import { riskOptions, rowOptions, type RowCount } from '@/lib/plinko-engine'
import { cn } from '@/lib/utils'
import { PlinkoBoard } from './plinko-board'
import { usePlinko } from './use-plinko'

const autoOptions = [10, 25, 50]

export function PlinkoGame() {
  const game = usePlinko()
  const locked = game.autoLeft > 0

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="lg:col-start-1 lg:row-start-1">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2">
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

            <div aria-live="polite" className="min-h-10 text-right">
              {game.lastPayout !== null && game.lastMultiplier !== null ? (
                <>
                  <p
                    className={cn(
                      'payout-pop font-display text-xl font-bold tabular-nums',
                      game.lastMultiplier >= 1 ? 'text-accent' : 'text-muted-foreground',
                    )}
                  >
                    + {formatBRL(game.lastPayout)}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    última bola em {game.lastMultiplier}x
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Solte a bola e torça pelas bordas.</p>
              )}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[34rem]">
            <PlinkoBoard
              rows={game.rows}
              multipliers={game.multipliers}
              balls={game.balls}
              lastSlot={game.lastSlot}
            />
          </div>
        </div>
      </div>

      <div className="lg:col-start-2 lg:row-start-1">
        <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4">
          <BetSelector bet={game.bet} locked={locked} onChange={game.changeBet} />

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Risco
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {riskOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={locked}
                  onClick={() => game.changeRisk(option.id)}
                  className={cn(
                    'rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50',
                    option.id === game.risk
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/60 bg-secondary text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Fileiras
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {rowOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={locked}
                  onClick={() => game.changeRows(option as RowCount)}
                  className={cn(
                    'rounded-md border px-2 py-1.5 text-xs font-semibold tabular-nums transition-colors disabled:opacity-50',
                    option === game.rows
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border/60 bg-secondary text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="h-14 text-base font-bold"
            disabled={locked || game.bet > game.balance}
            onClick={() => game.drop()}
          >
            Soltar bola
          </Button>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Bolas automáticas
            </span>
            {game.autoLeft > 0 ? (
              <Button variant="secondary" className="h-10" onClick={game.stopAuto}>
                Parar auto ({game.autoLeft})
              </Button>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {autoOptions.map((count) => (
                  <button
                    key={count}
                    type="button"
                    disabled={game.bet > game.balance}
                    onClick={() => game.startAuto(count)}
                    className="rounded-md border border-border/60 bg-secondary px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    {count}
                  </button>
                ))}
              </div>
            )}
          </div>

          <BalanceBar balance={game.balance} locked={false} onReset={game.resetBalance} />
        </div>
      </div>

      <div className="lg:col-start-1 lg:row-start-2">
        <RoundHistory
          history={game.history}
          title="Suas bolas"
          empty="Nenhuma bola solta ainda."
        />
      </div>

      <div className="lg:col-start-2 lg:row-start-2">
        <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4">
          <h2 className="font-display text-sm font-bold">Multiplicadores</h2>
          <ul className="grid grid-cols-4 gap-1.5 text-center text-xs">
            {game.multipliers.map((multiplier, index) => (
              <li
                key={index}
                className="rounded-md border border-border/60 bg-secondary py-1 font-semibold tabular-nums"
              >
                {multiplier}x
              </li>
            ))}
          </ul>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Cada pino desvia a bola para a esquerda ou direita com a mesma chance. As casas do
            centro são as mais prováveis e pagam menos; as bordas são raras e pagam muito mais.
          </p>
        </section>
      </div>
    </div>
  )
}
