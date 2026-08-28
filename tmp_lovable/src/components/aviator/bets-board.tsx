import { formatMultiplier } from '@/lib/aviator-engine'
import type { LiveBet } from '@/lib/aviator-engine'
import { formatBRL } from '@/lib/casino-data'
import { cn } from '@/lib/utils'
import type { RoundResult } from './use-aviator'

export function BetsBoard({ liveBets, myBets }: { liveBets: LiveBet[]; myBets: RoundResult[] }) {
  const totalStake = liveBets.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section
        aria-labelledby="live-bets-title"
        className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4"
      >
        <div className="flex items-baseline justify-between">
          <h2 id="live-bets-title" className="font-display text-sm font-bold">
            Apostas da rodada
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {liveBets.length} jogadores · {formatBRL(totalStake)}
          </span>
        </div>

        <ul className="flex flex-col divide-y divide-border/50">
          {liveBets.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[1fr_auto_4rem] items-center gap-3 py-2 text-sm"
            >
              <span className="truncate text-muted-foreground">{item.player}</span>
              <span className="text-right tabular-nums">{formatBRL(item.amount)}</span>
              <span
                className={cn(
                  'text-right text-xs font-bold tabular-nums',
                  item.cashedAt ? 'text-accent' : 'text-muted-foreground',
                )}
              >
                {item.cashedAt ? formatMultiplier(item.cashedAt) : 'no ar'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="my-bets-title"
        className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4"
      >
        <h2 id="my-bets-title" className="font-display text-sm font-bold">
          Minhas rodadas
        </h2>

        {myBets.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Suas apostas aparecem aqui depois da primeira rodada.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/50">
            {myBets.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[1fr_auto_6.5rem] items-center gap-3 py-2 text-sm"
              >
                <span className="tabular-nums">{formatBRL(item.amount)}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  explodiu em {formatMultiplier(item.crashedAt)}
                </span>
                <span
                  className={cn(
                    'text-right text-xs font-bold tabular-nums',
                    item.payout > 0 ? 'text-accent' : 'text-destructive',
                  )}
                >
                  {item.payout > 0 ? `+${formatBRL(item.payout)}` : `-${formatBRL(item.amount)}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
