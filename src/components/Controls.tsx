import type { GameState } from '../types/game';
import { formatCurrency } from '../utils/gameMath';

interface Props {
  gameState: GameState;
  bet: number;
  setBet: (val: number) => void;
  balance: number;
  minesCount: number;
  setMinesCount: (val: number) => void;
  startGame: () => void;
  cashOut: () => void;
  resetGame: () => void;
  potentialPayout: number;
}

export const Controls: React.FC<Props> = ({
  gameState,
  bet,
  setBet,
  balance,
  minesCount,
  setMinesCount,
  startGame,
  cashOut,
  resetGame,
  potentialPayout
}) => {
  const isPlaying = gameState === 'PLAYING';
  const isGameOver = gameState === 'WON' || gameState === 'LOST' || gameState === 'CASHED_OUT';

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setBet(val);
  };

  const adjustBet = (type: string) => {
    if (isPlaying) return;
    let newBet = bet;
    switch (type) {
      case '1/2': newBet = Math.max(0.1, bet / 2); break;
      case 'x2': newBet = bet * 2; break;
      case 'MAX': newBet = balance; break;
      case '+1': newBet = bet + 1; break;
      case '+5': newBet = bet + 5; break;
      case '+10': newBet = bet + 10; break;
    }
    if (newBet > balance) newBet = balance;
    setBet(Number(newBet.toFixed(2)));
  };

  const handleMinesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 24) setMinesCount(val);
  };

  return (
    <div className="bg-surface p-4 rounded-xl flex flex-col gap-6 border border-white/5">
      
      {/* Mines Control */}
      <div>
        <label className="text-sm text-textMuted font-semibold mb-2 block uppercase tracking-wider">Mines</label>
        <div className="flex bg-background rounded-lg border border-white/5 overflow-hidden">
          <button 
            disabled={isPlaying || minesCount <= 1}
            onClick={() => setMinesCount(Math.max(1, minesCount - 1))}
            className="px-4 py-3 bg-surfaceHover hover:bg-surface disabled:opacity-50 text-white font-bold transition-colors"
          >-</button>
          <input
            type="number"
            value={minesCount}
            onChange={handleMinesChange}
            disabled={isPlaying}
            className="flex-1 bg-transparent text-center text-white font-bold focus:outline-none"
            min={1}
            max={24}
          />
          <button 
            disabled={isPlaying || minesCount >= 24}
            onClick={() => setMinesCount(Math.min(24, minesCount + 1))}
            className="px-4 py-3 bg-surfaceHover hover:bg-surface disabled:opacity-50 text-white font-bold transition-colors"
          >+</button>
        </div>
      </div>

      {/* Bet Control */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm text-textMuted font-semibold uppercase tracking-wider">Bet</label>
        </div>
        
        <div className="flex bg-background rounded-lg border border-white/5 overflow-hidden mb-2">
          <span className="pl-4 py-3 text-textMuted flex items-center justify-center">R$</span>
          <input
            type="number"
            value={bet}
            onChange={handleBetChange}
            disabled={isPlaying}
            className="flex-1 bg-transparent px-2 text-white font-bold focus:outline-none w-full"
            min={0.10}
            step={0.10}
          />
          <button 
            disabled={isPlaying}
            onClick={() => adjustBet('1/2')}
            className="px-3 bg-surfaceHover hover:bg-surface disabled:opacity-50 text-sm font-semibold transition-colors"
          >1/2</button>
          <button 
            disabled={isPlaying}
            onClick={() => adjustBet('x2')}
            className="px-3 bg-surfaceHover hover:bg-surface disabled:opacity-50 text-sm font-semibold border-l border-white/5 transition-colors"
          >x2</button>
          <button 
            disabled={isPlaying}
            onClick={() => adjustBet('MAX')}
            className="px-3 bg-surfaceHover hover:bg-surface disabled:opacity-50 text-sm font-semibold border-l border-white/5 transition-colors text-primary"
          >MAX</button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
           <button disabled={isPlaying} onClick={() => adjustBet('+1')} className="py-2 bg-surfaceHover rounded-lg text-xs font-semibold hover:bg-surface disabled:opacity-50">+ 1</button>
           <button disabled={isPlaying} onClick={() => adjustBet('+5')} className="py-2 bg-surfaceHover rounded-lg text-xs font-semibold hover:bg-surface disabled:opacity-50">+ 5</button>
           <button disabled={isPlaying} onClick={() => adjustBet('+10')} className="py-2 bg-surfaceHover rounded-lg text-xs font-semibold hover:bg-surface disabled:opacity-50">+ 10</button>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => {
          if (isPlaying) cashOut();
          else if (isGameOver) resetGame();
          else startGame();
        }}
        disabled={(gameState === 'IDLE' && (bet < 0.1 || bet > balance || balance <= 0))}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 shadow-lg ${
          isPlaying 
            ? 'bg-safe hover:bg-yellow-400 text-black shadow-safe/20' 
            : isGameOver
              ? 'bg-primary hover:bg-primaryHover text-white shadow-primary/20'
              : 'bg-primary hover:bg-primaryHover text-white shadow-primary/20'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isPlaying ? (
          <div className="flex flex-col items-center leading-tight">
            <span>CASH OUT</span>
            <span className="text-sm font-black opacity-80">{formatCurrency(potentialPayout)}</span>
          </div>
        ) : isGameOver ? (
          'PLAY AGAIN'
        ) : (
          'PLAY'
        )}
      </button>

    </div>
  );
};
