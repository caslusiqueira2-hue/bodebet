import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/termos')({
  component: () => <Navigate to="/suporte" search={{ tab: 'termos' }} replace />,
})
