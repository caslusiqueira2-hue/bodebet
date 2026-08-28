
import { formatBRL } from '@/lib/casino-data'
import { formatMultiplier, type RoundRecord } from '@/lib/mines-engine'
import { cn } from '@/lib/utils'

export function MinesHistory({ history }: { history: RoundRecord[] }) {
  return (
    <section
      aria-labelledby="mines-history-title"
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4"
    >
      <h2 id="mines-history-title" className="font-display text-sm font-bold">
        Suas rodadas
      </h2>

      {history.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhuma rodada ainda. Escolha as minas e comece.
        </p>
      ) : (
        <ul className="divide-y divide-border/60">
          {history.map((round) => (
            <li
              key={round.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2 text-sm"
            >
              <span className="text-xs text-muted-foreground tabular-nums">
                {round.mines} minas · {round.picks}{' '}
                {round.picks === 1 ? 'gema' : 'gemas'}
              </span>
              <span className="text-right text-xs text-muted-foreground tabular-nums">
                {formatBRL(round.bet)}
                {round.outcome === 'sacou' && ` · ${formatMultiplier(round.multiplier)}`}
              </span>
              <span
                className={cn(
                  'w-24 text-right text-xs font-bold tabular-nums',
                  round.outcome === 'sacou' ? 'text-accent' : 'text-destructive',
                )}
              >
                {round.outcome === 'sacou'
                  ? `+${formatBRL(round.payout)}`
                  : `-${formatBRL(round.bet)}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
