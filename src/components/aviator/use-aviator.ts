import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BETTING_MS,
  CRASHED_MS,
  createLiveBets,
  multiplierAt,
  randomCrashPoint,
  type LiveBet,
} from '@/lib/aviator-engine'
import { useProfile } from '@/hooks/use-profile'
import { formatBRL } from '@/lib/casino-data'

export type Phase = 'betting' | 'flying' | 'crashed'

export type ActiveBet = { amount: number; cashedAt: number | null }

export type RoundResult = {
  id: string
  amount: number
  cashedAt: number | null
  crashedAt: number
  payout: number
}

const INITIAL_HISTORY = [1.24, 3.87, 1.02, 12.4, 2.16, 1.55, 6.03, 1.09, 4.71, 2.88]

export function useAviator() {
  const { profile, persistBalance } = useProfile()
  const [phase, setPhase] = useState<Phase>('betting')
  const [countdown, setCountdown] = useState(BETTING_MS / 1000)
  const [multiplier, setMultiplier] = useState(1)
  const [elapsed, setElapsed] = useState(0)
  const [history, setHistory] = useState<number[]>(INITIAL_HISTORY)
  const [balance, setBalance] = useState<number>(profile?.balance ?? 0)
  const [bet, setBet] = useState<ActiveBet | null>(null)
  const [queuedBet, setQueuedBet] = useState<number | null>(null)
  const [autoCashout, setAutoCashout] = useState('')
  const [liveBets, setLiveBets] = useState<LiveBet[]>([])
  const [myBets, setMyBets] = useState<RoundResult[]>([])
  const [notice, setNotice] = useState<string | null>(null)

  // Sincroniza saldo inicial com o perfil do usuário
  useEffect(() => {
    if (profile?.balance !== undefined) {
      setBalance(profile.balance)
      balanceRef.current = profile.balance
    }
  }, [profile?.balance])

  // Espelhos mutáveis: o loop de animação lê refs para evitar closures velhas e cancelamentos indevidos.
  const phaseRef = useRef<Phase>('betting')
  const betRef = useRef<ActiveBet | null>(null)
  const queuedRef = useRef<number | null>(null)
  const autoRef = useRef<number | null>(null)
  const crashRef = useRef(1)
  const startRef = useRef(0)
  const balanceRef = useRef(profile?.balance ?? 0)
  const persistBalanceRef = useRef(persistBalance)

  useEffect(() => {
    persistBalanceRef.current = persistBalance
  }, [persistBalance])

  useEffect(() => {
    const parsed = Number.parseFloat(autoCashout.replace(',', '.'))
    autoRef.current = Number.isFinite(parsed) && parsed > 1 ? parsed : null
  }, [autoCashout])

  /** Encerra a aposta do jogador pagando o multiplicador informado e creditando no saldo real. */
  const settleCashout = useCallback((at: number) => {
    const current = betRef.current
    if (!current || current.cashedAt !== null) return

    const payout = Math.round(current.amount * at * 100) / 100
    const updatedBet = { ...current, cashedAt: at }
    betRef.current = updatedBet
    setBet(updatedBet)

    setBalance((prev) => {
      const next = Math.round((prev + payout) * 100) / 100
      balanceRef.current = next
      if (persistBalanceRef.current) {
        persistBalanceRef.current(next)
      }
      return next
    })

    setNotice(`Retirada em ${at.toFixed(2)}x · +${formatBRL(payout)}`)
  }, [])

  const settleCashoutRef = useRef(settleCashout)
  useEffect(() => {
    settleCashoutRef.current = settleCashout
  }, [settleCashout])

  const cashOut = useCallback(() => {
    if (phaseRef.current !== 'flying') return
    const seconds = (performance.now() - startRef.current) / 1000
    const currentMultiplier = multiplierAt(seconds)
    settleCashoutRef.current(currentMultiplier)
  }, [])

  // Loop perpétuo de animação e rodadas: roda UMA ÚNICA VEZ e nunca é interrompido por apostas ou re-renders
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
              payout: current.cashedAt ? Math.round(current.amount * current.cashedAt * 100) / 100 : 0,
            },
            ...prev,
          ].slice(0, 12),
        )
        if (current.cashedAt === null) {
          setNotice(`Explodiu em ${crashedAt.toFixed(2)}x · rodada finalizada`)
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

      // Retirada automática do jogador
      const auto = autoRef.current
      const current = betRef.current
      if (auto && current && current.cashedAt === null && value >= auto) {
        settleCashoutRef.current(auto)
      }

      // Apostadores simultâneos na rodada
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

      // A aposta enfileirada entra automaticamente na nova rodada
      const queued = queuedRef.current
      if (queued !== null) {
        const newBet = { amount: queued, cashedAt: null }
        betRef.current = newBet
        setBet(newBet)
        queuedRef.current = null
        setQueuedBet(null)
      } else {
        // Limpa a aposta finalizada da rodada anterior
        betRef.current = null
        setBet(null)
      }

      let left = BETTING_MS
      setCountdown(left / 1000)

      const tick = () => {
        if (cancelled) return
        left -= 100
        setCountdown(Math.max(0, left / 1000))
        if (left <= 0) {
          startFlying()
        } else {
          timer = setTimeout(tick, 100)
        }
      }
      timer = setTimeout(tick, 100)
    }

    startBetting()

    return () => {
      cancelled = true
      clear()
    }
  }, []) // <--- VAZIO: Garante que o avião suba ininterruptamente!

  const placeBet = useCallback((amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return
    const curBal = balanceRef.current
    if (amount > curBal) {
      setNotice('Saldo insuficiente para esta aposta')
      return
    }

    const nextBal = Math.max(0, Math.round((curBal - amount) * 100) / 100)
    balanceRef.current = nextBal
    setBalance(nextBal)
    if (persistBalanceRef.current) {
      persistBalanceRef.current(nextBal)
    }

    if (phaseRef.current === 'betting') {
      const newBet = { amount, cashedAt: null }
      betRef.current = newBet
      setBet(newBet)
      setNotice(null)
    } else {
      queuedRef.current = amount
      setQueuedBet(amount)
      setNotice('Aposta registrada para a próxima rodada')
    }
  }, [])

  const cancelBet = useCallback(() => {
    if (queuedRef.current !== null) {
      const refund = queuedRef.current
      queuedRef.current = null
      setQueuedBet(null)
      const nextBal = Math.round((balanceRef.current + refund) * 100) / 100
      balanceRef.current = nextBal
      setBalance(nextBal)
      if (persistBalanceRef.current) {
        persistBalanceRef.current(nextBal)
      }
      setNotice(null)
      return
    }

    const current = betRef.current
    if (phaseRef.current === 'betting' && current && current.cashedAt === null) {
      const refund = current.amount
      betRef.current = null
      setBet(null)
      const nextBal = Math.round((balanceRef.current + refund) * 100) / 100
      balanceRef.current = nextBal
      setBalance(nextBal)
      if (persistBalanceRef.current) {
        persistBalanceRef.current(nextBal)
      }
      setNotice(null)
    }
  }, [])

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
