import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/games/fortune-tiger')({
  component: () => <Navigate to="/games/pgsoft" search={{ game: 'fortune-tiger' }} replace />,
})

