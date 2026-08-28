
import Image from '@/components/ui/image'
import { cn } from '@/lib/utils'
import { REEL_COUNT, ROW_COUNT, symbols, symbolsById, type SymbolId } from '@/lib/fortune-tiger-engine'

/** Fita usada durante o giro: repetida duas vezes para o loop ser contínuo. */
const stripSymbols = [...symbols, ...symbols].map((symbol) => symbol.id)

function SymbolTile({ id, highlight }: { id: SymbolId; highlight?: boolean }) {
  const symbol = symbolsById[id]

  return (
    <div
      className={cn(
        'relative flex aspect-square items-center justify-center rounded-lg border border-accent/15 bg-background/70',
        highlight && 'cell-win border-accent/70 bg-accent/10',
      )}
    >
      <Image
        src={symbol.image || '/placeholder.svg'}
        alt={symbol.name}
        width={112}
        height={112}
        className="size-[82%] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
      />
    </div>
  )
}

type ReelsProps = {
  grid: SymbolId[]
  spinningReels: boolean[]
  winningCells: Set<number>
}

export function Reels({ grid, spinningReels, winningCells }: ReelsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl border border-accent/25 bg-[#1a0f14]/80 p-2 shadow-[inset_0_2px_24px_rgba(0,0,0,0.6)]">
      {Array.from({ length: REEL_COUNT }, (_, reel) => {
        const spinning = spinningReels[reel]

        return (
          <div key={reel} className="relative overflow-hidden rounded-lg">
            {spinning ? (
              <>
                {/* Mantém a altura da coluna estável enquanto a fita gira. */}
                <div className="invisible flex flex-col gap-2">
                  {Array.from({ length: ROW_COUNT }, (_, row) => (
                    <div key={row} className="aspect-square" />
                  ))}
                </div>
                <div className="absolute inset-0 overflow-hidden">
                  <div className="reel-strip flex flex-col gap-2">
                    {stripSymbols.map((id, index) => (
                      <SymbolTile key={`${id}-${index}`} id={id} />
                    ))}
                  </div>
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background/70"
                />
              </>
            ) : (
              <div className="flex flex-col gap-2">
                {Array.from({ length: ROW_COUNT }, (_, row) => {
                  const index = reel * ROW_COUNT + row
                  return (
                    <SymbolTile
                      key={index}
                      id={grid[index]}
                      highlight={winningCells.has(index)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
