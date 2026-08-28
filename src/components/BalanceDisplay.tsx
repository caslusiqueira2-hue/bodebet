import { formatCurrency } from '../utils/gameMath';
import { Wallet, Plus } from 'lucide-react';

interface Props {
  balance: number;
  onDepositClick: () => void;
}

export function BalanceDisplay({ balance, onDepositClick }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-surfaceHover px-4 py-2 rounded-lg rounded-r-none border border-white/5 border-r-0 h-11">
        <Wallet className="w-5 h-5 text-primary" />
        <span className="font-bold text-lg text-white">{formatCurrency(balance)}</span>
      </div>
      <button 
        onClick={onDepositClick}
        className="bg-safe hover:bg-yellow-500 text-black px-4 flex items-center justify-center rounded-lg rounded-l-none font-bold text-sm transition-colors h-11 border border-safe"
      >
        <Plus className="w-5 h-5 mr-1" />
        DEPOSITAR
      </button>
    </div>
  );
}
