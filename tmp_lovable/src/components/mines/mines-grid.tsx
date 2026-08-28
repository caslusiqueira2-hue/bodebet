
import { Bomb, Gem } from 'lucide-react'
import { TOTAL_TILES } from '@/lib/mines-engine'
import { cn } from '@/lib/utils'

type MinesGridProps = {
  isPlaying: boolean
  isRoundOver: boolean
  revealed: number[]
  minePositions: number[]
  hitTile: number | null
  onReveal: (index: number) => void
}

export function MinesGrid({
  isPlaying,
  isRoundOver,
  revealed,
  minePositions,
  hitTile,
  onReveal,
}: MinesGridProps) {
  const revealedSet = new Set(revealed)
  const mineSet = new Set(minePositions)

  return (
    <div
      role="group"
      aria-label="Tabuleiro do Mines com 25 casas"
      className="grid grid-cols-5 gap-1.5 sm:gap-2"
    >
      {Array.from({ length: TOTAL_TILES }, (_, index) => {
        const isGem = revealedSet.has(index)
        const isMine = mineSet.has(index)
        const isHit = hitTile === index
        // Ao fim da rodada o tabuleiro abre e mostra onde estavam as minas.
        const showMine = isMine && isRoundOver
        const isOpen = isGem || showMine
        const disabled = !isPlaying || isGem

        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onReveal(index)}
            aria-label={
              isGem
                ? `Casa ${index + 1}: gema`
                : showMine
                  ? `Casa ${index + 1}: mina`
                  : `Revelar casa ${index + 1}`
            }
            className={cn(
              'relative flex aspect-square items-center justify-center rounded-lg border transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              !isOpen && 'border-border/60 bg-secondary',
              !isOpen && isPlaying && 'cursor-pointer hover:-translate-y-0.5 hover:bg-muted',
              !isOpen && !isPlaying && 'opacity-70',
              isGem && 'border-accent/60 bg-accent/15',
              showMine && !isHit && 'border-destructive/40 bg-destructive/10',
              isHit && 'border-destructive bg-destructive/25',
            )}
          >
            {isGem ? (
              <Gem className="tile-reveal size-6 text-accent sm:size-7" aria-hidden="true" />
            ) : showMine ? (
              <Bomb
                className={cn(
                  'size-6 text-destructive sm:size-7',
                  isHit ? 'tile-boom' : 'opacity-60',
                )}
                aria-hidden="true"
              />
            ) : (
              <span
                className="size-1.5 rounded-full bg-muted-foreground/30"
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
