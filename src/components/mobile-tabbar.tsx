import { Dices, Gift, Sparkles, User, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MobileTabbarProps {
  isHidden?: boolean
}

export function MobileTabbar({ isHidden }: MobileTabbarProps = {}) {
  const [currentPath, setCurrentPath] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
      const handleLocation = () => setCurrentPath(window.location.pathname)
      window.addEventListener('popstate', handleLocation)

      const checkModals = () => {
        const hasModal = 
          document.body.classList.contains('modal-open') ||
          document.body.getAttribute('data-deposit-open') === 'true' ||
          !!document.querySelector('.deposit-modal-overlay') ||
          document.body.style.overflow === 'hidden'
        setIsModalOpen(hasModal)
      }

      checkModals()
      const observer = new MutationObserver(checkModals)
      observer.observe(document.body, { attributes: true, childList: true, subtree: true })

      return () => {
        window.removeEventListener('popstate', handleLocation)
        observer.disconnect()
      }
    }
  }, [])

  if (isHidden || isModalOpen) {
    return null
  }

  if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/games'))) {
    return null
  }

  const tabs = [
    { label: 'Cassino', icon: Dices, href: '/#jogos', active: currentPath === '/' || currentPath === '' },
    { label: 'Slots PG', icon: Sparkles, href: '/#jogos', active: false },
    { label: 'Bônus', icon: Gift, href: '/#promocoes', active: false },
    { label: 'Carteira', icon: Wallet, href: '/carteira', active: currentPath === '/carteira' },
    { label: 'Perfil', icon: User, href: '/perfil', active: currentPath === '/perfil' },
  ]

  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-popover/95 backdrop-blur-xl lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <ul className="flex items-stretch">
        {tabs.map((tab) => (
          <li key={tab.label} className="flex-1">
            <a
              href={tab.href}
              aria-current={tab.active ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 py-2 text-[0.68rem] font-semibold transition-colors ${
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
