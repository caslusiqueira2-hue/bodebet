import { cn } from '@/lib/utils'
import logoAsset from '@/assets/bodebet-logo.asset.json'

export function BrandLogo({ className }: { className?: string }) {
  return (
    <a href="/" className={cn('flex shrink-0 items-center gap-2', className)}>
      <img
        src={logoAsset.url}
        alt="BodeBet Slots"
        className="size-9 rounded-lg object-cover"
        width={36}
        height={36}
      />
      <span className="font-display text-lg font-extrabold tracking-tight">
        Bode<span className="text-primary">Bet</span>
      </span>
    </a>
  )
}
