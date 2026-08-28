import { GameTile } from './GameTile';
import type { Tile, GameState } from '../types/game';

interface Props {
  tiles: Tile[];
  gameState: GameState;
  onTileClick: (id: number) => void;
}

export const GameBoard: React.FC<Props> = ({ tiles, gameState, onTileClick }) => {
  // If no tiles (IDLE state), we show a mock grid of 25 empty tiles
  const displayTiles = tiles.length > 0 
    ? tiles 
    : Array(25).fill(null).map((_, i) => ({ id: i, isMine: false, isRevealed: false }));

  return (
    <div className="bg-surface/50 p-4 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm max-w-[500px] mx-auto w-full">
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {displayTiles.map(tile => (
          <GameTile
            key={tile.id}
            tile={tile}
            onClick={onTileClick}
            disabled={gameState !== 'PLAYING' && gameState !== 'IDLE'}
          />
        ))}
      </div>
    </div>
  );
};
