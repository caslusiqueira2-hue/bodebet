import { cn } from '@/lib/utils'
import { formatBRL } from '@/lib/casino-data'
import { symbolsById } from '@/lib/fortune-tiger-engine'
import type { HistoryEntry } from './use-fortune-tiger'

export function SpinHistory({ history }: { history: HistoryEntry[] }) {
  return (
    <section
      aria-labelledby="spin-history-title"
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4"
    >
      <h2 id="spin-history-title" className="font-display text-sm font-bold">
        Últimos giros
      </h2>

      {history.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          Seus giros aparecem aqui.
        </p>
      ) : (
        <ul className="divide-y divide-border/50">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="grid grid-cols-[1fr_auto_5.5rem] items-center gap-2 py-2 text-xs"
            >
              <span className="truncate text-muted-foreground">
                {entry.bet === 0 ? 'Giro grátis' : formatBRL(entry.bet)}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {entry.symbol ? symbolsById[entry.symbol].name : '—'}
              </span>
              <span
                className={cn(
                  'text-right font-semibold tabular-nums',
                  entry.payout > 0 ? 'text-accent' : 'text-muted-foreground',
                )}
              >
                {entry.payout > 0 ? `+${formatBRL(entry.payout)}` : '—'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
