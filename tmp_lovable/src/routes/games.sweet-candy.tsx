import { createFileRoute } from '@tanstack/react-router'
import { GameShell } from '@/components/game-shell'
import { TumbleSlotGame } from '@/components/tumble-slot/tumble-slot-game'
import { sweetCandyConfig } from '@/lib/tumble-slot-engine'

const title = 'Sweet Candy · BodeBet'
const description =
  'Jogue Sweet Candy no modo demonstração: doces em cascata, pagamento por quantidade em grade 6x5 e rodadas grátis com o pirulito arco-íris.'

export const Route = createFileRoute('/games/sweet-candy')({
  head: () => ({
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: SweetCandyPage,
})

function SweetCandyPage() {
  return (
    <GameShell
      title="Sweet Candy"
      meta="Pragmatic · RTP 96,4%"
      howToPlay={[
        'Defina a aposta e gire: os prêmios saem por quantidade, em qualquer posição.',
        '8 ou mais doces iguais na grade pagam de acordo com a tabela.',
        'Os doces premiados somem e novos caem, encadeando quedas em sequência.',
        '4 ou mais pirulitos arco-íris liberam 10 rodadas grátis.',
      ]}
    >
      <TumbleSlotGame
        config={sweetCandyConfig}
        cabinet="bg-gradient-to-b from-[#2a1030] via-[#1d0d22] to-[#0d0710]"
      />
    </GameShell>
  )
}
