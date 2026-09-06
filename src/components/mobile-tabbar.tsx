import { Dices, Gift, Sparkles, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'

export function MobileTabbar() {
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  const tabs = [
    { label: 'Cassino', icon: Dices, href: '/#jogos', active: currentPath === '/' || currentPath === '' },
    { label: 'Slots PG', icon: Sparkles, href: '/#jogos', active: false },
    { label: 'Bônus', icon: Gift, href: '/#promocoes', active: false },
    { label: 'Carteira', icon: Wallet, href: '/carteira', active: currentPath === '/carteira' },
  ]

  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-popover/95 backdrop-blur-xl lg:hidden"
    >
      <ul className="flex items-stretch">
        {tabs.map((tab) => (
          <li key={tab.label} className="flex-1">
            <a
              href={tab.href}
              aria-current={tab.active ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[0.68rem] font-semibold transition-colors ${
                tab.active ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="size-5" />
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
