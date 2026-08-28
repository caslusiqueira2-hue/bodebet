import { BrandLogo } from '@/components/brand-logo'

const columns = [
  {
    title: 'Cassino',
    links: ['Slots', 'Ao vivo', 'Crash games', 'Originais', 'Provedores'],
  },
  {
    title: 'Conta',
    links: ['Depósito via Pix', 'Saques', 'Programa VIP', 'Indique e ganhe'],
  },
  {
    title: 'Suporte',
    links: ['Central de ajuda', 'Termos de uso', 'Política de privacidade', 'Jogo responsável'],
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
              Plataforma de entretenimento com cassino online, jogos ao vivo e originais.
              Pagamentos via Pix em até 5 minutos.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Proibido para menores de 18 anos. Jogue com responsabilidade.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BodeBet. Demonstração de interface.
          </p>
        </div>
      </div>
    </footer>
  )
}
