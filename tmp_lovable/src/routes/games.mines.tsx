import { createFileRoute } from '@tanstack/react-router'
import { GameShell } from '@/components/game-shell'
import { MinesGame } from '@/components/mines/mines-game'

const title = 'Mines · BodeBet'
const description =
  'Jogue Mines no modo demonstração: 25 casas, minas configuráveis, multiplicador crescente e saque a qualquer momento.'

export const Route = createFileRoute('/games/mines')({
  head: () => ({
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
    ],
  }),
  component: MinesPage,
})

function MinesPage() {
  return (
    <GameShell
      title="Mines"
      meta="BodeBet Originals · RTP 99%"
      howToPlay={[
        'Defina o valor da aposta e quantas minas ficam escondidas nas 25 casas.',
        'Comece a rodada e abra as casas uma a uma — cada gema aumenta o multiplicador.',
        'Saque quando quiser: o valor exibido no botão já é o seu.',
        'Se abrir uma mina, a rodada acaba e a aposta é perdida.',
        'Quanto mais minas no tabuleiro, mais alto o multiplicador por gema — e maior o risco.',
      ]}
    >
      <MinesGame />
    </GameShell>
  )
}
