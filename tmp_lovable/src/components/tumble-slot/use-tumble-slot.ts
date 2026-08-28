
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDemoWallet, type RoundLog } from '@/hooks/use-demo-wallet'
import {
  randomTumbleGrid,
  spinTumble,
  CELLS,
  type TumbleConfig,
} from '@/lib/tumble-slot-engine'

const SPIN_MS = 620
const STEP_MS = 760

export type TumbleGameState = ReturnType<typeof useTumbleSlot>

export function useTumbleSlot(config: TumbleConfig) {
  const wallet = useDemoWallet({ defaultBet: 2 })
  const [grid, setGrid] = useState<string[]>(() =>
    Array.from({ length: CELLS }, (_, index) => config.symbols[index % config.symbols.length].id),
  )
  const [spinning, setSpinning] = useState(false)
  const [winningCells, setWinningCells] = useState<Set<number>>(new Set())
  const [orbs, setOrbs] = useState<{ cell: number; value: number }[]>([])
  const [roundWin, setRoundWin] = useState<number | null>(null)
  const [multiplier, setMultiplier] = useState(1)
  const [tumbles, setTumbles] = useState(0)
  const [freeSpins, setFreeSpins] = useState(0)
  const [message, setMessage] = useState('Faça sua aposta e gire')

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const busy = useRef(false)
  const autoRef = useRef(0)
  const [autoSpins, setAutoSpins] = useState(0)

  const schedule = useCallback((fn: () => void, delay: number) => {
    timers.current.push(setTimeout(fn, delay))
  }, [])

  useEffect(() => {
    setGrid(randomTumbleGrid(config))
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [config])

  const runSpin = useCallback(
    (free = false) => {
      const bet = wallet.betRef.current

      if (!free) {
        if (!wallet.debit(bet)) {
          setMessage('Saldo insuficiente para essa aposta')
          autoRef.current = 0
          setAutoSpins(0)
          return
        }
      }

      busy.current = true
      setSpinning(true)
      setWinningCells(new Set())
      setOrbs([])
      setRoundWin(null)
      setMultiplier(1)
      setTumbles(0)
      setMessage(free ? 'Rodada grátis em andamento' : 'Girando...')

      const result = spinTumble(config, bet)

      schedule(() => {
        setSpinning(false)

        result.steps.forEach((step, index) => {
          schedule(() => {
            setGrid(step.grid)
            setOrbs(step.orbs)
            setWinningCells(new Set(step.wins.flatMap((win) => win.cells)))
            if (step.wins.length > 0) setTumbles(index + 1)
          }, index * STEP_MS)
        })

        const endsAt = result.steps.length * STEP_MS

        schedule(() => {
          setWinningCells(new Set())
          setRoundWin(result.total)
          setMultiplier(result.multiplier)

          if (result.total > 0) wallet.credit(result.total)

          const entry: Omit<RoundLog, 'id'> = {
            bet: free ? 0 : bet,
            payout: result.total,
            multiplier: bet > 0 ? result.total / bet : 0,
            label:
              result.scatters >= 4
                ? `${result.scatters} ${config.scatter.name}`
                : result.steps.filter((step) => step.wins.length > 0).length > 0
                  ? `${result.steps.filter((step) => step.wins.length > 0).length} quedas`
                  : 'sem prêmio',
          }
          wallet.log(entry)

          if (result.freeSpins > 0) {
            setFreeSpins((value) => value + result.freeSpins)
            setMessage(`${result.scatters} scatters! +${result.freeSpins} rodadas grátis`)
          } else if (result.total >= bet * 20) {
            setMessage('MEGA GANHO!')
          } else if (result.total > 0) {
            setMessage('Você ganhou!')
          } else {
            setMessage('Sem prêmio nessa rodada')
          }

          schedule(() => {
            busy.current = false

            setFreeSpins((remaining) => {
              if (remaining > 0) {
                schedule(() => runSpin(true), 200)
                return remaining - 1
              }

              if (autoRef.current > 0) {
                autoRef.current -= 1
                setAutoSpins(autoRef.current)
                if (wallet.betRef.current <= wallet.balanceRef.current) {
                  schedule(() => runSpin(), 200)
                } else {
                  autoRef.current = 0
                  setAutoSpins(0)
                  setMessage('Saldo insuficiente para continuar')
                }
              }
              return remaining
            })
          }, 700)
        }, endsAt)
      }, SPIN_MS)
    },
    [config, schedule, wallet],
  )

  const handleSpin = useCallback(() => {
    if (busy.current) return
    runSpin()
  }, [runSpin])

  const startAuto = useCallback(
    (count: number) => {
      autoRef.current = count
      setAutoSpins(count)
      if (!busy.current) runSpin()
    },
    [runSpin],
  )

  const stopAuto = useCallback(() => {
    autoRef.current = 0
    setAutoSpins(0)
  }, [])

  const resetBalance = useCallback(() => {
    if (busy.current) return
    stopAuto()
    setFreeSpins(0)
    wallet.reset()
    setMessage('Saldo recarregado. Boa sorte!')
  }, [stopAuto, wallet])

  return {
    ...wallet,
    grid,
    spinning,
    winningCells,
    orbs,
    roundWin,
    multiplier,
    tumbles,
    freeSpins,
    message,
    autoSpins,
    isBusy: spinning || autoSpins > 0 || freeSpins > 0,
    handleSpin,
    startAuto,
    stopAuto,
    resetBalance,
  }
}
