import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/jogo-responsavel')({
  component: () => <Navigate to="/suporte" search={{ tab: 'jogo-responsavel' }} replace />,
})
