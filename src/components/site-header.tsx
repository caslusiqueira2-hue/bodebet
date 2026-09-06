import { useState } from 'react'
import { ArrowDownUp, LogOut, Menu, Search, Wallet, X } from 'lucide-react'
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
  { label: 'Promoções', href: '/#promocoes' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { profile, loading } = useProfile()

  async function handleSignOut() {
    await supabase.auth.signOut()
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
          <button
            type="button"
            className="hidden size-9 items-center justify-center rounded-lg border border-white/10 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
            aria-label="Buscar jogos"
          >
            <Search className="size-4" />
          </button>

          {/* Botão Depósito/Saque — sempre visível e destacado */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-bold shadow-sm"
            onClick={() => document.dispatchEvent(new CustomEvent('open-deposit-modal'))}
          >
            <ArrowDownUp className="size-4" />
            <span className="hidden sm:inline">Depósito / Saque</span>
            <span className="sm:hidden">Dep.</span>
          </Button>

          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
          ) : profile ? (
            <>
              <div className="flex items-center gap-2">
                {/* Carteira / Saldo clicável que leva para /carteira */}
                <a
                  href="/carteira"
                  title="Acessar Carteira"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-card px-3 py-2 text-sm font-bold text-white transition-all hover:border-primary/50 hover:bg-card/80 shadow-sm"
                >
                  <Wallet className="size-4 text-primary" />
                  <span>R$ {profile.balance.toFixed(2)}</span>
                </a>

                <Button
                  variant="default"
                  className="hidden sm:inline-flex h-9 gap-1.5 px-4 text-xs font-black tracking-wide uppercase bg-safe text-black hover:bg-yellow-400 shadow-md transition-transform active:scale-95"
                  onClick={() => {
                    document.dispatchEvent(new CustomEvent('open-deposit-modal'))
                  }}
                >
                  + Depositar
                </Button>
              </div>

              {/* Botão Sair visível e bem contrastado */}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 transition-colors hover:border-white/20 hover:bg-white/15 hover:text-white"
                title="Sair da conta"
              >
                <LogOut className="size-3.5 text-red-400" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 transition-colors hover:border-white/20 hover:bg-white/15 hover:text-white"
              title="Sair da conta"
            >
              <LogOut className="size-3.5 text-red-400" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>

      {open ? (
        <nav
          aria-label="Navegação mobile"
          className="flex flex-col border-t border-border/60 bg-popover px-4 py-2 lg:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  )
}
