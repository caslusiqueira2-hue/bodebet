export const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatMultiplier = (value: number) => `${value.toFixed(2)}x`

/** Compacta multiplicadores altos das tabelas de prêmio: 1000x vira 1.0k. */
export const formatMultiplierShort = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value >= 10 ? `${Math.round(value)}x` : `${value.toFixed(2)}x`
