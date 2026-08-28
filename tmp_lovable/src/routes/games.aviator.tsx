import { createFileRoute } from '@tanstack/react-router'
import { AviatorGame } from '@/components/aviator/aviator-game'
import { GameShell } from '@/components/game-shell'

const title = 'Aviator · BodeBet'
const description =
  'Jogue Aviator no modo demonstração: aposte, acompanhe o multiplicador subir e retire antes do avião voar embora.'

export const Route = createFileRoute('/games/aviator')({
  head: () => ({
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
    ],
  }),
  component: AviatorPage,
})

function AviatorPage() {
  return (
    <GameShell
      title="Aviator"
      meta="Spribe · RTP 97%"
      howToPlay={[
        'Defina o valor e confirme a aposta durante a contagem regressiva.',
        'O avião decola e o multiplicador começa a subir a partir de 1.00x.',
        'Toque em retirar antes da explosão para levar aposta x multiplicador.',
        'Se preferir, configure a retirada automática em um multiplicador fixo.',
      ]}
    >
      <AviatorGame />
    </GameShell>
  )
}
