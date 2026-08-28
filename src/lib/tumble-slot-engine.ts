/**
 * Motor compartilhado dos slots de "tumble" (pagamento por quantidade).
 *
 * Grade de 6 colunas x 5 linhas. Não existem linhas de pagamento: qualquer
 * 8 ou mais símbolos iguais em qualquer posição formam prêmio. Os símbolos
 * premiados somem, os de cima caem e novos entram pelo topo — as quedas
 * ("tumbles") continuam enquanto houver prêmio.
 *
 * Índices da grade: `coluna * ROWS + linha`, com a linha 0 no topo.
 */

export const COLS = 6
export const ROWS = 5
export const CELLS = COLS * ROWS

/** Quantidade mínima de símbolos iguais para pagar. */
export const MIN_CLUSTER = 8

export type TumbleSymbol = {
  id: string
  name: string
  /** Chave do ícone no mapa de símbolos. */
  icon: string
  /** Gradiente Tailwind aplicado ao ladrilho. */
  tone: string
  weight: number
  /** Prêmio (x aposta) por faixa: 8-9, 10-11 e 12+ símbolos. */
  pays: [number, number, number]
}

export type TumbleConfig = {
  id: string
  symbols: TumbleSymbol[]
  scatter: {
    id: string
    name: string
    icon: string
    tone: string
    weight: number
    /** Prêmio (x aposta) com 4, 5 e 6+ scatters. */
    pays: [number, number, number]
    freeSpins: number
  }
  /** Orbes de multiplicador que caem durante as quedas (Olympus). */
  multipliers?: {
    chance: number
    values: number[]
  }
}

export type TumbleWin = {
  symbol: string
  count: number
  amount: number
  cells: number[]
}

export type TumbleStep = {
  /** Grade exibida antes de remover os símbolos premiados. */
  grid: string[]
  wins: TumbleWin[]
  /** Prêmio somado das combinações deste passo. */
  amount: number
  /** Orbes de multiplicador visíveis, por índice da célula. */
  orbs: { cell: number; value: number }[]
}

export type TumbleResult = {
  steps: TumbleStep[]
  /** Grade final, já sem combinações. */
  finalGrid: string[]
  baseWin: number
  multiplier: number
  total: number
  scatters: number
  scatterPay: number
  freeSpins: number
}

function payFor(symbol: TumbleSymbol | TumbleConfig['scatter'], count: number, bet: number) {
  const tier = count >= 12 ? 2 : count >= 10 ? 1 : 0
  return bet * symbol.pays[tier]
}

function pickSymbol(config: TumbleConfig, random: () => number) {
  const pool = [...config.symbols, config.scatter]
  const total = pool.reduce((sum, symbol) => sum + symbol.weight, 0)
  let ticket = random() * total
  for (const symbol of pool) {
    ticket -= symbol.weight
    if (ticket <= 0) return symbol.id
  }
  return pool[pool.length - 1].id
}

export function randomTumbleGrid(config: TumbleConfig, random: () => number = Math.random) {
  return Array.from({ length: CELLS }, () => pickSymbol(config, random))
}

/** Agrupa os índices de cada símbolo presente na grade. */
function groupCells(grid: string[]) {
  const groups = new Map<string, number[]>()
  grid.forEach((id, index) => {
    const cells = groups.get(id)
    if (cells) cells.push(index)
    else groups.set(id, [index])
  })
  return groups
}

function evaluate(config: TumbleConfig, grid: string[], bet: number) {
  const groups = groupCells(grid)
  const wins: TumbleWin[] = []

  for (const symbol of config.symbols) {
    const cells = groups.get(symbol.id)
    if (!cells || cells.length < MIN_CLUSTER) continue
    wins.push({
      symbol: symbol.id,
      count: cells.length,
      amount: payFor(symbol, cells.length, bet),
      cells,
    })
  }

  return wins
}

/** Remove as células premiadas e deixa as de cima caírem em cada coluna. */
function collapse(config: TumbleConfig, grid: string[], removed: Set<number>, random: () => number) {
  const next = [...grid]

  for (let col = 0; col < COLS; col += 1) {
    const kept: string[] = []
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      const index = col * ROWS + row
      if (!removed.has(index)) kept.push(grid[index])
    }
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      const index = col * ROWS + row
      const fromBottom = ROWS - 1 - row
      next[index] = kept[fromBottom] ?? pickSymbol(config, random)
    }
  }

  return next
}

export function spinTumble(
  config: TumbleConfig,
  bet: number,
  random: () => number = Math.random,
): TumbleResult {
  let grid = randomTumbleGrid(config, random)
  const steps: TumbleStep[] = []
  const orbs: { cell: number; value: number }[] = []
  let baseWin = 0
  let guard = 0

  // Scatters do giro inicial: só a primeira grade conta.
  const scatters = grid.filter((id) => id === config.scatter.id).length
  const scatterPay =
    scatters >= 4 ? payFor(config.scatter, scatters === 4 ? 8 : scatters === 5 ? 10 : 12, bet) : 0

  while (guard < 12) {
    guard += 1
    const wins = evaluate(config, grid, bet)
    if (wins.length === 0) {
      steps.push({ grid, wins: [], amount: 0, orbs: [...orbs] })
      break
    }

    const amount = wins.reduce((sum, win) => sum + win.amount, 0)
    baseWin += amount

    if (config.multipliers && random() < config.multipliers.chance) {
      const values = config.multipliers.values
      orbs.push({
        cell: Math.floor(random() * CELLS),
        value: values[Math.floor(random() * values.length)],
      })
    }

    steps.push({ grid, wins, amount, orbs: [...orbs] })

    const removed = new Set(wins.flatMap((win) => win.cells))
    grid = collapse(config, grid, removed, random)
  }

  const multiplier = orbs.reduce((sum, orb) => sum + orb.value, 0) || 1
  const total = baseWin * multiplier + scatterPay

  return {
    steps,
    finalGrid: grid,
    baseWin,
    multiplier,
    total,
    scatters,
    scatterPay,
    freeSpins: scatters >= 4 ? config.scatter.freeSpins : 0,
  }
}

export function symbolLookup(config: TumbleConfig) {
  const all = [...config.symbols, config.scatter]
  return Object.fromEntries(all.map((symbol) => [symbol.id, symbol])) as Record<
    string,
    TumbleSymbol | TumbleConfig['scatter']
  >
}

/** Gates of Olympus: Zeus, orbes de multiplicador e joias. */
export const olympusConfig: TumbleConfig = {
  id: 'gates-of-olympus',
  symbols: [
    { id: 'crown', name: 'Coroa', icon: 'crown', tone: 'from-amber-400/25 to-amber-700/10', weight: 5, pays: [10, 25, 50] },
    { id: 'hourglass', name: 'Ampulheta', icon: 'hourglass', tone: 'from-rose-400/25 to-rose-700/10', weight: 6, pays: [8, 20, 40] },
    { id: 'ring', name: 'Anel', icon: 'ring', tone: 'from-yellow-300/25 to-yellow-600/10', weight: 7, pays: [6, 12, 25] },
    { id: 'chalice', name: 'Cálice', icon: 'chalice', tone: 'from-orange-400/25 to-orange-700/10', weight: 8, pays: [4, 8, 15] },
    { id: 'gem-red', name: 'Rubi', icon: 'gem-red', tone: 'from-red-500/25 to-red-800/10', weight: 12, pays: [1.5, 3, 6] },
    { id: 'gem-purple', name: 'Ametista', icon: 'gem-purple', tone: 'from-purple-500/25 to-purple-800/10', weight: 13, pays: [1.2, 2.4, 5] },
    { id: 'gem-green', name: 'Esmeralda', icon: 'gem-green', tone: 'from-emerald-500/25 to-emerald-800/10', weight: 14, pays: [1, 2, 4] },
    { id: 'gem-blue', name: 'Safira', icon: 'gem-blue', tone: 'from-sky-500/25 to-sky-800/10', weight: 15, pays: [0.8, 1.6, 3.2] },
  ],
  scatter: {
    id: 'zeus',
    name: 'Zeus',
    icon: 'zeus',
    tone: 'from-yellow-200/30 to-amber-600/10',
    weight: 2,
    pays: [3, 5, 100],
    freeSpins: 5,
  },
  multipliers: { chance: 0.28, values: [2, 3, 5, 10, 25, 50, 100] },
}

/** Sweet Candy: doces, pirulitos e a paleta scatter. */
export const sweetCandyConfig: TumbleConfig = {
  id: 'sweet-candy',
  symbols: [
    { id: 'heart', name: 'Coração vermelho', icon: 'heart', tone: 'from-red-400/25 to-red-700/10', weight: 6, pays: [10, 20, 40] },
    { id: 'candy', name: 'Bala', icon: 'candy', tone: 'from-pink-400/25 to-pink-700/10', weight: 7, pays: [7, 15, 30] },
    { id: 'lolly', name: 'Pirulito', icon: 'lolly', tone: 'from-fuchsia-400/25 to-fuchsia-700/10', weight: 8, pays: [5, 10, 20] },
    { id: 'cake', name: 'Bolinho', icon: 'cake', tone: 'from-amber-300/25 to-amber-600/10', weight: 9, pays: [3, 6, 12] },
    { id: 'grape', name: 'Uva', icon: 'grape', tone: 'from-violet-400/25 to-violet-700/10', weight: 12, pays: [1.5, 3, 6] },
    { id: 'watermelon', name: 'Melancia', icon: 'watermelon', tone: 'from-green-400/25 to-green-700/10', weight: 13, pays: [1.2, 2.4, 5] },
    { id: 'plum', name: 'Ameixa', icon: 'plum', tone: 'from-blue-400/25 to-blue-700/10', weight: 14, pays: [1, 2, 4] },
    { id: 'banana', name: 'Banana', icon: 'banana', tone: 'from-yellow-300/25 to-yellow-600/10', weight: 15, pays: [0.8, 1.6, 3.2] },
  ],
  scatter: {
    id: 'bomb',
    name: 'Pirulito arco-íris',
    icon: 'rainbow',
    tone: 'from-teal-300/30 to-cyan-600/10',
    weight: 2,
    pays: [3, 5, 100],
    freeSpins: 10,
  },
}
