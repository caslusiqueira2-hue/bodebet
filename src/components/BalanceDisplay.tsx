import { formatCurrency } from '../utils/gameMath';
import { Wallet, Plus } from 'lucide-react';

interface Props {
  balance: number;
  onDepositClick: () => void;
}

export function BalanceDisplay({ balance, onDepositClick }: Props) {
  return (
    <div className="flex items-center">
      <a 
        href="/carteira"
        title="Ver Carteira"
        className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg rounded-r-none border border-white/15 border-r-0 h-11 transition-colors cursor-pointer"
      >
        <Wallet className="w-5 h-5 text-primary" />
        <span className="font-bold text-lg text-white tabular-nums">{formatCurrency(balance)}</span>
      </a>
      <button 
        type="button"
        onClick={onDepositClick}
        className="bg-safe hover:bg-yellow-400 text-black px-4 flex items-center justify-center rounded-lg rounded-l-none font-black text-xs uppercase tracking-wider transition-colors h-11 border border-safe shadow-md"
      >
        <Plus className="w-4 h-4 mr-1" />
        DEPOSITAR
      </button>
    </div>
  );
}
