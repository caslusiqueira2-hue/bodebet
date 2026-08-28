
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowDownUp, LogOut, Menu, Search, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand-logo'
import { useProfile } from '@/hooks/use-profile'
import { supabase } from '@/lib/supabase'

const navLinks = [
  { label: 'Cassino', href: '/#jogos' },
  { label: 'Aviator', href: '/games/aviator' },
  { label: 'Plinko', href: '/games/plinko' },
  { label: 'Promoções', href: '/#promocoes' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { profile, loading } = useProfile()
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
  }


  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 lg:px-8">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
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
            className="hidden size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
            aria-label="Buscar jogos"
          >
            <Search className="size-5" />
          </button>

          {/* Botão Depósito/Saque — sempre visível ao lado da lupa quando logado */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary font-semibold"
            onClick={() => document.dispatchEvent(new CustomEvent('open-deposit-modal'))}
          >
            <ArrowDownUp className="size-4" />
            <span className="hidden sm:inline">Depósito / Saque</span>
            <span className="sm:hidden">Dep.</span>
          </Button>

            {loading ? (
              // Perfil ainda carregando — mostra spinner discreto
              <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
            ) : profile ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-semibold">
                    <Wallet className="size-4" />
                    R$ {profile.balance.toFixed(2)}
                  </span>
                  <Button
                    variant="default"
                    className="h-10 gap-2 px-4 text-sm font-semibold bg-safe text-black hover:bg-yellow-500"
                    onClick={() => {
                      document.dispatchEvent(new CustomEvent('open-deposit-modal'));
                    }}
                  >
                    + DEPOSITAR
                  </Button>
                </div>
                <span className="hidden text-sm font-medium text-muted-foreground md:inline">
                  Jogador
                </span>
                <Button
                  variant="ghost"
                  className="h-10 gap-2 px-3 text-sm font-semibold"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-4" />
                  Sair
                </Button>
              </>
            ) : (
              // Logado mas perfil nulo inesperado — botão de sair de segurança
              <Button
                variant="ghost"
                className="h-10 gap-2 px-3 text-sm font-semibold"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" />
                Sair
              </Button>
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
