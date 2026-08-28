export type GameState = 'IDLE' | 'PLAYING' | 'WON' | 'LOST' | 'CASHED_OUT';

export interface Tile {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
}

export interface GameConfig {
  mines: number;
  bet: number;
}

export interface GameHistoryItem {
  id: string;
  timestamp: string;
  bet: number;
  mines: number;
  revealedSafeTiles: number;
  multiplier: number;
  result: GameState; // WON, LOST, CASHED_OUT
  payout: number;
  profit: number;
}

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  cashouts: number;
  maxMultiplier: number;
  maxPayout: number;
  totalProfit: number;
}
