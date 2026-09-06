import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/ajuda')({
  component: () => <Navigate to="/suporte" search={{ tab: 'ajuda' }} replace />,
})
