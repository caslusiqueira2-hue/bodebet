
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { LogOut, Menu, Search, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand-logo'
import { useProfile } from '@/hooks/use-profile'
import { supabase } from '@/integrations/supabase/client'

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
    void navigate({ to: '/auth', replace: true })
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
          {loading ? null : profile ? (
            <>
              <span className="hidden items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-semibold sm:flex">
                <Wallet className="size-4" />
                R$ {profile.balance.toFixed(2)}
              </span>
              <span className="hidden text-sm font-medium text-muted-foreground md:inline">
                {profile.display_name}
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
            <>
              <Button
                variant="ghost"
                className="h-10 px-4 text-sm font-semibold"
                onClick={() => navigate({ to: '/auth' })}
              >
                Entrar
              </Button>
              <Button
                className="h-10 gap-2 px-4 text-sm font-semibold"
                onClick={() => navigate({ to: '/auth' })}
              >
                <Wallet className="size-4" />
                Cadastrar
              </Button>
            </>
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
