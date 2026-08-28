import { useState } from 'react';
import { Minus, Plus, ShieldCheck } from 'lucide-react';
import { formatBRL } from '@/lib/casino-data';
import { cn } from '@/lib/utils';
import type { ActiveBet, Phase } from './use-aviator';

const QUICK_AMOUNTS = [5, 10, 50, 100];

export function BetPanel({
  phase,
  multiplier,
  balance,
  bet,
  queuedBet,
  autoCashout,
  onAutoCashoutChange,
  onPlaceBet,
  onCancelBet,
  onCashOut,
  notice,
}: {
  phase: Phase;
  multiplier: number;
  balance: number;
  bet: ActiveBet | null;
  queuedBet: number | null;
  autoCashout: string;
  onAutoCashoutChange: (value: string) => void;
  onPlaceBet: (amount: number) => void;
  onCancelBet: () => void;
  onCashOut: () => void;
  notice: string | null;
}) {
  const [amount, setAmount] = useState(10);
  const isValid = amount > 0;

  const canCashOut = phase === 'flying' && bet !== null && bet.cashedAt === null;
  const hasPendingBet = queuedBet !== null || (phase === 'betting' && bet !== null);

  const potential = bet ? bet.amount * multiplier : 0;

  const handleMinus = () => setAmount(prev => Math.max(1, prev - 5));
  const handlePlus = () => setAmount(prev => prev + 5);

  return (
    <div className="w-full bg-gradient-to-b from-[#1a0a0f] to-[#0a0204] rounded-[2rem] p-4 sm:p-6 border-2 border-[#d4af37]/30 shadow-[0_15px_30px_rgba(0,0,0,0.8),inset_0_5px_15px_rgba(255,255,255,0.05)] flex flex-col gap-4 relative overflow-hidden">
      
      {/* Decorative Cockpit Lines */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* BALANCE */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 rounded-xl border border-white/5 shadow-inner">
        <span className="text-[10px] font-black tracking-[0.2em] text-[#d4af37]/70 uppercase">Saldo</span>
        <span className="font-black text-lg text-white tabular-nums">{formatBRL(balance)}</span>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
        
        {/* Value Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-black/80 rounded-2xl border border-white/10 p-2 shadow-inner">
            <button 
              onClick={handleMinus} 
              disabled={hasPendingBet || canCashOut}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#2a1018] text-[#d4af37] hover:bg-[#3a1520] hover:text-white disabled:opacity-50 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase font-bold text-white/50 tracking-widest">Valor</span>
              <span className="font-black text-2xl text-white tabular-nums">R$ {amount.toFixed(2)}</span>
            </div>
            <button 
              onClick={handlePlus} 
              disabled={hasPendingBet || canCashOut}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#2a1018] text-[#d4af37] hover:bg-[#3a1520] hover:text-white disabled:opacity-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {QUICK_AMOUNTS.map(val => (
              <button 
                key={val} 
                onClick={() => setAmount(val)}
                disabled={hasPendingBet || canCashOut}
                className="py-2 bg-black/40 rounded-lg border border-white/5 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50 transition-colors"
              >
                +{val}
              </button>
            ))}
          </div>

          {/* Auto Cashout */}
          <div className="flex items-center justify-between px-3 py-2 bg-black/40 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Auto Saque</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                value={autoCashout}
                onChange={(e) => onAutoCashoutChange(e.target.value)}
                disabled={hasPendingBet || canCashOut}
                className="w-16 bg-black border border-white/10 rounded px-2 py-1 text-sm font-bold text-center text-white outline-none focus:border-[#d4af37]"
                placeholder="Off"
              />
              <span className="text-xs font-bold text-[#d4af37]">x</span>
            </div>
          </div>
        </div>

        {/* MAIN BUTTON (APOSTAR / SACAR) */}
        <div className="flex flex-col">
          {canCashOut ? (
            <button
              onClick={onCashOut}
              className="flex-1 w-full sm:w-40 rounded-2xl flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#ffaa00] via-[#ff6600] to-[#cc3300] border-2 border-[#ffdf70] text-white shadow-[0_10px_30px_rgba(255,100,0,0.6),inset_0_5px_15px_rgba(255,255,255,0.4)] hover:brightness-110 active:scale-95 transition-all group animate-pulse"
            >
              <span className="text-sm font-black uppercase tracking-[0.2em] drop-shadow-md mb-1">Sacar</span>
              <span className="text-2xl font-black tabular-nums drop-shadow-lg">
                {formatBRL(potential)}
              </span>
            </button>
          ) : hasPendingBet ? (
            <button
              onClick={onCancelBet}
              className="flex-1 w-full sm:w-40 rounded-2xl flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#800000] to-[#4d0000] border-2 border-red-500/50 text-white shadow-[0_5px_15px_rgba(255,0,0,0.3)] hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="text-sm font-black uppercase tracking-[0.2em] mb-1 text-red-300">Cancelar</span>
              <span className="text-lg font-bold text-red-200">Aguardando</span>
            </button>
          ) : (
            <button
              onClick={() => onPlaceBet(amount)}
              disabled={!isValid || amount > balance || phase === 'flying'}
              className="flex-1 w-full sm:w-40 rounded-2xl flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#00cc44] via-[#009933] to-[#006622] border-2 border-[#66ff99] text-white shadow-[0_10px_30px_rgba(0,200,50,0.4),inset_0_5px_15px_rgba(255,255,255,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
            >
              <span className="text-xl font-black uppercase tracking-[0.2em] drop-shadow-md">Apostar</span>
              <span className="text-xs font-bold text-green-100 mt-1">R$ {amount.toFixed(2)}</span>
            </button>
          )}
        </div>

      </div>

      {notice && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-1 rounded-full border border-white/20 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-bottom-4">
          {notice}
        </div>
      )}
    </div>
  );
}

