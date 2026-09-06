import { BrandLogo } from '@/components/brand-logo'
import Link from '@/components/ui/nav-link'

type FooterColumn = {
  title: string
  links: { label: string; href: string }[]
}

const columns: FooterColumn[] = [
  {
    title: 'Cassino',
    links: [
      { label: 'Slots PG', href: '/#jogos' },
      { label: 'Crash games', href: '/#jogos' },
      { label: 'Originais', href: '/#jogos' },
      { label: 'Mines', href: '/games/mines' },
      { label: 'Aviator', href: '/games/aviator' },
      { label: 'Double', href: '/games/double' },
    ],
  },
  {
    title: 'Conta',
    links: [
      { label: 'Depósito via Pix', href: '/carteira' },
      { label: 'Saques', href: '/carteira' },
      { label: 'Programa VIP', href: '/suporte?tab=ajuda' },
      { label: 'Indique e ganhe', href: '/suporte?tab=ajuda' },
    ],
  },
  {
    title: 'Suporte',
    links: [
      { label: 'Central de ajuda', href: '/suporte?tab=ajuda' },
      { label: 'Termos de uso', href: '/suporte?tab=termos' },
      { label: 'Política de privacidade', href: '/suporte?tab=privacidade' },
      { label: 'Jogo responsável', href: '/suporte?tab=jogo-responsavel' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <BrandLogo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Plataforma de entretenimento com slots PG Soft, crash games e originais exclusivos.
              Pagamentos e saques instantâneos via Pix.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-white">{column.title}</h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
              18+
            </span>
            <span>
              Proibido para menores de 18 anos. Aposta não é investimento. Jogue com moderação.{' '}
              <Link href="/suporte?tab=jogo-responsavel" className="text-rose-400 hover:underline font-semibold">
                Jogo Responsável
              </Link>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BodeBet. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
