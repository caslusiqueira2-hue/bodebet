/**
 * Motor do Fortune Tiger: grade 3x3, 5 linhas de pagamento
 * (3 horizontais + 2 diagonais) e o tigre como símbolo curinga.
 *
 * Simulação de 5 milhões de giros com os pesos e prêmios abaixo:
 * RTP de 96,58% e frequência de acerto de 32,87%.
 */

export type SymbolId = 'tiger' | 'ingot' | 'firecracker' | 'drum' | 'orange' | 'coin'

export type SlotSymbol = {
  id: SymbolId
  name: string
  image: string
  /** Peso relativo no sorteio de cada célula. */
  weight: number
  /** Prêmio por linha, como multiplicador da aposta total. */
  payout: number
  /** Curinga: substitui qualquer outro símbolo. */
  wild?: boolean
}

export const symbols: SlotSymbol[] = [
  {
    id: 'tiger',
    name: 'Tigre da Fortuna',
    image: '/fortune-tiger/symbol-tiger.png',
    weight: 3,
    payout: 160,
    wild: true,
  },
  {
    id: 'ingot',
    name: 'Lingote de ouro',
    image: '/fortune-tiger/symbol-ingot.png',
    weight: 7,
    payout: 27,
  },
  {
    id: 'firecracker',
    name: 'Fogos de artifício',
    image: '/fortune-tiger/symbol-firecracker.png',
    weight: 14,
    payout: 8,
  },
  {
    id: 'drum',
    name: 'Tambor',
    image: '/fortune-tiger/symbol-drum.png',
    weight: 20,
    payout: 3,
  },
  {
    id: 'orange',
    name: 'Laranja',
    image: '/fortune-tiger/symbol-orange.png',
    weight: 26,
    payout: 2,
  },
  {
    id: 'coin',
    name: 'Moeda da sorte',
    image: '/fortune-tiger/symbol-coin.png',
    weight: 30,
    payout: 1,
  },
]

export const symbolsById = Object.fromEntries(symbols.map((s) => [s.id, s])) as Record<
  SymbolId,
  SlotSymbol
>

/** Índices da grade lidos como [coluna * 3 + linha]. */
export const paylines: [number, number, number][] = [
  [0, 3, 6], // linha de cima
  [1, 4, 7], // linha do meio
  [2, 5, 8], // linha de baixo
  [0, 4, 8], // diagonal descendente
  [2, 4, 6], // diagonal ascendente
]

export const paylineNames = [
  'Linha superior',
  'Linha central',
  'Linha inferior',
  'Diagonal descendente',
  'Diagonal ascendente',
]

export const REEL_COUNT = 3
export const ROW_COUNT = 3
export const GRID_SIZE = REEL_COUNT * ROW_COUNT

/** Chance de ganhar um giro extra depois de um giro sem prêmio. */
export const RESPIN_CHANCE = 0.02

const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0)

export function randomSymbol(random: () => number = Math.random): SymbolId {
  let ticket = random() * totalWeight
  for (const symbol of symbols) {
    ticket -= symbol.weight
    if (ticket <= 0) return symbol.id
  }
  return symbols[symbols.length - 1].id
}

export function randomGrid(random: () => number = Math.random): SymbolId[] {
  return Array.from({ length: GRID_SIZE }, () => randomSymbol(random))
}

export type LineWin = {
  line: number
  symbol: SymbolId
  cells: [number, number, number]
  /** Prêmio em dinheiro desta linha. */
  amount: number
}

export type SpinResult = {
  grid: SymbolId[]
  wins: LineWin[]
  /** Soma dos prêmios de todas as linhas. */
  total: number
  /** Multiplicador total do giro em relação à aposta. */
  multiplier: number
  respin: boolean
}

/**
 * Resolve qual símbolo uma linha formou. O curinga substitui qualquer
 * símbolo, então uma linha só falha quando sobram dois símbolos pagos
 * diferentes entre si.
 */
function resolveLine(cells: SymbolId[]): SymbolId | null {
  let paid: SymbolId | null = null

  for (const cell of cells) {
    if (symbolsById[cell].wild) continue
    if (paid === null) paid = cell
    else if (paid !== cell) return null
  }

  // Três curingas pagam o prêmio máximo do tigre.
  return paid ?? 'tiger'
}

export function evaluateGrid(grid: SymbolId[], bet: number) {
  const wins: LineWin[] = []

  paylines.forEach((cells, line) => {
    const symbol = resolveLine(cells.map((index) => grid[index]))
    if (!symbol) return

    wins.push({
      line,
      symbol,
      cells,
      amount: bet * symbolsById[symbol].payout,
    })
  })

  const total = wins.reduce((sum, win) => sum + win.amount, 0)
  return { wins, total }
}

export function spin(bet: number, random: () => number = Math.random): SpinResult {
  const grid = randomGrid(random)
  const { wins, total } = evaluateGrid(grid, bet)

  return {
    grid,
    wins,
    total,
    multiplier: bet > 0 ? total / bet : 0,
    respin: total === 0 && random() < RESPIN_CHANCE,
  }
}

/** Faixas usadas para escolher a celebração exibida ao jogador. */
export function winTier(multiplier: number) {
  if (multiplier >= 50) return 'mega' as const
  if (multiplier >= 10) return 'grande' as const
  if (multiplier > 0) return 'normal' as const
  return null
}

export const betOptions = [1, 2, 5, 10, 25, 50]
