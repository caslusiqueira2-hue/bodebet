
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { banners } from '@/lib/casino-data'
import { cn } from '@/lib/utils'

export function PromoCarousel() {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (isPaused) return
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % banners.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [isPaused])

  const banner = banners[index]

  const nextBanner = () => {
    setIndex((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    setIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleBannerClick = (href?: string) => {
    if (!href) return
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (href.includes('#')) {
      const [path, hash] = href.split('#')
      navigate({ to: path as any }).then(() => {
        setTimeout(() => {
          const el = document.getElementById(hash)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      })
      return
    }
    navigate({ to: href as any })
  }

  return (
    <section id="promocoes" aria-label="Promoções em destaque" className="flex flex-col gap-3">
      <div
        className="group relative isolate overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl transition-all cursor-pointer aspect-[16/9] sm:aspect-[21/9] max-h-[380px] select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => handleBannerClick(banner.href)}
      >
        <img
          key={banner.id}
          src={banner.image}
          alt={banner.title}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          loading="eager"
        />

        {/* Setas de navegação direta */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            prevBanner()
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all active:scale-95 shadow-lg"
          aria-label="Banner anterior"
        >
          <ChevronLeft className="size-5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            nextBanner()
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all active:scale-95 shadow-lg"
          aria-label="Próximo banner"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Indicadores de slide */}
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
              'h-2 rounded-full transition-all duration-300',
              itemIndex === index
                ? 'w-8 bg-primary shadow-sm shadow-primary/50'
                : 'w-2.5 bg-muted/60 hover:bg-muted',
            )}
          />
        ))}
      </div>
    </section>
  )
}
