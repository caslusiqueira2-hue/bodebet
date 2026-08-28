/** Motor do Penalty Lucky: o jogador escolhe o canto e o goleiro tenta defender. */

export type PenaltyZoneId =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

export type PenaltyZone = {
  id: PenaltyZoneId
  label: string
  /** Multiplicador pago quando a bola entra. */
  multiplier: number
  /** Probabilidade de o goleiro defender a cobrança nesse canto. */
  saveChance: number
  /** Probabilidade de a bola sair ou bater na trave. */
  missChance: number
  /** Posição relativa dentro do gol (0-100). */
  x: number
  y: number
}

export const penaltyZones: PenaltyZone[] = [
  {
    id: 'top-left',
    label: 'Ângulo esquerdo',
    multiplier: 1.76,
    saveChance: 0.1,
    missChance: 0.35,
    x: 16,
    y: 22,
  },
  {
    id: 'top-center',
    label: 'Meio alto',
    multiplier: 2.42,
    saveChance: 0.55,
    missChance: 0.05,
    x: 50,
    y: 18,
  },
  {
    id: 'top-right',
    label: 'Ângulo direito',
    multiplier: 1.76,
    saveChance: 0.1,
    missChance: 0.35,
    x: 84,
    y: 22,
  },
  {
    id: 'bottom-left',
    label: 'Rasteiro esquerdo',
    multiplier: 1.62,
    saveChance: 0.3,
    missChance: 0.1,
    x: 18,
    y: 68,
  },
  {
    id: 'bottom-right',
    label: 'Rasteiro direito',
    multiplier: 1.62,
    saveChance: 0.3,
    missChance: 0.1,
    x: 82,
    y: 68,
  },
]

export type PenaltyOutcome = 'goal' | 'save' | 'miss'

export type PenaltyResult = {
  zone: PenaltyZone
  outcome: PenaltyOutcome
  /** Canto para onde o goleiro pulou. */
  keeperZone: PenaltyZoneId
  multiplier: number
  payout: number
}

export function getZone(id: PenaltyZoneId): PenaltyZone {
  return penaltyZones.find((zone) => zone.id === id) ?? penaltyZones[0]
}

/** Sorteia o resultado de uma cobrança para o canto escolhido. */
export function shootPenalty(zoneId: PenaltyZoneId, bet: number): PenaltyResult {
  const zone = getZone(zoneId)
  const roll = Math.random()

  let outcome: PenaltyOutcome = 'goal'
  if (roll < zone.saveChance) outcome = 'save'
  else if (roll < zone.saveChance + zone.missChance) outcome = 'miss'

  const others = penaltyZones.filter((item) => item.id !== zoneId)
  const keeperZone =
    outcome === 'save' ? zone.id : others[Math.floor(Math.random() * others.length)].id

  const multiplier = outcome === 'goal' ? zone.multiplier : 0

  return {
    zone,
    outcome,
    keeperZone,
    multiplier,
    payout: Number((bet * multiplier).toFixed(2)),
  }
}

export const outcomeLabel: Record<PenaltyOutcome, string> = {
  goal: 'Gol!',
  save: 'Defendeu!',
  miss: 'Para fora!',
}
