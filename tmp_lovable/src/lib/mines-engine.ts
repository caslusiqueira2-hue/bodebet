/**
 * Motor do Mines.
 *
 * O tabuleiro tem 25 casas e um número configurável de minas. A cada gema
 * revelada o prêmio potencial sobe, e o jogador pode sacar quando quiser.
 *
 * O multiplicador vem direto da probabilidade de sobreviver a `n` cliques
 * num tabuleiro com `m` minas:
 *
 *     P(sobreviver n cliques) = C(25 - m, n) / C(25, n)
 *     multiplicador(n)        = RTP / P
 *
 * Como o multiplicador é o inverso exato da probabilidade multiplicado pelo
 * RTP, o retorno esperado é o mesmo em qualquer quantidade de minas ou de
 * cliques — exatamente como nos Mines "originais" de cassino.
 */

export const TOTAL_TILES = 25
export const GRID_SIZE = 5

/** 1% de vantagem da casa: o mesmo RTP anunciado na vitrine do jogo. */
export const RTP = 0.99

export const mineOptions = [1, 3, 5, 10, 24] as const

export const betOptions = [1, 2, 5, 10, 25, 50] as const

export type TileState = 'oculta' | 'gema' | 'mina'

export type RoundStatus = 'aposta' | 'jogando' | 'explodiu' | 'sacou'

export type RoundRecord = {
  id: string
  bet: number
  mines: number
  picks: number
  multiplier: number
  payout: number
  outcome: 'sacou' | 'explodiu'
}

/** Coeficiente binomial C(n, k) — n é pequeno (≤25), então o laço basta. */
function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  let result = 1
  for (let i = 0; i < k; i += 1) {
    result = (result * (n - i)) / (i + 1)
  }
  return result
}

/**
 * Multiplicador acumulado após revelar `picks` gemas num tabuleiro com
 * `mines` minas. Com `picks` igual a zero devolve 1 (nada apostado ainda).
 */
export function multiplierFor(mines: number, picks: number): number {
  if (picks <= 0) return 1

  const safeTiles = TOTAL_TILES - mines
  if (picks > safeTiles) return 0

  const survival = binomial(safeTiles, picks) / binomial(TOTAL_TILES, picks)
  return RTP / survival
}

/** Probabilidade de a próxima casa clicada ser segura, em porcentagem. */
export function nextTileSafeChance(mines: number, picks: number): number {
  const remaining = TOTAL_TILES - picks
  const safeRemaining = remaining - mines
  if (remaining <= 0) return 0
  return (safeRemaining / remaining) * 100
}

/** Sorteia as posições das minas com Fisher-Yates parcial. */
export function drawMinePositions(mines: number): number[] {
  const indexes = Array.from({ length: TOTAL_TILES }, (_, i) => i)

  for (let i = 0; i < mines; i += 1) {
    const j = i + Math.floor(Math.random() * (TOTAL_TILES - i))
    ;[indexes[i], indexes[j]] = [indexes[j], indexes[i]]
  }

  return indexes.slice(0, mines)
}

export const formatMultiplier = (value: number) => `${value.toFixed(2)}x`
