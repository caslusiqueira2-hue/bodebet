import { formatMultiplier, multiplierTone } from '@/lib/aviator-engine'
import { cn } from '@/lib/utils'

export function HistoryBar({ history }: { history: number[] }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-xs tracking-wide text-muted-foreground uppercase">
        Rodadas
      </span>
      <ul className="no-scrollbar flex items-center gap-2 overflow-x-auto">
        {history.map((value, index) => (
          <li
            key={`${value}-${index}`}
            className={cn(
              'shrink-0 rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs font-bold tabular-nums',
              multiplierTone(value),
            )}
          >
            {formatMultiplier(value)}
          </li>
        ))}
      </ul>
    </div>
  )
}
