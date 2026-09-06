import { useState } from 'react'
import { ArrowDownUp, LogOut, Menu, Search, User, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand-logo'
import { useProfile } from '@/hooks/use-profile'
import { supabase } from '@/lib/supabase'

const navLinks = [
  { label: 'Cassino', href: '/#jogos' },
  { label: 'Aviator', href: '/games/aviator' },
  { label: 'Mines', href: '/games/mines' },
  { label: 'Double', href: '/games/double' },
  { label: 'Carteira', href: '/carteira' },
  { label: 'Perfil', href: '/perfil' },
  { label: 'Promoções', href: '/#promocoes' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { profile, loading } = useProfile()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 lg:px-8">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-card text-foreground transition-colors hover:bg-muted lg:hidden"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <BrandLogo />

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Botão Depósito/Saque — sempre visível e destacado */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-bold shadow-sm"
            onClick={() => document.dispatchEvent(new CustomEvent('open-deposit-modal'))}
          >
            <ArrowDownUp className="size-4" />
            <span className="hidden sm:inline">Depósito / Saque</span>
            <span className="sm:hidden">Dep. / Saque</span>
          </Button>

          {/* Carteira / Saldo clicável que leva para /carteira */}
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
          ) : profile ? (
            <a
              href="/carteira"
              title="Acessar Carteira"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-card px-3 py-2 text-sm font-bold text-white transition-all hover:border-primary/50 hover:bg-card/80 shadow-sm"
            >
              <Wallet className="size-4 text-primary" />
              <span>R$ {profile.balance.toFixed(2)}</span>
            </a>
          ) : (
            <a
              href="/carteira"
              title="Acessar Carteira"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-card px-3 py-2 text-sm font-bold text-white transition-all hover:border-primary/50 hover:bg-card/80 shadow-sm"
            >
              <Wallet className="size-4 text-primary" />
              <span>R$ 0,00</span>
            </a>
          )}
        </div>
      </div>

      {open ? (
        <nav
          aria-label="Navegação mobile"
          className="flex flex-col border-t border-border/60 bg-popover px-4 py-3 lg:hidden"
        >
          {/* Perfil na lateral superior esquerda dentro da aba */}
          {profile && (
            <div className="border-b border-white/10 pb-3 mb-2">
              <a
                href="/perfil"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="size-10 rounded-full bg-gradient-to-br from-primary to-purple-800 flex items-center justify-center text-white overflow-hidden text-sm font-black shrink-0 ring-2 ring-primary/40">
                  {profile.photo_url ? (
                    profile.photo_url.startsWith('preset:') ? (
                      <span>🐐</span>
                    ) : (
                      <img src={profile.photo_url} alt="Avatar" className="size-full object-cover" />
                    )
                  ) : (
                    <User className="size-5 text-white" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white truncate">
                    {profile.full_name || 'Meu Perfil'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {profile.email || 'Ver perfil completo'}
                  </span>
                </div>
              </a>
            </div>
          )}

          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}

          <div className="mt-2 border-t border-white/10 pt-2 pb-1">
            <button
              type="button"
              onClick={async () => {
                setOpen(false)
                await handleSignOut()
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 active:scale-[0.99]"
            >
              <LogOut className="size-4 text-red-400" />
              <span>Sair da conta</span>
            </button>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
