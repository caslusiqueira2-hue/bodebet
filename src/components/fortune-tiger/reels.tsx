import { cn } from '@/lib/utils';
import { REEL_COUNT, ROW_COUNT, symbols, type SymbolId } from '@/lib/fortune-tiger-engine';
import { SymbolIcon } from './tiger-assets';

const stripSymbols = [...symbols, ...symbols].map((symbol) => symbol.id);

function SymbolTile({ id, highlight, spinning }: { id: SymbolId; highlight?: boolean; spinning?: boolean }) {
  return (
    <div
      className={cn(
        'relative flex aspect-square items-center justify-center p-1',
        highlight && 'z-10',
        spinning && 'blur-[3px] opacity-90 translate-y-2'
      )}
    >
      <SymbolIcon id={id} className={cn('transition-all duration-300 w-full h-full object-contain', highlight ? 'scale-[1.15] drop-shadow-[0_0_20px_rgba(255,215,0,1)] z-20' : 'scale-100')} />
      
      {highlight && (
        <div className="absolute inset-0 border-4 border-[#ffdf70] rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.8)_inset,0_0_20px_rgba(255,215,0,0.5)] animate-pulse pointer-events-none z-30" />
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
    <div className="relative p-2 rounded-[1.5rem] bg-gradient-to-b from-[#1a0000] via-[#0d0000] to-black shadow-[0_20px_50px_rgba(0,0,0,0.9)] w-full max-w-sm mx-auto">
      <div className="relative grid grid-cols-3 gap-1 p-2 bg-[#050000] rounded-xl shadow-[inset_0_20px_40px_rgba(0,0,0,1)] overflow-hidden">
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,0,0,0.15)_0%,transparent_80%)] pointer-events-none z-0" />

        <div className="absolute top-0 bottom-0 left-[33.33%] w-[2px] bg-gradient-to-b from-transparent via-[#d4af37]/60 to-transparent z-10" />
        <div className="absolute top-0 bottom-0 left-[66.66%] w-[2px] bg-gradient-to-b from-transparent via-[#d4af37]/60 to-transparent z-10" />

        {Array.from({ length: REEL_COUNT }, (_, reel) => {
          const spinning = spinningReels[reel];

          return (
            <div key={reel} className="relative overflow-hidden rounded-lg z-10">
              {spinning ? (
                <>
                  <div className="invisible flex flex-col gap-1">
                    {Array.from({ length: ROW_COUNT }, (_, row) => (
                      <div key={row} className="aspect-square" />
                    ))}
                  </div>
                  <div className="absolute -top-[100%] bottom-0 left-0 right-0 overflow-hidden">
                    <div className="reel-strip flex flex-col gap-1 animate-spin-fast">
                      {stripSymbols.map((id, index) => (
                        <SymbolTile key={id + '-' + index} id={id} spinning={true} />
                      ))}
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050000] via-transparent to-[#050000] opacity-90 z-20" />
                </>
              ) : (
                <div className="flex flex-col gap-1">
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

