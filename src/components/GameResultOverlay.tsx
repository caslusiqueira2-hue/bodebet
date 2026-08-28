import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '../types/game';
import { formatCurrency } from '../utils/gameMath';

interface Props {
  gameState: GameState;
  payout: number;
  multiplier: number;
}

export const GameResultOverlay: React.FC<Props> = ({ gameState, payout, multiplier }) => {
  const isVisible = gameState === 'WON' || gameState === 'LOST' || gameState === 'CASHED_OUT';
  
  if (!isVisible) return null;

  const isWin = gameState === 'WON' || gameState === 'CASHED_OUT';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      >
        <div className={`p-6 rounded-2xl shadow-2xl backdrop-blur-md border ${
          isWin ? 'bg-safe/90 border-yellow-300' : 'bg-danger/90 border-red-400'
        } text-center flex flex-col items-center justify-center min-w-[200px]`}>
          <span className="text-white font-black text-2xl uppercase tracking-widest drop-shadow-md">
            {gameState === 'WON' ? 'YOU WON!' : gameState === 'CASHED_OUT' ? 'CASHED OUT' : 'YOU LOST'}
          </span>
          {isWin && (
            <>
              <span className="text-4xl font-black text-white mt-2 drop-shadow-lg">{multiplier.toFixed(2)}x</span>
              <span className="text-lg font-bold text-white/90 mt-1">{formatCurrency(payout)}</span>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
