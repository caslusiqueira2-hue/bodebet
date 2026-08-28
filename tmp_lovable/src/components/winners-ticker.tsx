import { TrendingUp } from 'lucide-react'
import { formatBRL, recentWins } from '@/lib/casino-data'

export function WinnersTicker() {
  return (
    <section
      aria-label="Últimos ganhadores"
      className="flex items-center gap-3 overflow-hidden rounded-xl border border-border/60 bg-card px-4 py-3"
    >
      <span className="flex shrink-0 items-center gap-2 text-xs font-semibold tracking-wide text-accent uppercase">
        <TrendingUp className="size-4" />
        Últimos prêmios
      </span>
      <ul className="no-scrollbar flex items-center gap-6 overflow-x-auto text-sm">
        {recentWins.map((win) => (
          <li key={win.player} className="flex shrink-0 items-center gap-2">
            <span className="text-muted-foreground">{win.player}</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="font-medium">{win.game}</span>
            <span className="font-semibold text-accent">{formatBRL(win.amount)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
