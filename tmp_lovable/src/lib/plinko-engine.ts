/**
 * Motor do Plinko.
 *
 * A bola cai por `rows` fileiras de pinos e em cada uma desvia para a
 * esquerda ou para a direita com 50% de chance. O slot final é a soma dos
 * desvios à direita — uma distribuição binomial, exatamente como no jogo
 * original. As tabelas abaixo seguem o padrão dos cassinos: risco baixo
 * paga pouco e com frequência, risco alto concentra tudo nas bordas.
 */

export type Risk = 'baixo' | 'medio' | 'alto'

export const riskOptions: { id: Risk; label: string }[] = [
  { id: 'baixo', label: 'Baixo' },
  { id: 'medio', label: 'Médio' },
  { id: 'alto', label: 'Alto' },
]

export const rowOptions = [8, 12, 16] as const

export type RowCount = (typeof rowOptions)[number]

const tables: Record<Risk, Record<RowCount, number[]>> = {
  baixo: {
    8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
  },
  medio: {
    8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
  },
  alto: {
    8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
    16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
  },
}

export function multipliersFor(risk: Risk, rows: RowCount) {
  return tables[risk][rows]
}

export type Drop = {
  /** Direção de cada fileira: 0 esquerda, 1 direita. */
  path: number[]
  slot: number
  multiplier: number
  payout: number
}

export function dropBall(
  risk: Risk,
  rows: RowCount,
  bet: number,
  random: () => number = Math.random,
): Drop {
  const path: number[] = Array.from({ length: rows }, () => (random() < 0.5 ? 0 : 1))
  const slot = path.reduce((sum, step) => sum + step, 0)
  const multiplier = multipliersFor(risk, rows)[slot]

  return { path, slot, multiplier, payout: bet * multiplier }
}

/** Cor do slot conforme a distância do centro — bordas mais quentes. */
export function slotTone(index: number, total: number) {
  const distance = Math.abs(index - (total - 1) / 2) / ((total - 1) / 2)
  if (distance > 0.82) return 'bg-destructive text-destructive-foreground'
  if (distance > 0.6) return 'bg-primary text-primary-foreground'
  if (distance > 0.35) return 'bg-accent text-accent-foreground'
  return 'bg-secondary text-muted-foreground'
}
