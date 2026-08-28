import type { GameHistoryItem, GameStats } from '../types/game';
import { formatCurrency } from '../utils/gameMath';
import { History, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  history: GameHistoryItem[];
  stats: GameStats;
}

export const StatsHistoryPanel: React.FC<Props> = ({ history, stats }) => {
  return (
    <div className="bg-surface p-4 rounded-xl border border-white/5 flex flex-col gap-6 w-full max-w-[400px]">
      
      <div>
        <div className="flex items-center gap-2 mb-4 text-white">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-bold uppercase tracking-wider">Statistics</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-background p-3 rounded-lg border border-white/5">
            <div className="text-textMuted text-xs">Total Games</div>
            <div className="font-bold text-white">{stats.totalGames}</div>
          </div>
          <div className="bg-background p-3 rounded-lg border border-white/5">
            <div className="text-textMuted text-xs">Win Rate</div>
            <div className="font-bold text-white">
              {stats.totalGames > 0 ? ((stats.wins + stats.cashouts) / stats.totalGames * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="bg-background p-3 rounded-lg border border-white/5">
            <div className="text-textMuted text-xs">Max Multiplier</div>
            <div className="font-bold text-safe">{stats.maxMultiplier.toFixed(2)}x</div>
          </div>
          <div className="bg-background p-3 rounded-lg border border-white/5">
            <div className="text-textMuted text-xs">Total Profit</div>
            <div className={clsx("font-bold", stats.totalProfit >= 0 ? "text-safe" : "text-danger")}>
              {formatCurrency(stats.totalProfit)}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4 text-white">
          <History className="w-5 h-5 text-primary" />
          <h2 className="font-bold uppercase tracking-wider">Recent Games</h2>
        </div>
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-textMuted text-sm text-center py-4">No games played yet.</div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="bg-background p-3 rounded-lg border border-white/5 flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-white font-bold">{item.multiplier.toFixed(2)}x</span>
                  <span className="text-textMuted text-xs">{item.mines} Mines</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={clsx(
                    "font-bold",
                    item.profit > 0 ? "text-safe" : "text-danger"
                  )}>
                    {item.profit > 0 ? '+' : ''}{formatCurrency(item.profit)}
                  </span>
                  <span className="text-textMuted text-[10px]">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
