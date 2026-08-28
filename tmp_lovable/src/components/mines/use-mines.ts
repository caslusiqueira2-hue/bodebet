
import { useCallback, useMemo, useState } from 'react'
import {
  TOTAL_TILES,
  drawMinePositions,
  multiplierFor,
  nextTileSafeChance,
  type RoundRecord,
  type RoundStatus,
} from '@/lib/mines-engine'

const INITIAL_BALANCE = 1000

export function useMines() {
  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [bet, setBet] = useState(5)
  const [mines, setMines] = useState(3)
  const [status, setStatus] = useState<RoundStatus>('aposta')

  /** Posições sorteadas na rodada atual. Vazio enquanto ninguém apostou. */
  const [minePositions, setMinePositions] = useState<number[]>([])
  const [revealed, setRevealed] = useState<number[]>([])
  /** Casa que explodiu, para destacá-la em vermelho no fim da rodada. */
  const [hitTile, setHitTile] = useState<number | null>(null)
  const [history, setHistory] = useState<RoundRecord[]>([])
  const [lastResult, setLastResult] = useState<{
    outcome: 'sacou' | 'explodiu'
    payout: number
    multiplier: number
  } | null>(null)

  const isPlaying = status === 'jogando'
  const isRoundOver = status === 'explodiu' || status === 'sacou'

  const picks = revealed.length
  const safeTiles = TOTAL_TILES - mines
  const currentMultiplier = multiplierFor(mines, picks)
  const nextMultiplier = multiplierFor(mines, picks + 1)
  const cashoutValue = picks > 0 ? bet * currentMultiplier : 0
  const nextSafeChance = nextTileSafeChance(mines, picks)
  const clearedAll = isPlaying && picks === safeTiles

  const mineSet = useMemo(() => new Set(minePositions), [minePositions])

  const settle = useCallback(
    (outcome: 'sacou' | 'explodiu', payout: number, multiplier: number, pickCount: number) => {
      setLastResult({ outcome, payout, multiplier })
      setHistory((prev) =>
        [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            bet,
            mines,
            picks: pickCount,
            multiplier,
            payout,
            outcome,
          },
          ...prev,
        ].slice(0, 12),
      )
    },
    [bet, mines],
  )

  const startRound = useCallback(() => {
    if (bet > balance || isPlaying) return

    setBalance((prev) => prev - bet)
    setMinePositions(drawMinePositions(mines))
    setRevealed([])
    setHitTile(null)
    setLastResult(null)
    setStatus('jogando')
  }, [balance, bet, isPlaying, mines])

  const cashout = useCallback(() => {
    if (!isPlaying || picks === 0) return

    const payout = bet * currentMultiplier
    setBalance((prev) => prev + payout)
    setStatus('sacou')
    settle('sacou', payout, currentMultiplier, picks)
  }, [bet, currentMultiplier, isPlaying, picks, settle])

  const revealTile = useCallback(
    (index: number) => {
      if (!isPlaying || revealed.includes(index)) return

      if (mineSet.has(index)) {
        setHitTile(index)
        setStatus('explodiu')
        settle('explodiu', 0, 0, picks)
        return
      }

      const nextRevealed = [...revealed, index]
      setRevealed(nextRevealed)

      // Limpou o tabuleiro: saca automaticamente, não há mais o que clicar.
      if (nextRevealed.length === safeTiles) {
        const multiplier = multiplierFor(mines, nextRevealed.length)
        const payout = bet * multiplier
        setBalance((prev) => prev + payout)
        setStatus('sacou')
        settle('sacou', payout, multiplier, nextRevealed.length)
      }
    },
    [bet, isPlaying, mineSet, mines, picks, revealed, safeTiles, settle],
  )

  const newRound = useCallback(() => {
    setStatus('aposta')
    setRevealed([])
    setMinePositions([])
    setHitTile(null)
    setLastResult(null)
  }, [])

  const changeMines = useCallback(
    (value: number) => {
      if (isPlaying) return
      setMines(value)
      newRound()
    },
    [isPlaying, newRound],
  )

  const changeBet = useCallback(
    (value: number) => {
      if (isPlaying) return
      setBet(value)
    },
    [isPlaying],
  )

  const resetBalance = useCallback(() => {
    if (isPlaying) return
    setBalance(INITIAL_BALANCE)
    setHistory([])
    newRound()
  }, [isPlaying, newRound])

  return {
    balance,
    bet,
    mines,
    status,
    isPlaying,
    isRoundOver,
    clearedAll,
    revealed,
    minePositions,
    hitTile,
    picks,
    safeTiles,
    currentMultiplier,
    nextMultiplier,
    cashoutValue,
    nextSafeChance,
    lastResult,
    history,
    startRound,
    cashout,
    revealTile,
    newRound,
    changeBet,
    changeMines,
    resetBalance,
  }
}
