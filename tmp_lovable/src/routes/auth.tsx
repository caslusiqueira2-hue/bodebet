import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { lovable } from '@/integrations/lovable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BrandLogo } from '@/components/brand-logo'

export const Route = createFileRoute('/auth')({
  head: () => ({
    meta: [
      { title: 'Entrar ou criar conta | BodeBet demo' },
      {
        name: 'description',
        content:
          'Acesse sua conta demo da BodeBet para salvar seu saldo fictício e histórico em todos os jogos.',
      },
      { property: 'og:title', content: 'Entrar ou criar conta | BodeBet demo' },
      {
        property: 'og:description',
        content: 'Crie sua conta demo gratuita e jogue com saldo fictício salvo na nuvem.',
      },
    ],
  }),
  component: AuthPage,
})

function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split('@')[0] },
          },
        })
        if (error) throw error
        toast.success('Conta criada! Confirme o e-mail para entrar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Bem-vindo de volta!')
        void navigate({ to: '/' })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível continuar.')
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setBusy(true)
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    })
    if (result?.error) {
      toast.error('Falha ao entrar com Google.')
      setBusy(false)
      return
    }
    void navigate({ to: '/' })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <BrandLogo />
          <h1 className="text-xl font-bold">
            {mode === 'signin' ? 'Entrar na sua conta' : 'Criar sua conta'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Saldo fictício salvo na sua conta. Nenhum valor real é movimentado.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogle}
          disabled={busy}
        >
          Continuar com Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'signup' ? (
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de exibição</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Como quer ser chamado"
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === 'signin' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <button
          type="button"
          className="mt-5 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin'
            ? 'Ainda não tem conta? Cadastre-se'
            : 'Já tem conta? Faça login'}
        </button>
      </div>
    </main>
  )
}
