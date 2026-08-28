export type Game = {
  id: string
  name: string
  provider: string
  image: string
  category: GameCategoryId
  players: number
  badge?: 'novo' | 'quente' | 'exclusivo'
  rtp: number
  /** Presente apenas nos jogos já jogáveis dentro da plataforma. */
  href?: string
}

export type GameCategoryId = 'slots' | 'crash' | 'ao-vivo' | 'originais'

export const categories: { id: GameCategoryId | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'slots', label: 'Slots' },
  { id: 'crash', label: 'Crash' },
  { id: 'ao-vivo', label: 'Ao vivo' },
  { id: 'originais', label: 'Originais' },
]

export const games: Game[] = [
  {
    id: 'fortune-tiger',
    name: 'Fortune Tiger',
    provider: 'PG Soft',
    image: '/games/fortune-tiger.png',
    category: 'slots',
    players: 4812,
    badge: 'quente',
    rtp: 96.81,
    href: '/games/fortune-tiger',
  },
  {
    id: 'aviator',
    name: 'Aviator',
    provider: 'Spribe',
    image: '/games/aviator.png',
    category: 'crash',
    players: 9134,
    badge: 'quente',
    rtp: 97,
    href: '/games/aviator',
  },
  {
    id: 'gates-olympus',
    name: 'Gates of Olympus',
    provider: 'Pragmatic',
    image: '/games/gates-olympus.png',
    category: 'slots',
    players: 3277,
    badge: 'quente',
    rtp: 96.5,
    href: '/games/gates-of-olympus',
  },
  {
    id: 'mines',
    name: 'Mines',
    provider: 'BodeBet Originals',
    image: '/games/mines.png',
    category: 'originais',
    players: 2148,
    badge: 'exclusivo',
    rtp: 99,
    href: '/games/mines',
  },
  {
    id: 'plinko',
    name: 'Plinko',
    provider: 'BodeBet Originals',
    image: '/games/plinko.png',
    category: 'originais',
    players: 1502,
    badge: 'novo',
    rtp: 99,
    href: '/games/plinko',
  },
  {
    id: 'penalty-lucky',
    name: 'Penalty Lucky',
    provider: 'BodeBet Originals',
    image: '/games/penalty-lucky.png',
    category: 'originais',
    players: 1184,
    badge: 'novo',
    rtp: 97,
    href: '/games/penalty-lucky',
  },
  {
    id: 'blackjack',
    name: 'Blackjack VIP',
    provider: 'Evolution',
    image: '/games/blackjack.png',
    category: 'ao-vivo',
    players: 964,
    rtp: 99.5,
  },
  {
    id: 'sweet-candy',
    name: 'Sweet Candy',
    provider: 'Pragmatic',
    image: '/games/sweet-candy.png',
    category: 'slots',
    players: 2760,
    badge: 'novo',
    rtp: 96.4,
    href: '/games/sweet-candy',
  },
]

export const banners = [
  {
    id: 'bonus',
    eyebrow: 'Bônus de boas-vindas',
    title: 'Até 500% no primeiro depósito',
    description: 'Deposite a partir de R$ 20 e receba giros grátis nos slots em destaque.',
    cta: 'Resgatar bônus',
    image: '/banners/welcome-bonus.png',
  },
  {
    id: 'novos-jogos',
    eyebrow: 'Novidades na plataforma',
    title: 'Gates of Olympus, Plinko e Sweet Candy',
    description: 'Três lançamentos jogáveis no modo demonstração, com quedas em cascata e multiplicadores.',
    cta: 'Jogar agora',
    image: '/banners/new-games.png',
  },
  {
    id: 'live',
    eyebrow: 'Cassino ao vivo',
    title: 'Mesas com dealers reais 24h',
    description: 'Blackjack, bac bo e game shows transmitidos em tempo real do estúdio.',
    cta: 'Entrar nas mesas',
    image: '/banners/live-casino.png',
  },
]

export const recentWins = [
  { player: 'lu***23', game: 'Aviator', amount: 12480.5 },
  { player: 'mar***os', game: 'Fortune Tiger', amount: 8210.0 },
  { player: 'pe***dro', game: 'Gates of Olympus', amount: 5677.9 },
  { player: 'ana***91', game: 'Mines', amount: 3145.2 },
  { player: 'jo***ao', game: 'Sweet Candy', amount: 2890.0 },
  { player: 'ka***ol', game: 'Plinko', amount: 1740.75 },
  { player: 'ti***go', game: 'Blackjack VIP', amount: 1520.0 },
  { player: 'be***ta', game: 'Sweet Candy', amount: 998.4 },
]

export { formatBRL } from '@/lib/game-format'
