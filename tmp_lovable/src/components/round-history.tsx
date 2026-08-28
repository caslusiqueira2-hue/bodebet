import { formatBRL } from '@/lib/game-format'
import { cn } from '@/lib/utils'
import type { RoundLog } from '@/hooks/use-demo-wallet'

export function RoundHistory({
  history,
  title = 'Suas rodadas',
  empty = 'Nenhuma rodada ainda.',
}: {
  history: RoundLog[]
  title?: string
  empty?: string
}) {
  return (
    <section
      aria-labelledby="round-history-title"
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4"
    >
      <h2 id="round-history-title" className="font-display text-sm font-bold">
        {title}
      </h2>

      {history.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y divide-border/60">
          {history.map((round) => (
            <li
              key={round.id}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2 text-xs"
            >
              <span className="truncate text-muted-foreground">{round.label ?? '—'}</span>
              <span className="text-right text-muted-foreground tabular-nums">
                {round.bet > 0 ? formatBRL(round.bet) : 'grátis'}
              </span>
              <span
                className={cn(
                  'w-24 text-right font-bold tabular-nums',
                  round.payout > 0 ? 'text-accent' : 'text-muted-foreground',
                )}
              >
                {round.payout > 0 ? `+${formatBRL(round.payout)}` : '—'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
