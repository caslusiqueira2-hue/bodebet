import { createFileRoute } from '@tanstack/react-router'
import { GameLibrary } from '@/components/game-library'
import { MobileTabbar } from '@/components/mobile-tabbar'
import { PromoCarousel } from '@/components/promo-carousel'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { WinnersTicker } from '@/components/winners-ticker'

const title = 'BodeBet — Cassino Online, Slots e Jogos Originais'
const description =
  'Cassino online com slots, jogos ao vivo, crash games e originais como Plinko e Mines. Bônus de boas-vindas de até 500% no primeiro depósito.'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 pt-6 pb-28 lg:px-8 lg:pb-16">
        <PromoCarousel />
        <WinnersTicker />
        <GameLibrary />
      </main>

      <SiteFooter />
      <MobileTabbar />
    </div>
  )
}
