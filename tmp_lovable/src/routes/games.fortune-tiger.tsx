import { createFileRoute } from '@tanstack/react-router'
import { FortuneTigerGame } from '@/components/fortune-tiger/fortune-tiger-game'
import { GameShell } from '@/components/game-shell'

const title = 'Fortune Tiger · BodeBet'
const description =
  'Jogue Fortune Tiger no modo demonstração: 3 rolos, 5 linhas de pagamento, tigre curinga e giros grátis.'

export const Route = createFileRoute('/games/fortune-tiger')({
  head: () => ({
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
    ],
  }),
  component: FortuneTigerPage,
})

function FortuneTigerPage() {
  return (
    <GameShell
      title="Fortune Tiger"
      meta="PG Soft · RTP 96,58%"
      howToPlay={[
        'Escolha o valor da aposta e toque em girar.',
        'Três símbolos iguais em qualquer uma das 5 linhas formam prêmio — o tigre é curinga e completa combinações.',
        'Todas as linhas premiadas do mesmo giro somam no prêmio final.',
        'De vez em quando o tigre libera um giro grátis depois de uma rodada seca.',
      ]}
    >
      <FortuneTigerGame />
    </GameShell>
  )
}
