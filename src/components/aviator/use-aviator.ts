
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BETTING_MS,
  CRASHED_MS,
  createLiveBets,
  multiplierAt,
  randomCrashPoint,
  type LiveBet,
} from '@/lib/aviator-engine'

export type Phase = 'betting' | 'flying' | 'crashed'

export type ActiveBet = { amount: number; cashedAt: number | null }

export type RoundResult = {
  id: string
  amount: number
  cashedAt: number | null
  crashedAt: number
  payout: number
}

const INITIAL_BALANCE = 1000
const INITIAL_HISTORY = [1.24, 3.87, 1.02, 12.4, 2.16, 1.55, 6.03, 1.09, 4.71, 2.88]

export function useAviator() {
  const [phase, setPhase] = useState<Phase>('betting')
  const [countdown, setCountdown] = useState(BETTING_MS / 1000)
  const [multiplier, setMultiplier] = useState(1)
  const [elapsed, setElapsed] = useState(0)
  const [history, setHistory] = useState<number[]>(INITIAL_HISTORY)
  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [bet, setBet] = useState<ActiveBet | null>(null)
  const [queuedBet, setQueuedBet] = useState<number | null>(null)
  const [autoCashout, setAutoCashout] = useState('')
  // Começa vazio: a lista usa Math.random e só pode ser gerada no cliente,
  // senão o HTML do servidor não bate com o da hidratação.
  const [liveBets, setLiveBets] = useState<LiveBet[]>([])
  const [myBets, setMyBets] = useState<RoundResult[]>([])
  const [notice, setNotice] = useState<string | null>(null)

  // Espelhos mutáveis: o loop de animação lê refs para evitar closures velhas.
  const phaseRef = useRef<Phase>('betting')
  const betRef = useRef<ActiveBet | null>(null)
  const queuedRef = useRef<number | null>(null)
  const autoRef = useRef<number | null>(null)
  const crashRef = useRef(1)
  const startRef = useRef(0)

  const syncBet = useCallback((next: ActiveBet | null) => {
    betRef.current = next
    setBet(next)
  }, [])

  const syncQueued = useCallback((next: number | null) => {
    queuedRef.current = next
    setQueuedBet(next)
  }, [])

  useEffect(() => {
    const parsed = Number.parseFloat(autoCashout.replace(',', '.'))
    autoRef.current = Number.isFinite(parsed) && parsed > 1 ? parsed : null
  }, [autoCashout])

  /** Encerra a aposta do jogador pagando o multiplicador informado. */
  const settleCashout = useCallback(
    (at: number) => {
      const current = betRef.current
      if (!current || current.cashedAt !== null) return

      const payout = current.amount * at
      syncBet({ ...current, cashedAt: at })
      setBalance((value) => value + payout)
      setNotice(`Retirada em ${at.toFixed(2)}x · +${payout.toFixed(2)}`)
    },
    [syncBet],
  )

  const cashOut = useCallback(() => {
    if (phaseRef.current !== 'flying') return
    settleCashout(multiplierAt((performance.now() - startRef.current) / 1000))
  }, [settleCashout])

  useEffect(() => {
    let frame = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    let cancelled = false

    const clear = () => {
      if (timer) clearTimeout(timer)
      cancelAnimationFrame(frame)
    }

    const finishRound = (crashedAt: number) => {
      phaseRef.current = 'crashed'
      setPhase('crashed')
      setMultiplier(crashedAt)
      setHistory((prev) => [crashedAt, ...prev].slice(0, 24))

      const current = betRef.current
      if (current) {
        setMyBets((prev) =>
          [
            {
              id: `${Date.now()}`,
              amount: current.amount,
              cashedAt: current.cashedAt,
              crashedAt,
              payout: current.cashedAt ? current.amount * current.cashedAt : 0,
            },
            ...prev,
          ].slice(0, 12),
        )
        if (current.cashedAt === null) {
          setNotice(`Explodiu em ${crashedAt.toFixed(2)}x · você perdeu a aposta`)
        }
      }

      timer = setTimeout(() => {
        if (!cancelled) startBetting()
      }, CRASHED_MS)
    }

    const flyFrame = () => {
      if (cancelled) return
      const seconds = (performance.now() - startRef.current) / 1000
      const value = multiplierAt(seconds)

      if (value >= crashRef.current) {
        finishRound(crashRef.current)
        return
      }

      setElapsed(seconds)
      setMultiplier(value)

      // Retirada automática do jogador.
      const auto = autoRef.current
      const current = betRef.current
      if (auto && current && current.cashedAt === null && value >= auto) {
        settleCashout(auto)
      }

      // Apostadores simulados saindo do voo.
      setLiveBets((prev) => {
        let changed = false
        const next = prev.map((item) => {
          if (item.cashedAt === null && item.target <= value) {
            changed = true
            return { ...item, cashedAt: item.target }
          }
          return item
        })
        return changed ? next : prev
      })

      frame = requestAnimationFrame(flyFrame)
    }

    const startFlying = () => {
      phaseRef.current = 'flying'
      setPhase('flying')
      crashRef.current = randomCrashPoint()
      startRef.current = performance.now()
      setElapsed(0)
      setMultiplier(1)
      frame = requestAnimationFrame(flyFrame)
    }

    const startBetting = () => {
      phaseRef.current = 'betting'
      setPhase('betting')
      setMultiplier(1)
      setElapsed(0)
      setLiveBets(createLiveBets())

      // A aposta enfileirada entra automaticamente na nova rodada.
      const queued = queuedRef.current
      syncBet(queued ? { amount: queued, cashedAt: null } : null)
      syncQueued(null)

      let left = BETTING_MS
      setCountdown(left / 1000)

      const tick = () => {
        if (cancelled) return
        left -= 100
        setCountdown(Math.max(0, left / 1000))
        if (left <= 0) startFlying()
        else timer = setTimeout(tick, 100)
      }
      timer = setTimeout(tick, 100)
    }

    startBetting()

    return () => {
      cancelled = true
      clear()
    }
  }, [settleCashout, syncBet, syncQueued])

  const placeBet = useCallback(
    (amount: number) => {
      if (!Number.isFinite(amount) || amount <= 0) return
      if (amount > balance) {
        setNotice('Saldo insuficiente para esta aposta')
        return
      }
      setBalance((value) => value - amount)

      if (phaseRef.current === 'betting') {
        syncBet({ amount, cashedAt: null })
        setNotice(null)
      } else {
        syncQueued(amount)
        setNotice('Aposta registrada para a próxima rodada')
      }
    },
    [balance, syncBet, syncQueued],
  )

  const cancelBet = useCallback(() => {
    if (queuedRef.current !== null) {
      setBalance((value) => value + (queuedRef.current ?? 0))
      syncQueued(null)
      setNotice(null)
      return
    }
    const current = betRef.current
    if (phaseRef.current === 'betting' && current && current.cashedAt === null) {
      setBalance((value) => value + current.amount)
      syncBet(null)
      setNotice(null)
    }
  }, [syncBet, syncQueued])

  return {
    phase,
    countdown,
    multiplier,
    elapsed,
    history,
    balance,
    bet,
    queuedBet,
    autoCashout,
    setAutoCashout,
    liveBets,
    myBets,
    notice,
    placeBet,
    cancelBet,
    cashOut,
  }
}
