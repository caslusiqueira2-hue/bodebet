import { formatMultiplier, multiplierTone } from '@/lib/aviator-engine';
import { cn } from '@/lib/utils';
import { History } from 'lucide-react';

export function HistoryBar({ history }: { history: number[] }) {
  // Use a sleek premium layout for the history
  return (
    <div className="flex items-center gap-3 bg-[#0a0204]/90 border border-[#d4af37]/20 rounded-full px-3 py-1.5 w-full max-w-full overflow-hidden shadow-inner">
      <div className="flex items-center gap-1.5 shrink-0 bg-black/40 px-2 py-1 rounded-full border border-white/5">
        <History className="w-3 h-3 text-[#d4af37]" />
        <span className="text-[9px] font-black tracking-[0.2em] text-[#d4af37] uppercase">
          Histórico
        </span>
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar flex-1 mask-linear-fade">
        {history.map((value, index) => {
          const isHigh = value >= 2.0;
          const isVeryHigh = value >= 10.0;
          return (
            <div
              key={value + '-' + index}
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums transition-colors',
                isVeryHigh 
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : isHigh 
                    ? 'bg-[#d4af37]/20 text-[#ffdf70] border border-[#d4af37]/40 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                    : 'bg-black text-white/50 border border-white/5'
              )}
            >
              {formatMultiplier(value)}
            </div>
          );
        })}
        {history.length === 0 && (
          <span className="text-xs text-white/30 italic font-bold px-2">Sem rodadas recentes</span>
        )}
      </div>
    </div>
  );
}

