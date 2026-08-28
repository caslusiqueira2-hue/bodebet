import {
  Banana,
  Cake,
  Candy,
  Citrus,
  Crown,
  Gem,
  Grape,
  Heart,
  Hourglass,
  Circle,
  Lollipop,
  Sparkles,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const icons: Record<string, { Icon: LucideIcon; className: string }> = {
  crown: { Icon: Crown, className: 'text-amber-300 fill-amber-400/40' },
  hourglass: { Icon: Hourglass, className: 'text-rose-300' },
  ring: { Icon: Circle, className: 'text-yellow-200' },
  chalice: { Icon: Trophy, className: 'text-orange-300 fill-orange-400/30' },
  'gem-red': { Icon: Gem, className: 'text-red-400 fill-red-500/40' },
  'gem-purple': { Icon: Gem, className: 'text-purple-300 fill-purple-500/40' },
  'gem-green': { Icon: Gem, className: 'text-emerald-300 fill-emerald-500/40' },
  'gem-blue': { Icon: Gem, className: 'text-sky-300 fill-sky-500/40' },
  zeus: { Icon: Zap, className: 'text-yellow-200 fill-yellow-300/50' },
  heart: { Icon: Heart, className: 'text-red-400 fill-red-500/50' },
  candy: { Icon: Candy, className: 'text-pink-300' },
  lolly: { Icon: Lollipop, className: 'text-fuchsia-300' },
  cake: { Icon: Cake, className: 'text-amber-200' },
  grape: { Icon: Grape, className: 'text-violet-300 fill-violet-500/40' },
  watermelon: { Icon: Citrus, className: 'text-green-300' },
  plum: { Icon: Circle, className: 'text-blue-300 fill-blue-500/50' },
  banana: { Icon: Banana, className: 'text-yellow-200' },
  rainbow: { Icon: Sparkles, className: 'text-teal-200 fill-teal-300/40' },
}

/** Arte vetorial de cada símbolo dos slots em cascata. */
export function SymbolIcon({ id, className }: { id: string; className?: string }) {
  const entry = icons[id] ?? { Icon: Circle, className: 'text-muted-foreground' }
  const { Icon } = entry

  return (
    <Icon
      aria-hidden
      strokeWidth={1.6}
      className={cn(
        'drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]',
        entry.className,
        className ?? 'size-[58%]',
      )}
    />
  )
}
