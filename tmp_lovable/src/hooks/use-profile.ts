import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export type Profile = {
  id: string
  display_name: string
  balance: number
}

/**
 * Perfil do jogador logado. Guarda o saldo demo no banco para que a conta
 * seja a mesma em qualquer dispositivo.
 */
export function useProfile() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let active = true
    if (authLoading) return
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('profiles')
      .select('id, display_name, balance')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        setProfile(
          data
            ? { ...data, balance: Number(data.balance) }
            : { id: user.id, display_name: 'Jogador', balance: 1000 },
        )
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user, authLoading])

  /** Grava o saldo no banco com um pequeno atraso para agrupar rodadas. */
  const persistBalance = useCallback(
    (balance: number) => {
      if (!user) return
      setProfile((previous) => (previous ? { ...previous, balance } : previous))
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        void supabase
          .from('profiles')
          .upsert({ id: user.id, balance }, { onConflict: 'id' })
      }, 800)
    },
    [user],
  )

  return { profile, loading: loading || authLoading, persistBalance, userId: user?.id ?? null }
}
