import { createFileRoute } from '@tanstack/react-router'
import { GameShell } from '@/components/game-shell'
import { TumbleSlotGame } from '@/components/tumble-slot/tumble-slot-game'
import { olympusConfig } from '@/lib/tumble-slot-engine'

const title = 'Gates of Olympus · BodeBet'
const description =
  'Jogue Gates of Olympus no modo demonstração: grade 6x5, pagamento por quantidade, quedas em cascata e orbes de multiplicador de até 100x.'

export const Route = createFileRoute('/games/gates-of-olympus')({
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
  component: OlympusPage,
})

function OlympusPage() {
  return (
    <GameShell
      title="Gates of Olympus"
      meta="Pragmatic · RTP 96,5%"
      howToPlay={[
        'Escolha o valor da aposta e gire — não existem linhas de pagamento.',
        '8 ou mais símbolos iguais em qualquer posição da grade formam prêmio.',
        'Os símbolos premiados somem, novos caem e as quedas continuam enquanto houver combinação.',
        'Orbes de multiplicador podem cair durante as quedas: eles somam e multiplicam o prêmio da rodada.',
        '4 ou mais raios de Zeus liberam rodadas grátis.',
      ]}
    >
      <TumbleSlotGame
        config={olympusConfig}
        cabinet="bg-gradient-to-b from-[#1b1436] via-[#141024] to-[#0b0812]"
      />
    </GameShell>
  )
}
