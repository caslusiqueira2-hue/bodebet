import { useEffect, useState } from 'react'
import { TrendingUp, Flame } from 'lucide-react'
import { formatBRL } from '@/lib/casino-data'

type WinItem = {
  id: string
  player: string
  game: string
  icon: string
  amount: number
  multiplier: number
}

const PLAYERS = [
  'gab***10', 'mar***92', 'luc***74', 'ana***31', 'gui***88',
  'raf***15', 'fel***09', 'mat***45', 'car***63', 'bia***27',
  'leo***91', 'bru***18', 'vin***50', 'tia***83', 'pat***22',
  'rod***37', 'thi***64', 'edu***89', 'ale***71', 'cam***16',
  'fer***03', 'ren***58', 'die***21', 'sam***84', 'let***95'
]

const GAMES = [
  { name: 'Fortune Tiger', icon: '🐯' },
  { name: 'Aviator', icon: '✈️' },
  { name: 'Mines', icon: '💣' },
  { name: 'Double', icon: '🎲' },
  { name: 'Fortune Ox', icon: '🐂' },
  { name: 'Fortune Rabbit', icon: '🐰' },
  { name: 'Fortune Mouse', icon: '🐭' },
  { name: 'Fortune Dragon', icon: '🐲' },
  { name: 'Double Fortune', icon: '🧧' },
  { name: 'Ganesha Gold', icon: '🐘' },
]

function generateRandomWin(): WinItem {
  const player = PLAYERS[Math.floor(Math.random() * PLAYERS.length)]
  const gameObj = GAMES[Math.floor(Math.random() * GAMES.length)]
  
  // Distribuição realista de prêmios
  const rand = Math.random()
  let amount = 0
  let multiplier = 2

  if (rand < 0.65) {
    // Prêmios comuns: R$ 18 a R$ 280
    amount = Number((Math.random() * 260 + 20).toFixed(2))
    multiplier = Number((Math.random() * 4 + 1.5).toFixed(1))
  } else if (rand < 0.92) {
    // Prêmios médios: R$ 320 a R$ 1.650
    amount = Number((Math.random() * 1330 + 320).toFixed(2))
    multiplier = Number((Math.random() * 15 + 5).toFixed(1))
  } else {
    // Grandes forras: R$ 2.000 a R$ 9.800
    amount = Number((Math.random() * 7800 + 2000).toFixed(2))
    multiplier = Number((Math.random() * 80 + 20).toFixed(1))
  }

  return {
    id: `${Date.now()}-${Math.random()}`,
    player,
    game: gameObj.name,
    icon: gameObj.icon,
    amount,
    multiplier,
  }
}

const INITIAL_WINS: WinItem[] = [
  { id: '1', player: 'lu***23', game: 'Aviator', icon: '✈️', amount: 1248.5, multiplier: 12.4 },
  { id: '2', player: 'mar***os', game: 'Fortune Tiger', icon: '🐯', amount: 820.0, multiplier: 10.0 },
  { id: '3', player: 'gab***10', game: 'Double', icon: '🎲', amount: 450.0, multiplier: 2.0 },
  { id: '4', player: 'ana***91', game: 'Mines', icon: '💣', amount: 314.2, multiplier: 4.8 },
  { id: '5', player: 'rod***88', game: 'Fortune Ox', icon: '🐂', amount: 680.0, multiplier: 8.5 },
  { id: '6', player: 'ka***ol', game: 'Fortune Rabbit', icon: '🐰', amount: 240.0, multiplier: 3.2 },
  { id: '7', player: 'be***ta', game: 'Fortune Mouse', icon: '🐭', amount: 198.4, multiplier: 2.5 },
]

export function WinnersTicker() {
  const [wins, setWins] = useState<WinItem[]>(INITIAL_WINS)

  useEffect(() => {
    // Adiciona novo prêmio a cada 2.5 a 4.5 segundos aleatoriamente
    let timer: NodeJS.Timeout

    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * 2000) + 2500
      timer = setTimeout(() => {
        const newWin = generateRandomWin()
        setWins((prev) => [newWin, ...prev.slice(0, 14)])
        scheduleNext()
      }, delay)
    }

    scheduleNext()

    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      aria-label="Últimos ganhadores"
      className="flex flex-col sm:flex-row sm:items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-card/90 via-card to-card/95 p-3.5 shadow-lg backdrop-blur-md"
    >
      {/* Badge Ao Vivo */}
      <div className="flex shrink-0 items-center gap-2 pr-3 border-b sm:border-b-0 sm:border-r border-white/10 pb-2 sm:pb-0">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="flex items-center gap-1.5 text-xs font-black tracking-wider text-emerald-400 uppercase">
          <TrendingUp className="size-4" />
          Últimos Prêmios
        </span>
      </div>

      {/* Ticker carrossel em tempo real */}
      <div className="no-scrollbar flex flex-1 items-center gap-2.5 overflow-x-auto py-0.5">
        {wins.map((win, idx) => (
          <div
            key={win.id}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-1.5 transition-all duration-500 ${
              idx === 0
                ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-[1.02]'
                : 'border-white/5 bg-background/40 hover:border-white/20'
            }`}
          >
            <span className="text-base">{win.icon}</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground font-medium">
                <span>{win.player}</span>
                <span>•</span>
                <span className="text-white/80">{win.game}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-emerald-400 tabular-nums">
                  {formatBRL(win.amount)}
                </span>
                <span className="rounded bg-white/10 px-1 py-0.2 text-[0.6rem] font-bold text-amber-300">
                  {win.multiplier}x
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
