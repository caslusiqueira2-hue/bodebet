import { cn } from '@/lib/utils'

export function BrandLogo({ className }: { className?: string }) {
  return (
    <a href="/" className={cn('flex shrink-0 items-center', className)}>
      <img
        src="/logo.jpg"
        alt="BodeBet"
        className="h-10 w-auto object-contain"
      />
    </a>
  )
}
