import { cn } from '@/lib/utils';
import { type SymbolId } from '@/lib/fortune-tiger-engine';

export function TigerLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex flex-col items-center justify-center', className)}>
      <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#ffdf70] via-[#d4af37] to-[#aa7c11] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '1px #591b0c' }}>
        FORTUNE
      </h1>
      <h2 className="font-black text-6xl md:text-7xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#ff5e5e] via-[#e61919] to-[#8a0000] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] -mt-4" style={{ WebkitTextStroke: '2px #ffdf70' }}>
        TIGER
      </h2>
      <div className="absolute -top-10 -z-10 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.4)_0%,transparent_70%)] blur-xl" />
    </div>
  );
}

export function TigerCharacter({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-56 h-56 md:w-64 md:h-64 z-20 flex items-center justify-center', className)}>
      {/* Glow behind tiger */}
      <div className="absolute inset-0 bg-yellow-500/30 blur-3xl rounded-full" />
      
      {/* Masking the tiger image into a beautiful circle/burst */}
      <div className="relative w-full h-full rounded-full border-4 border-[#d4af37] shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden">
        <img src="/fortune-tiger/premium/tiger.jpg" alt="Fortune Tiger" className="w-full h-full object-cover object-top scale-110" />
      </div>
      
      {/* Decorative frame overlay */}
      <div className="absolute -inset-2 border-[6px] border-[#8a4400] rounded-full pointer-events-none opacity-50 blur-[1px]" />
    </div>
  );
}

export function SymbolIcon({ id, className }: { id: SymbolId; className?: string }) {
  const symbolMap: Record<SymbolId, string> = {
    tiger: '/fortune-tiger/premium/wild.jpg',
    ingot: '/fortune-tiger/premium/ingot.jpg',
    firecracker: '/fortune-tiger/premium/firecracker.jpg',
    drum: '/fortune-tiger/premium/drum.jpg',
    orange: '/fortune-tiger/premium/orange.jpg',
    coin: '/fortune-tiger/premium/coin.jpg',
  };

  const imgSrc = symbolMap[id];

  return (
    <div className={cn('w-full h-full p-[2px] flex items-center justify-center relative drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)]', className)}>
      <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-[#d4af37]/80 shadow-inner bg-black">
        <img src={imgSrc} alt={id} className="w-full h-full object-cover scale-[1.02]" />
        {/* Subtle inner shadow overlay */}
        <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] pointer-events-none" />
      </div>
    </div>
  );
}

