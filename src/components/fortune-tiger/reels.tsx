import { cn } from '@/lib/utils';
import { REEL_COUNT, ROW_COUNT, symbols, type SymbolId } from '@/lib/fortune-tiger-engine';
import { SymbolIcon } from './tiger-assets';

const stripSymbols = [...symbols, ...symbols].map((symbol) => symbol.id);

function SymbolTile({ id, highlight, spinning }: { id: SymbolId; highlight?: boolean; spinning?: boolean }) {
  return (
    <div
      className={cn(
        'relative flex aspect-square items-center justify-center',
        highlight && 'z-10',
        spinning && 'blur-[2px] opacity-80'
      )}
    >
      <SymbolIcon id={id} className={cn('transition-all duration-300', highlight ? 'scale-110 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]' : '')} />
      {highlight && (
        <div className="absolute inset-0 border-4 border-yellow-400 rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.8)_inset] animate-pulse pointer-events-none" />
      )}
    </div>
  );
}

type ReelsProps = {
  grid: SymbolId[];
  spinningReels: boolean[];
  winningCells: Set<number>;
}

export function Reels({ grid, spinningReels, winningCells }: ReelsProps) {
  return (
    <div className="relative p-3 rounded-2xl bg-gradient-to-b from-[#2a0808] via-[#1a0000] to-[#0d0000] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
      {/* Outer Golden Frame */}
      <div className="absolute inset-0 rounded-2xl border-4 border-[#d4af37] shadow-[0_0_15px_#ffdf70_inset] pointer-events-none z-20" style={{ borderStyle: 'ridge' }} />
      
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/50 rounded-tl-2xl z-20" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/50 rounded-tr-2xl z-20" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/50 rounded-bl-2xl z-20" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/50 rounded-br-2xl z-20" />

      {/* Grid Container */}
      <div className="relative grid grid-cols-3 gap-2 p-2 bg-[#050000] rounded-xl shadow-[inset_0_20px_30px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* Glowing Background inside Reels */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,50,50,0.1)_0%,transparent_70%)] pointer-events-none z-0" />

        {/* Separators */}
        <div className="absolute top-0 bottom-0 left-[33.33%] w-1 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent opacity-50 z-10" />
        <div className="absolute top-0 bottom-0 left-[66.66%] w-1 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent opacity-50 z-10" />

        {Array.from({ length: REEL_COUNT }, (_, reel) => {
          const spinning = spinningReels[reel];

          return (
            <div key={reel} className="relative overflow-hidden rounded-lg z-10">
              {spinning ? (
                <>
                  <div className="invisible flex flex-col gap-2">
                    {Array.from({ length: ROW_COUNT }, (_, row) => (
                      <div key={row} className="aspect-square" />
                    ))}
                  </div>
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="reel-strip flex flex-col gap-2">
                      {stripSymbols.map((id, index) => (
                        <SymbolTile key={-} id={id} spinning={true} />
                      ))}
                    </div>
                  </div>
                  {/* Motion blur overlay effect */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050000] via-transparent to-[#050000] opacity-80 z-20" />
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: ROW_COUNT }, (_, row) => {
                    const index = reel * ROW_COUNT + row;
                    return (
                      <SymbolTile
                        key={index}
                        id={grid[index]}
                        highlight={winningCells.has(index)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

