import { useState } from 'react';
import { formatMultiplier } from '@/lib/aviator-engine';
import type { LiveBet } from '@/lib/aviator-engine';
import { formatBRL } from '@/lib/casino-data';
import { cn } from '@/lib/utils';
import type { RoundResult } from './use-aviator';
import { ChevronDown, Users, UserCircle2 } from 'lucide-react';

export function BetsBoard({ liveBets, myBets }: { liveBets: LiveBet[]; myBets: RoundResult[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const totalStake = liveBets.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#150205] border border-[#d4af37]/30 rounded-xl p-3 hover:bg-[#25050a] transition-colors shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#d4af37]" />
          <span className="text-xs font-black uppercase tracking-wider text-[#d4af37]">Apostas Ao Vivo</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white/50">{liveBets.length} Jogadores</span>
          <ChevronDown className={cn("w-4 h-4 text-[#d4af37] transition-transform", isOpen && "rotate-180")} />
        </div>
      </button>

      {isOpen && (
        <div className="mt-2 grid gap-2 lg:grid-cols-2 animate-in slide-in-from-top-2 fade-in">
          <section className="flex flex-col gap-2 rounded-xl bg-black/60 border border-white/5 p-3">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-[10px] font-black uppercase tracking-wider text-white/70">Rodada Atual</h2>
              <span className="text-[10px] text-[#d4af37] font-bold tabular-nums">
                Total: {formatBRL(totalStake)}
              </span>
            </div>

            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {liveBets.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_auto_4rem] items-center gap-3 py-1.5 px-2 bg-white/5 rounded-lg text-xs"
                >
                  <span className="flex items-center gap-2 font-medium text-white/90 truncate">
                    <UserCircle2 className="w-3 h-3 text-white/30" /> {item.user}
                  </span>
                  <span className="font-bold tabular-nums text-white">{formatBRL(item.amount)}</span>
                  <span
                    className={cn(
                      'text-right font-black tabular-nums',
                      item.cashout ? 'text-[#00cc44]' : 'text-white/30'
                    )}
                  >
                    {item.cashout ? formatMultiplier(item.cashout) : '-'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2 rounded-xl bg-black/60 border border-white/5 p-3">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-white/70 mb-2">
              Minhas Apostas
            </h2>
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {myBets.map((bet, index) => {
                const profit = bet.win ? bet.amount * bet.cashedMultiplier! : 0;
                return (
                  <div
                    key={index}
                    className={cn(
                      'grid grid-cols-[1fr_auto_4rem] items-center gap-3 py-1.5 px-2 rounded-lg text-xs border',
                      bet.win ? 'bg-[#00cc44]/10 border-[#00cc44]/20' : 'bg-red-900/10 border-red-500/20'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums text-white">{formatBRL(bet.amount)}</span>
                    </div>
                    <span
                      className={cn(
                        'font-black tabular-nums',
                        bet.win ? 'text-[#00cc44]' : 'text-red-400'
                      )}
                    >
                      {bet.win ? formatMultiplier(bet.cashedMultiplier!) : '0.00x'}
                    </span>
                    <span className={cn('text-right font-bold tabular-nums', bet.win ? 'text-[#00cc44]' : 'text-red-400')}>
                      {bet.win ? '+' + formatBRL(profit) : 'Perdeu'}
                    </span>
                  </div>
                );
              })}
              {myBets.length === 0 && (
                <div className="text-center text-xs text-white/30 py-4 font-bold italic">Nenhuma aposta ainda.</div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

