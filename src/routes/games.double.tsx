import { createFileRoute } from '@tanstack/react-router';
import { GameShell } from '@/components/game-shell';
import { DoubleGame } from '@/components/double/double-game';

export const Route = createFileRoute('/games/double')({
  component: DoublePage,
});

function DoublePage() {
  return (
    <GameShell
      title="Double"
      meta="BodeBet Originals • RTP 98%"
      howToPlay={[
        'Escolha uma das 3 cores disponíveis: Vermelho, Preto ou Branco.',
        'As cores Vermelho e Preto pagam 2x o valor apostado.',
        'O Branco (ícone de Diamante) é raro e paga incríveis 14x a sua aposta!',
        'Clique em Começar Jogo e aguarde a roleta parar.',
      ]}
    >
      <DoubleGame />
    </GameShell>
  );
}

