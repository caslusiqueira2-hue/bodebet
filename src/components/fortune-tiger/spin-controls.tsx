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
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#1a0a0f] to-[#0a0204] p-6 shadow-[0_15px_30px_rgba(0,0,0,0.8)] border border-t-[#3a1520] border-x-[#250d15] border-b-black relative overflow-hidden">
      {/* Decorative BG Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-t from-red-600/20 to-transparent blur-2xl pointer-events-none" />

      <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
        {/* Balance Panel */}
        <div className="col-span-1 flex flex-col items-center justify-center p-3 rounded-xl bg-black/60 border border-white/5 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]/70 mb-1">Saldo</span>
          <span className="font-black text-sm md:text-base text-white tabular-nums">{formatBRL(balance)}</span>
        </div>

        {/* Win Panel Placeholder */}
        <div className="col-span-1 flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/20 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500/80 mb-1">Prêmio</span>
          <span className="font-black text-sm md:text-base text-yellow-400 tabular-nums">--</span>
        </div>

        {/* Auto / Turbo Toggles */}
        <div className="col-span-1 flex flex-col gap-2 justify-center">
          <button 
            onClick={() => onToggleTurbo(!turbo)}
            className={cn("flex-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase rounded-lg border transition-all",
              turbo ? "bg-red-900/40 border-red-500 text-red-400" : "bg-black/40 border-white/10 text-white/50 hover:bg-white/5"
            )}
          >
            <Zap className="w-3 h-3" /> Turbo
          </button>
          <button 
            onClick={() => autoSpins > 0 ? onStopAuto() : onStartAuto(10)}
            className={cn("flex-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase rounded-lg border transition-all",
              autoSpins > 0 ? "bg-yellow-900/40 border-yellow-500 text-yellow-400" : "bg-black/40 border-white/10 text-white/50 hover:bg-white/5"
            )}
          >
            <RotateCcw className="w-3 h-3" /> {autoSpins > 0 ? autoSpins : 'Auto'}
          </button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between gap-4 relative z-10">
        
        <button 
          onClick={handleMinus} 
          disabled={isSpinning || betIndex === 0}
          className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-b from-[#2a1018] to-[#15050a] border-2 border-[#4a1c27] text-white hover:border-red-500 hover:text-red-400 disabled:opacity-50 transition-all active:scale-95 shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
        >
          <Minus className="w-6 h-6" />
        </button>

        <div className="relative flex-1 flex flex-col items-center">
          <span className="absolute -top-6 text-[10px] font-bold uppercase tracking-widest text-[#d4af37] mb-1">Aposta</span>
          
          <button 
            onClick={onSpin}
            disabled={isSpinning || insufficient}
            className="relative w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center group disabled:opacity-50 transition-transform active:scale-95"
          >
            {/* Spin Button Background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#ffd700] via-[#d4af37] to-[#8b6508] shadow-[0_0_30px_rgba(212,175,55,0.5)]" />
            
            {/* Inner Red Circle */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-b from-[#ff3333] via-[#cc0000] to-[#800000] shadow-[inset_0_5px_15px_rgba(0,0,0,0.6)]" />
            
            {/* Highlight Glow */}
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative flex flex-col items-center z-10">
              {autoSpins > 0 ? (
                <span className="font-black text-2xl text-white drop-shadow-md">{autoSpins}</span>
              ) : (
                <>
                  <Play className="w-10 h-10 text-white fill-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)] mb-1" />
                  <span className="text-[10px] font-black uppercase text-white/90 tracking-widest">Girar</span>
                </>
              )}
            </div>
          </button>
          
          <div className="absolute -bottom-6 font-black text-sm text-white tabular-nums drop-shadow-md">
            {formatBRL(bet)}
          </div>
        </div>

        <button 
          onClick={handlePlus} 
          disabled={isSpinning || betIndex === betOptions.length - 1}
          className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-b from-[#2a1018] to-[#15050a] border-2 border-[#4a1c27] text-white hover:border-red-500 hover:text-red-400 disabled:opacity-50 transition-all active:scale-95 shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
        >
          <Plus className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
}

