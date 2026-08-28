import Image from '@/components/ui/image'
import Link from '@/components/ui/nav-link'
import { Play, Users } from 'lucide-react'
import type { Game } from '@/lib/casino-data'
import { cn } from '@/lib/utils'

const badgeStyles: Record<NonNullable<Game['badge']>, string> = {
  novo: 'bg-primary text-primary-foreground',
  quente: 'bg-accent text-accent-foreground',
  exclusivo: 'bg-secondary text-secondary-foreground',
}

export function GameCard({ game }: { game: Game }) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-border/60 bg-card transition-colors hover:border-primary/60">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={game.image || '/placeholder.svg'}
          alt={`Capa do jogo ${game.name}`}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {game.badge ? (
          <span
            className={cn(
              'absolute top-2 left-2 rounded-md px-2 py-0.5 text-[0.65rem] font-bold tracking-wide uppercase',
              badgeStyles[game.badge],
            )}
          >
            {game.badge}
          </span>
        ) : null}

        <div className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play className="size-5 fill-current" />
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <h3 className="truncate text-sm font-semibold">
          {game.href ? (
            <Link href={game.href} className="outline-none after:absolute after:inset-0">
              {game.name}
            </Link>
          ) : (
            game.name
          )}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{game.provider}</span>
          <span className="flex shrink-0 items-center gap-1">
            <Users className="size-3" />
            {game.players.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
    </article>
  )
}
