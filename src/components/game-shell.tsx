import type { ReactNode } from 'react'
import Link from '@/components/ui/nav-link'
import { ChevronLeft, Info } from 'lucide-react'
import { MobileTabbar } from '@/components/mobile-tabbar'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

type GameShellProps = {
  title: string
  /** Linha de metadados abaixo do título, ex. "BodeBet Originals · RTP 99%". */
  meta: string
  howToPlay: string[]
  children: ReactNode
}

/**
 * Moldura comum a todas as páginas de jogo: navegação, cabeçalho com RTP,
 * aviso do modo demonstração e o bloco "Como jogar".
 */
export function GameShell({ title, meta, howToPlay, children }: GameShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 pb-24 lg:px-8 lg:pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className="flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-3.5" />
              Voltar ao cassino
            </Link>
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{meta} · modo demonstração</p>
          </div>

          <p className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-xs text-muted-foreground">
            <Info className="size-4 shrink-0 text-accent" />
            Saldo fictício de R$ 1.000. Nenhum valor real é movimentado.
          </p>
        </div>

        {children}

        <section
          aria-labelledby="como-jogar"
          className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5"
        >
          <h2 id="como-jogar" className="font-display text-base font-bold">
            Como jogar
          </h2>
          <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
            {howToPlay.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </section>
      </main>

      <SiteFooter />
      <MobileTabbar />
    </div>
  )
}
