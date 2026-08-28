import { cn } from '@/lib/utils'
import { SymbolIcon } from './symbol-icon'
import { COLS, ROWS, symbolLookup, type TumbleConfig } from '@/lib/tumble-slot-engine'

type TumbleGridProps = {
  config: TumbleConfig
  grid: string[]
  spinning: boolean
  winningCells: Set<number>
  orbs: { cell: number; value: number }[]
}

export function TumbleGrid({ config, grid, spinning, winningCells, orbs }: TumbleGridProps) {
  const lookup = symbolLookup(config)
  const orbByCell = new Map(orbs.map((orb) => [orb.cell, orb.value]))

  return (
    <div
      className="grid gap-1.5 rounded-xl border border-accent/25 bg-background/50 p-2 shadow-[inset_0_2px_24px_rgba(0,0,0,0.55)] sm:gap-2 sm:p-3"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: COLS }, (_, col) => (
        <div key={col} className="flex flex-col gap-1.5 sm:gap-2">
          {Array.from({ length: ROWS }, (_, row) => {
            const index = col * ROWS + row
            const symbol = lookup[grid[index]]
            const winning = winningCells.has(index)
            const orb = orbByCell.get(index)

            return (
              <div
                key={row}
                className={cn(
                  'relative flex aspect-square items-center justify-center rounded-lg border border-border/50 bg-gradient-to-br transition-all duration-200',
                  symbol?.tone ?? 'from-muted to-muted',
                  winning && 'cell-win scale-105 border-accent shadow-[0_0_18px_var(--accent)]',
                  spinning && 'blur-[2px] opacity-80',
                )}
                title={symbol?.name}
              >
                <SymbolIcon id={grid[index]} />
                <span className="sr-only">{symbol?.name}</span>

                {orb !== undefined ? (
                  <span className="payout-pop absolute -top-1 -right-1 rounded-full border border-accent bg-background px-1.5 py-0.5 text-[0.6rem] font-bold text-accent tabular-nums">
                    {orb}x
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
