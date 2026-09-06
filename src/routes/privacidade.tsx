import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/privacidade')({
  component: () => <Navigate to="/suporte" search={{ tab: 'privacidade' }} replace />,
})
