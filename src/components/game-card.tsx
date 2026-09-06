import Link from '@/components/ui/nav-link'
import { Play, Users } from 'lucide-react'
import type { Game } from '@/lib/casino-data'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const badgeStyles: Record<NonNullable<Game['badge']>, string> = {
  novo: 'bg-primary text-primary-foreground',
  quente: 'bg-accent text-accent-foreground',
  exclusivo: 'bg-secondary text-secondary-foreground',
}

// Fallback gradient backgrounds por jogo para quando a imagem da CDN falha
const fallbackGradients: Record<string, string> = {
  'fortune-tiger': 'from-orange-600 via-red-700 to-yellow-800',
  'aviator': 'from-red-700 via-rose-800 to-slate-900',
  'mines': 'from-emerald-700 via-green-800 to-teal-900',
  'double': 'from-rose-600 via-red-700 to-zinc-900',
  'fortune-ox': 'from-amber-600 via-orange-700 to-red-900',
  'fortune-mouse': 'from-rose-600 via-red-700 to-pink-900',
  'fortune-rabbit': 'from-amber-500 via-yellow-600 to-orange-800',
  'fortune-dragon': 'from-emerald-600 via-teal-700 to-cyan-900',
  'double-fortune': 'from-red-600 via-rose-700 to-amber-800',
  'ganesha-gold': 'from-amber-500 via-yellow-600 to-red-800',
  'jungle-delight': 'from-green-600 via-emerald-700 to-lime-900',
  'bikini-paradise': 'from-cyan-500 via-blue-600 to-indigo-800',
  'dragon-tiger-luck': 'from-orange-600 via-amber-700 to-red-900',
}

const gameEmoji: Record<string, string> = {
  'fortune-tiger': '🐯',
  'aviator': '✈️',
  'mines': '💣',
  'double': '🎲',
  'fortune-ox': '🐂',
  'fortune-mouse': '🐭',
  'fortune-rabbit': '🐰',
  'fortune-dragon': '🐲',
  'double-fortune': '🧧',
  'ganesha-gold': '🐘',
  'jungle-delight': '🌴',
  'bikini-paradise': '🏖️',
  'dragon-tiger-luck': '🐉',
}

export function GameCard({ game }: { game: Game }) {
  const [imgError, setImgError] = useState(false)
  const gradient = fallbackGradients[game.id] || 'from-zinc-700 via-zinc-800 to-zinc-900'
  const emoji = gameEmoji[game.id] || '🎮'

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border/60 bg-card transition-colors hover:border-primary/60">
      <div className="relative aspect-[3/4] overflow-hidden">
        {!imgError ? (
          <img
            src={game.image}
            alt={`Capa do jogo ${game.name}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          // Fallback: gradient + emoji quando a imagem não carrega
          <div className={`absolute inset-0 bg-gradient-to-b ${gradient} flex flex-col items-center justify-center gap-3`}>
            <span className="text-5xl">{emoji}</span>
            <span className="text-white/70 text-sm font-semibold text-center px-2">{game.name}</span>
          </div>
        )}

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

        <div className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
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
