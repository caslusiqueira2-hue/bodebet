import { cn } from '@/lib/utils'
import { Gamepad2 } from 'lucide-react'

export function BrandLogo({ className }: { className?: string }) {
  return (
    <a href="/" className={cn('flex shrink-0 items-center gap-2', className)}>
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
        <Gamepad2 className="size-6" />
      </div>
      <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
        Bode<span className="text-primary">Bet</span>
      </span>
    </a>
  )
}
