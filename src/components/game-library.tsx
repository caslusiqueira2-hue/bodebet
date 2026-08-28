
import { useMemo, useState } from 'react'
import { GameCard } from '@/components/game-card'
import { categories, games, type GameCategoryId } from '@/lib/casino-data'
import { cn } from '@/lib/utils'

export function GameLibrary() {
  const [active, setActive] = useState<GameCategoryId | 'todos'>('todos')

  const visibleGames = useMemo(
    () => (active === 'todos' ? games : games.filter((game) => game.category === active)),
    [active],
  )

  return (
    <section id="jogos" aria-labelledby="jogos-titulo" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="jogos-titulo" className="font-display text-2xl font-bold">
          Jogos em alta
        </h2>
        <div className="no-scrollbar -mx-1 flex max-w-full items-center gap-2 overflow-x-auto px-1">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActive(category.id)}
              aria-pressed={active === category.id}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                active === category.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground',
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  )
}
