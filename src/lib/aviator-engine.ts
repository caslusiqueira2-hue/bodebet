/**
 * Motor matemático do Aviator.
 * Tudo aqui é puro (sem React) para facilitar teste e reuso.
 */

/** Base de crescimento por segundo: ~1.97x em 6s, ~3.1x em 10s. */
const GROWTH_BASE = 1.12

/** Vantagem da casa de 1% (igual ao modelo clássico de crash). */
const HOUSE_EDGE = 0.99

export const BETTING_MS = 6000
export const CRASHED_MS = 3500
export const MAX_MULTIPLIER = 1000

/** Multiplicador em um dado instante do voo. */
export function multiplierAt(seconds: number) {
  return Math.pow(GROWTH_BASE, Math.max(0, seconds))
}

/** Sorteia onde o avião vai explodir. 1% das rodadas quebram em 1.00x. */
export function randomCrashPoint() {
  const r = Math.random()
  if (r < 0.01) return 1
  const raw = HOUSE_EDGE / (1 - r)
  return Math.min(MAX_MULTIPLIER, Math.max(1, Math.floor(raw * 100) / 100))
}

export function formatMultiplier(value: number) {
  return `${value.toFixed(2)}x`
}

/** Cor do histórico por faixa de multiplicador. */
export function multiplierTone(value: number) {
  if (value < 2) return 'text-muted-foreground'
  if (value < 10) return 'text-primary'
  return 'text-accent'
}

/**
 * Geometria da curva. x e y são normalizados em [0,1] e crescem de forma
 * assintótica, então o traçado nunca sai da área visível.
 */
export function curveProgress(seconds: number) {
  const x = 1 - 1 / (1 + seconds / 6)
  const y = 1 - 1 / multiplierAt(seconds)
  return { x: Math.min(x / 0.9, 1), y: Math.min(y / 0.92, 1) }
}

/** Instante em que o multiplicador atinge determinado valor. */
export function secondsFor(multiplier: number) {
  return Math.log(Math.max(1, multiplier)) / Math.log(GROWTH_BASE)
}

const PLAYER_NAMES = [
  'lu***23',
  'mar***os',
  'pe***dro',
  'ana***91',
  'jo***ao',
  'ka***ol',
  'ti***go',
  'be***ta',
  'ra***fa',
  'gu***me',
  'vi***tor',
  'sa***ra',
]

export type LiveBet = {
  id: string
  player: string
  amount: number
  target: number
  cashedAt: number | null
}

/** Gera a lista de apostadores simulados de uma rodada. */
export function createLiveBets(): LiveBet[] {
  const count = 6 + Math.floor(Math.random() * 5)
  const shuffled = [...PLAYER_NAMES].sort(() => Math.random() - 0.5)

  return shuffled.slice(0, count).map((player, index) => ({
    id: `${Date.now()}-${index}`,
    player,
    amount: Math.round((5 + Math.random() * 495) * 100) / 100,
    target: Math.round((1.15 + Math.random() * 6) * 100) / 100,
    cashedAt: null,
  }))
}
