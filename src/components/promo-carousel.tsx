
import { useEffect, useState } from 'react'
import Image from '@/components/ui/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { banners } from '@/lib/casino-data'
import { cn } from '@/lib/utils'

export function PromoCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % banners.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [])

  const banner = banners[index]

  return (
    <section id="promocoes" aria-label="Promoções em destaque" className="flex flex-col gap-3">
      <div className="relative isolate overflow-hidden rounded-2xl border border-border/60 bg-card">
        <Image
          key={banner.id}
          src={banner.image || '/placeholder.svg'}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover object-right opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />

        <div className="relative flex min-h-64 flex-col items-start justify-center gap-4 p-6 sm:min-h-72 sm:p-10 lg:max-w-2xl">
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            {banner.eyebrow}
          </span>
          <h1 className="font-display text-3xl leading-tight font-extrabold text-balance sm:text-5xl">
            {banner.title}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {banner.description}
          </p>
          <Button className="h-11 gap-2 px-5 text-sm font-semibold">
            {banner.cta}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Selecionar promoção">
        {banners.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={itemIndex === index}
            aria-label={item.title}
            onClick={() => setIndex(itemIndex)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              itemIndex === index ? 'w-8 bg-primary' : 'w-4 bg-muted hover:bg-secondary',
            )}
          />
        ))}
      </div>
    </section>
  )
}
