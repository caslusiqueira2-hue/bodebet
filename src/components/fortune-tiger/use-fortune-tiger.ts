
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  GRID_SIZE,
  randomGrid,
  spin as spinReels,
  winTier,
  type LineWin,
  type SpinResult,
  type SymbolId,
} from '@/lib/fortune-tiger-engine'

const INITIAL_BALANCE = 1000
/** Tempo que cada coluna leva girando antes de parar. */
const REEL_STOP_DELAY = [420, 620, 820]
const WIN_DISPLAY_MS = 1600
/** Cofre do Tigre: custo, chance e prêmio em fichas fictícias. */
const VAULT_COST = 1
const VAULT_CHANCE = 0.08
const VAULT_PRIZE = 12


export type HistoryEntry = {
  id: number
  bet: number
  payout: number
  multiplier: number
  symbol: SymbolId | null
}

export function useFortuneTiger() {
  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [bet, setBet] = useState(2)
  const [grid, setGrid] = useState<SymbolId[]>(() => Array(GRID_SIZE).fill('coin'))
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false])
  const [wins, setWins] = useState<LineWin[]>([])
  const [lastPayout, setLastPayout] = useState<number | null>(null)
  const [lastMultiplier, setLastMultiplier] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [respinPending, setRespinPending] = useState(false)
  const [turbo, setTurbo] = useState(false)
  const [autoSpins, setAutoSpins] = useState(0)
  const [message, setMessage] = useState('Faça sua aposta e gire os rolos')
  const [vaultMessage, setVaultMessage] = useState<string | null>(null)
  const [vaultOpen, setVaultOpen] = useState(false)
  const [vaultTries, setVaultTries] = useState(0)


  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const busyRef = useRef(false)
  const autoRef = useRef(0)
  const betRef = useRef(bet)
  const balanceRef = useRef(balance)

  betRef.current = bet
  balanceRef.current = balance

  const isSpinning = spinningReels.some(Boolean)

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay)
    timers.current.push(id)
    return id
  }, [])

  useEffect(() => {
    // A grade inicial usa Math.random, então só pode ser sorteada no cliente.
    setGrid(randomGrid())
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [])

  /** Roda um giro: desconta a aposta (exceto no giro grátis) e revela as colunas. */
  const runSpin = useCallback(
    (options: { free?: boolean } = {}) => {
      const free = options.free ?? false
      const currentBet = betRef.current
      const speed = turbo ? 0.45 : 1

      if (!free) {
        if (currentBet > balanceRef.current) {
          setMessage('Saldo insuficiente para essa aposta')
          autoRef.current = 0
          setAutoSpins(0)
          return
        }
        setBalance((value) => value - currentBet)
      }

      busyRef.current = true
      setWins([])
      setLastPayout(null)
      setRespinPending(false)
      setSpinningReels([true, true, true])
      setMessage(free ? 'Giro grátis em andamento' : 'Girando...')

      const result: SpinResult = spinReels(currentBet)

      REEL_STOP_DELAY.forEach((delay, reel) => {
        schedule(() => {
          setGrid((previous) => {
            const next = [...previous]
            for (let row = 0; row < 3; row++) {
              next[reel * 3 + row] = result.grid[reel * 3 + row]
            }
            return next
          })
          setSpinningReels((previous) => {
            const next = [...previous]
            next[reel] = false
            return next
          })
        }, delay * speed)
      })

      const settleAt = REEL_STOP_DELAY[2] * speed + 120

      schedule(() => {
        setWins(result.wins)
        setLastPayout(result.total)
        setLastMultiplier(result.multiplier)

        if (result.total > 0) {
          setBalance((value) => value + result.total)
          const tier = winTier(result.multiplier)
          setMessage(
            tier === 'mega'
              ? 'MEGA GANHO! O tigre abriu o cofre'
              : tier === 'grande'
                ? 'Grande ganho!'
                : 'Você ganhou!',
          )
        } else if (result.respin) {
          setRespinPending(true)
          setMessage('O tigre liberou um giro grátis!')
        } else {
          setMessage('Sem prêmio nessa rodada')
        }

        setHistory((previous) =>
          [
            {
              id: Date.now() + Math.random(),
              bet: free ? 0 : currentBet,
              payout: result.total,
              multiplier: result.multiplier,
              symbol: result.wins[0]?.symbol ?? null,
            },
            ...previous,
          ].slice(0, 12),
        )

        // Encadeia o giro grátis ou o próximo giro automático.
        schedule(
          () => {
            busyRef.current = false

            if (result.respin) {
              runSpin({ free: true })
              return
            }

            if (autoRef.current > 0) {
              autoRef.current -= 1
              setAutoSpins(autoRef.current)
              if (autoRef.current >= 0 && betRef.current <= balanceRef.current) {
                runSpin()
              } else if (betRef.current > balanceRef.current) {
                autoRef.current = 0
                setAutoSpins(0)
                setMessage('Saldo insuficiente para continuar')
              }
            }
          },
          result.total > 0 ? WIN_DISPLAY_MS * speed : 400 * speed,
        )
      }, settleAt)
    },
    [schedule, turbo],
  )

  const handleSpin = useCallback(() => {
    if (busyRef.current) return
    runSpin()
  }, [runSpin])

  const startAuto = useCallback(
    (count: number) => {
      autoRef.current = count
      setAutoSpins(count)
      if (!busyRef.current) runSpin()
    },
    [runSpin],
  )

  const stopAuto = useCallback(() => {
    autoRef.current = 0
    setAutoSpins(0)
  }, [])

  const changeBet = useCallback((value: number) => {
    if (busyRef.current) return
    setBet(value)
  }, [])

  const resetBalance = useCallback(() => {
    if (busyRef.current) return
    setBalance(INITIAL_BALANCE)
    setHistory([])
    setMessage('Saldo do modo demonstração restaurado')
  }, [])

  /**
   * Cofre do Tigre: cada tentativa custa R$ 1,00 do saldo fictício e tem 8%
   * de chance de abrir, pagando R$ 12,00 (RTP ~96%). Nenhum valor real.
   */
  const tryVault = useCallback(() => {
    if (busyRef.current) return
    if (VAULT_COST > balanceRef.current) {
      setVaultMessage('Saldo insuficiente para tentar abrir o cofre.')
      return
    }

    setBalance((value) => value - VAULT_COST)
    setVaultTries((value) => value + 1)

    const opened = Math.random() < VAULT_CHANCE
    setVaultOpen(opened)

    if (opened) {
      setBalance((value) => value + VAULT_PRIZE)
      setVaultMessage(`Cofre aberto! Você levou R$ ${VAULT_PRIZE},00 em fichas demo.`)
    } else {
      setVaultMessage('O cofre continuou trancado. Tente novamente.')
    }

    setHistory((previous) =>
      [
        {
          id: Date.now() + Math.random(),
          bet: VAULT_COST,
          payout: opened ? VAULT_PRIZE : 0,
          multiplier: opened ? VAULT_PRIZE / VAULT_COST : 0,
          symbol: null,
        },
        ...previous,
      ].slice(0, 12),
    )
  }, [])

  const winningCells = new Set(wins.flatMap((win) => win.cells))

  return {
    balance,
    bet,
    grid,
    spinningReels,
    isSpinning,
    wins,
    winningCells,
    lastPayout,
    lastMultiplier,
    history,
    respinPending,
    turbo,
    autoSpins,
    message,
    vaultMessage,
    vaultOpen,
    vaultTries,
    vaultCost: VAULT_COST,
    vaultPrize: VAULT_PRIZE,
    tryVault,
    setTurbo,
    changeBet,
    handleSpin,
    startAuto,
    stopAuto,
    resetBalance,
  }
}

