import { motion } from 'framer-motion';
import { Star, Bomb } from 'lucide-react';
import type { Tile } from '../types/game';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Props {
  tile: Tile;
  onClick: (id: number) => void;
  disabled: boolean;
}

export const GameTile: React.FC<Props> = ({ tile, onClick, disabled }) => {
  const isSafeRevealed = tile.isRevealed && !tile.isMine;
  const isMineRevealed = tile.isRevealed && tile.isMine;

  return (
    <motion.button
      whileHover={!tile.isRevealed && !disabled ? { scale: 1.05 } : {}}
      whileTap={!tile.isRevealed && !disabled ? { scale: 0.95 } : {}}
      onClick={() => onClick(tile.id)}
      disabled={disabled || tile.isRevealed}
      className={twMerge(
        clsx(
          "relative w-full aspect-square rounded-xl flex items-center justify-center transition-colors duration-200 shadow-sm border",
          {
            "bg-surface border-primary/20 hover:bg-surfaceHover cursor-pointer shadow-[0_0_10px_rgba(66,129,255,0.1)]": !tile.isRevealed,
            "bg-safe border-safe/50 shadow-[0_0_15px_rgba(255,159,28,0.3)] cursor-default": isSafeRevealed,
            "bg-danger border-danger/50 shadow-[0_0_20px_rgba(242,60,80,0.4)] cursor-default": isMineRevealed,
            "opacity-80": disabled && !tile.isRevealed,
          }
        )
      )}
    >
      {isSafeRevealed && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Star className="w-8 h-8 text-white fill-white" />
        </motion.div>
      )}

      {isMineRevealed && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Bomb className="w-8 h-8 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
};
