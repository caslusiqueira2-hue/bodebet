
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDemoWallet } from '@/hooks/use-demo-wallet'
import {
  dropBall,
  multipliersFor,
  type Risk,
  type RowCount,
} from '@/lib/plinko-engine'

const STEP_MS = 130

export type Ball = {
  id: number
  path: number[]
  level: number
  slot: number
}

export function usePlinko() {
  const wallet = useDemoWallet({ defaultBet: 2 })
  const [risk, setRisk] = useState<Risk>('medio')
  const [rows, setRows] = useState<RowCount>(12)
  const [balls, setBalls] = useState<Ball[]>([])
  const [lastSlot, setLastSlot] = useState<number | null>(null)
  const [lastPayout, setLastPayout] = useState<number | null>(null)
  const [lastMultiplier, setLastMultiplier] = useState<number | null>(null)
  const [autoLeft, setAutoLeft] = useState(0)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const intervals = useRef<ReturnType<typeof setInterval>[]>([])
  const autoRef = useRef(0)

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
      intervals.current.forEach(clearInterval)
    },
    [],
  )

  const drop = useCallback(() => {
    const bet = wallet.betRef.current
    if (!wallet.debit(bet)) return false

    const result = dropBall(risk, rows, bet)
    const id = Date.now() + Math.random()

    setBalls((previous) => [...previous, { id, path: result.path, level: 0, slot: result.slot }])

    const interval = setInterval(() => {
      setBalls((previous) =>
        previous.map((ball) => (ball.id === id ? { ...ball, level: ball.level + 1 } : ball)),
      )
    }, STEP_MS)
    intervals.current.push(interval)

    const finish = setTimeout(
      () => {
        clearInterval(interval)
        setBalls((previous) => previous.filter((ball) => ball.id !== id))
        setLastSlot(result.slot)
        setLastPayout(result.payout)
        setLastMultiplier(result.multiplier)
        if (result.payout > 0) wallet.credit(result.payout)
        wallet.log({
          bet,
          payout: result.payout,
          multiplier: result.multiplier,
          label: `${result.multiplier}x · slot ${result.slot + 1}`,
        })
      },
      STEP_MS * (rows + 1),
    )
    timers.current.push(finish)

    return true
  }, [risk, rows, wallet])

  const startAuto = useCallback(
    (count: number) => {
      autoRef.current = count
      setAutoLeft(count)

      const tick = () => {
        if (autoRef.current <= 0) return
        const ok = drop()
        autoRef.current -= 1
        setAutoLeft(autoRef.current)
        if (ok && autoRef.current > 0) {
          timers.current.push(setTimeout(tick, 320))
        } else if (!ok) {
          autoRef.current = 0
          setAutoLeft(0)
        }
      }

      tick()
    },
    [drop],
  )

  const stopAuto = useCallback(() => {
    autoRef.current = 0
    setAutoLeft(0)
  }, [])

  const changeRows = useCallback((value: RowCount) => {
    setRows(value)
    setLastSlot(null)
  }, [])

  const changeRisk = useCallback((value: Risk) => {
    setRisk(value)
    setLastSlot(null)
  }, [])

  const resetBalance = useCallback(() => {
    stopAuto()
    wallet.reset()
    setLastPayout(null)
    setLastMultiplier(null)
    setLastSlot(null)
  }, [stopAuto, wallet])

  return {
    ...wallet,
    risk,
    rows,
    balls,
    lastSlot,
    lastPayout,
    lastMultiplier,
    autoLeft,
    multipliers: multipliersFor(risk, rows),
    drop,
    startAuto,
    stopAuto,
    changeRisk,
    changeRows,
    resetBalance,
  }
}
