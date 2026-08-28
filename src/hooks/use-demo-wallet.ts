
import { useCallback, useEffect, useRef, useState } from 'react'
import { useProfile } from '@/hooks/use-profile'

export const INITIAL_BALANCE = 1000

/** Valores de aposta oferecidos em todos os jogos da plataforma. */
export const betOptions = [1, 2, 5, 10, 25, 50] as const

export type BetOption = (typeof betOptions)[number]

export type RoundLog = {
  id: number
  bet: number
  payout: number
  multiplier: number
  /** Texto curto que descreve o resultado, ex. "3 gemas" ou "linha do tigre". */
  label?: string
}

type Options = {
  defaultBet?: number
  historySize?: number
}

/**
 * Carteira do modo demonstração compartilhada por Plinko, Mines, Aviator,
 * Fortune Tiger, Sweet Candy e Gates of Olympus.
 *
 * Os `ref` espelham o estado para que loops de animação e callbacks
 * encadeados leiam sempre o valor atual, sem depender de closures antigas.
 */
export function useDemoWallet({ defaultBet = 2, historySize = 12 }: Options = {}) {
  const { profile, persistBalance } = useProfile()
  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [bet, setBet] = useState(defaultBet)
  const [history, setHistory] = useState<RoundLog[]>([])

  const balanceRef = useRef(balance)
  const betRef = useRef(bet)

  balanceRef.current = balance
  betRef.current = bet

  /** Ao entrar na conta, o saldo salvo no banco substitui o saldo local. */
  const loadedFor = useRef<string | null>(null)
  useEffect(() => {
    if (!profile || loadedFor.current === profile.id) return
    loadedFor.current = profile.id
    balanceRef.current = profile.balance
    setBalance(profile.balance)
  }, [profile])

  /** Desconta a aposta. Devolve false quando o saldo não cobre o valor. */
  const debit = useCallback((amount: number) => {
    if (amount > balanceRef.current) return false
    balanceRef.current -= amount
    setBalance(balanceRef.current)
    persistBalance(balanceRef.current)
    return true
  }, [persistBalance])

  const credit = useCallback((amount: number) => {
    if (amount <= 0) return
    balanceRef.current += amount
    setBalance(balanceRef.current)
    persistBalance(balanceRef.current)
  }, [persistBalance])

  const log = useCallback(
    (entry: Omit<RoundLog, 'id'>) => {
      setHistory((previous) =>
        [{ id: Date.now() + Math.random(), ...entry }, ...previous].slice(0, historySize),
      )
    },
    [historySize],
  )

  const changeBet = useCallback((value: number) => {
    betRef.current = value
    setBet(value)
  }, [])

  const reset = useCallback(() => {
    balanceRef.current = INITIAL_BALANCE
    setBalance(INITIAL_BALANCE)
    setHistory([])
    persistBalance(INITIAL_BALANCE)
  }, [persistBalance])

  return {
    balance,
    balanceRef,
    bet,
    betRef,
    history,
    changeBet,
    debit,
    credit,
    log,
    reset,
  }
}
