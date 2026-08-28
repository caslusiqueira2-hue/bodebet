
import { TOTAL_TILES, formatMultiplier, multiplierFor } from '@/lib/mines-engine'
import { cn } from '@/lib/utils'

/** Mostra os multiplicadores das primeiras gemas para o nível escolhido. */
export function MultiplierTable({ mines, picks }: { mines: number; picks: number }) {
  const safeTiles = TOTAL_TILES - mines
  const steps = Array.from({ length: Math.min(safeTiles, 10) }, (_, i) => i + 1)

  return (
    <section
      aria-labelledby="mines-table-title"
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="mines-table-title" className="font-display text-sm font-bold">
          Multiplicadores
        </h2>
        <span className="text-xs text-muted-foreground">{mines} minas</span>
      </div>

      <ul className="grid grid-cols-2 gap-1.5">
        {steps.map((step) => (
          <li
            key={step}
            className={cn(
              'flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs tabular-nums transition-colors',
              step === picks
                ? 'border-accent/60 bg-accent/15 text-foreground'
                : 'border-border/60 bg-secondary/50 text-muted-foreground',
            )}
          >
            <span>
              {step} {step === 1 ? 'gema' : 'gemas'}
            </span>
            <strong className="font-semibold text-foreground">
              {formatMultiplier(multiplierFor(mines, step))}
            </strong>
          </li>
        ))}
      </ul>

      {safeTiles > 10 && (
        <p className="text-[11px] text-muted-foreground">
          Segue subindo até {safeTiles} gemas, quando o tabuleiro é limpo e o saque é automático.
        </p>
      )}
    </section>
  )
}
