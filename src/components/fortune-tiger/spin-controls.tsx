import { Minus, Plus, Play, RotateCcw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/casino-data';
import { betOptions } from '@/lib/fortune-tiger-engine';

type SpinControlsProps = {
  bet: number;
  balance: number;
  isSpinning: boolean;
  autoSpins: number;
  turbo: boolean;
  onChangeBet: (value: number) => void;
  onSpin: () => void;
  onStartAuto: (count: number) => void;
  onStopAuto: () => void;
  onToggleTurbo: (value: boolean) => void;
  onReset: () => void;
}

export function SpinControls({
  bet,
  balance,
  isSpinning,
  autoSpins,
  turbo,
  onChangeBet,
  onSpin,
  onStartAuto,
  onStopAuto,
  onToggleTurbo,
}: SpinControlsProps) {
  const betIndex = betOptions.indexOf(bet);
  const insufficient = bet > balance;

  const handleMinus = () => {
    if (betIndex > 0) onChangeBet(betOptions[betIndex - 1]);
  };

  const handlePlus = () => {
    if (betIndex < betOptions.length - 1) onChangeBet(betOptions[betIndex + 1]);
  };

  return (
    <div className="w-full bg-[#150205] p-2 rounded-2xl relative overflow-hidden">
      
      {/* Top row: Balance and quick toggles */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex-1 flex flex-col items-start p-2 rounded-lg bg-black/60 border border-[#d4af37]/20 shadow-inner">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#d4af37]/70">Saldo</span>
          <span className="font-black text-sm text-white tabular-nums">{formatBRL(balance)}</span>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => onToggleTurbo(!turbo)}
            className={cn("px-3 py-2 flex items-center justify-center gap-1 text-[9px] font-bold uppercase rounded-lg border transition-all",
              turbo ? "bg-red-900/60 border-red-500 text-red-400" : "bg-black/40 border-[#d4af37]/20 text-[#d4af37]/70 hover:bg-white/5"
            )}
          >
            <Zap className="w-3 h-3" /> {turbo ? 'Turbo ON' : 'Turbo'}
          </button>
          <button 
            onClick={() => autoSpins > 0 ? onStopAuto() : onStartAuto(10)}
            className={cn("px-3 py-2 flex items-center justify-center gap-1 text-[9px] font-bold uppercase rounded-lg border transition-all",
              autoSpins > 0 ? "bg-yellow-900/60 border-yellow-500 text-yellow-400" : "bg-black/40 border-[#d4af37]/20 text-[#d4af37]/70 hover:bg-white/5"
            )}
          >
            <RotateCcw className="w-3 h-3" /> {autoSpins > 0 ? autoSpins : 'Auto'}
          </button>
        </div>
      </div>

      {/* Main interaction row */}
      <div className="flex items-center justify-between gap-2">
        
        {/* Bet Minus */}
        <button 
          onClick={handleMinus} 
          disabled={isSpinning || betIndex === 0}
          className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-b from-[#2a1018] to-[#15050a] border-2 border-[#d4af37]/40 text-[#d4af37] hover:border-[#ffdf70] hover:text-[#ffdf70] disabled:opacity-50 transition-all active:scale-95 shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
        >
          <Minus className="w-5 h-5" />
        </button>

        {/* Big Spin Button & Bet Display */}
        <div className="relative flex-1 flex flex-col items-center">
          <div className="absolute -top-3 text-[10px] font-black uppercase tracking-widest text-[#d4af37] bg-[#150205] px-2 z-20">Aposta</div>
          <div className="absolute -top-7 font-black text-sm text-white tabular-nums drop-shadow-md z-20">
            {formatBRL(bet)}
          </div>
          
          <button 
            onClick={onSpin}
            disabled={isSpinning || insufficient}
            className="relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center group disabled:opacity-50 transition-transform active:scale-95 mt-4"
          >
            {/* Spin Button Background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#ffdf70] via-[#d4af37] to-[#8a4400] shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
            
            {/* Inner Red Circle */}
            <div className="absolute inset-[3px] rounded-full bg-gradient-to-b from-[#ff3333] via-[#cc0000] to-[#660000] shadow-[inset_0_4px_15px_rgba(0,0,0,0.8)]" />
            
            {/* Highlight Glow */}
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative flex flex-col items-center z-10">
              {autoSpins > 0 ? (
                <span className="font-black text-3xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{autoSpins}</span>
              ) : (
                <>
                  <Play className="w-10 h-10 text-white fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ml-1" />
                  <span className="text-[9px] font-black uppercase text-[#ffdf70] tracking-[0.2em] mt-1">Girar</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Bet Plus */}
        <button 
          onClick={handlePlus} 
          disabled={isSpinning || betIndex === betOptions.length - 1}
          className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-b from-[#2a1018] to-[#15050a] border-2 border-[#d4af37]/40 text-[#d4af37] hover:border-[#ffdf70] hover:text-[#ffdf70] disabled:opacity-50 transition-all active:scale-95 shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
        >
          <Plus className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
}

