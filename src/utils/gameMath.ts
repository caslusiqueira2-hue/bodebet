import type { Tile } from '../types/game';

// Fisher-Yates shuffle
function shuffle(array: any[]) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export function generateMines(totalTiles: number, mineCount: number): Tile[] {
  const tiles: Tile[] = Array(totalTiles).fill(null).map((_, index) => ({
    id: index,
    isMine: index < mineCount,
    isRevealed: false
  }));
  
  return shuffle(tiles);
}

// Calculate the multiplier based on probability
// House edge = 1%
export function calculateMultiplier(totalTiles: number, minesCount: number, safeRevealed: number, houseEdge: number = 0.01): number {
  if (safeRevealed === 0) return 1.0;
  
  let probability = 1;
  let remainingTiles = totalTiles;
  let remainingSafe = totalTiles - minesCount;

  for (let i = 0; i < safeRevealed; i++) {
    probability *= (remainingSafe / remainingTiles);
    remainingTiles--;
    remainingSafe--;
  }

  const multiplier = (1 - houseEdge) / probability;
  return Math.max(1, multiplier);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value).replace('$', 'R$ '); // Using R$ as per prompt examples
}
