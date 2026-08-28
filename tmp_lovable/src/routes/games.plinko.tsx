import { createFileRoute } from '@tanstack/react-router'
import { GameShell } from '@/components/game-shell'
import { PlinkoGame } from '@/components/plinko/plinko-game'

const title = 'Plinko · BodeBet'
const description =
  'Jogue Plinko no modo demonstração: escolha risco e fileiras, solte a bola pelos pinos e veja em qual multiplicador ela cai.'

export const Route = createFileRoute('/games/plinko')({
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
  component: PlinkoPage,
})

function PlinkoPage() {
  return (
    <GameShell
      title="Plinko"
      meta="BodeBet Originals · RTP 99%"
      howToPlay={[
        'Escolha o valor da aposta, o nível de risco e a quantidade de fileiras.',
        'Solte a bola: em cada pino ela desvia para a esquerda ou direita com a mesma chance.',
        'O multiplicador da casa em que a bola parar é aplicado sobre a aposta.',
        'Risco alto concentra os prêmios grandes nas bordas; risco baixo paga com mais frequência.',
      ]}
    >
      <PlinkoGame />
    </GameShell>
  )
}
