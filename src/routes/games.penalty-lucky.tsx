import { createFileRoute } from '@tanstack/react-router'
import { GameShell } from '@/components/game-shell'
import { PenaltyGame } from '@/components/penalty/penalty-game'

const title = 'Penalty Lucky · BodeBet'
const description =
  'Penalty Lucky no modo demonstração: escolha o canto da cobrança, tente furar o goleiro e receba multiplicadores de até 2,42x com saldo fictício.'

export const Route = createFileRoute('/games/penalty-lucky')({
  head: () => ({
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
    ],
  }),
  component: PenaltyPage,
})

function PenaltyPage() {
  return (
    <GameShell
      title="Penalty Lucky"
      meta="BodeBet Originals · RTP 97%"
      howToPlay={[
        'Defina o valor da aposta com o seletor de fichas.',
        'Escolha um dos cinco cantos do gol — cada canto tem seu multiplicador.',
        'Confirme o chute: o goleiro escolhe um lado para pular.',
        'Se a bola entrar, você recebe a aposta multiplicada pelo canto escolhido.',
        'Ângulos altos pagam mais, mas a bola sai com mais frequência.',
      ]}
    >
      <PenaltyGame />
    </GameShell>
  )
}
