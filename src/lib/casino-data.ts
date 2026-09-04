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

export type GameCategoryId = 'slots' | 'crash' | 'ao-vivo' | 'originais' | 'slots-pg'

export const categories: { id: GameCategoryId | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'slots', label: 'Slots' },
  { id: 'crash', label: 'Crash' },
  { id: 'ao-vivo', label: 'Ao vivo' },
  { id: 'originais', label: 'Originais' },
  { id: 'slots-pg', label: 'Slots PG' },
]

// Imagens hospedadas localmente na pasta /public/games/
export const games: Game[] = [
  {
    id: 'fortune-tiger',
    name: 'Fortune Tiger',
    provider: 'PG Soft',
    image: '/games/fortune-tiger.jpg',
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
    image: '/games/aviator.jpg',
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
    image: '/games/gates-olympus.jpg',
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
    image: '/games/mines.jpg',
    category: 'originais',
    players: 2148,
    badge: 'exclusivo',
    rtp: 99,
    href: '/games/mines',
  },
  {
    id: 'double',
    name: 'Double',
    provider: 'BodeBet Originals',
    image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%231f2937"><rect width="100" height="100" rx="15"/><circle cx="50" cy="50" r="30" fill="%23e11d48"/><path d="M50 30L65 50L50 70L35 50Z" fill="white"/></svg>',
    category: 'originais',
    players: 3042,
    badge: 'novo',
    rtp: 98,
    href: '/games/double',
  },
  {
    id: 'plinko',
    name: 'Plinko',
    provider: 'BodeBet Originals',
    image: '/games/plinko.jpg',
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
    image: '/games/penalty-lucky.jpg',
    category: 'originais',
    players: 1184,
    badge: 'novo',
    rtp: 97,
    href: '/games/penalty-lucky',
  },
  {
    id: 'sweet-candy',
    name: 'Sweet Bonanza',
    provider: 'Pragmatic',
    image: '/games/sweet-candy.jpg',
    category: 'slots',
    players: 2760,
    badge: 'novo',
    rtp: 96.4,
    href: '/games/sweet-candy',
  },
  { id: 'fortune-ox', name: 'Fortune Ox', provider: 'PG Soft', image: '/games/fortune-ox.jpg', category: 'slots-pg', players: 1200, rtp: 96.8, href: '/games/pgsoft?game=fortune-ox' },
  { id: 'fortune-mouse', name: 'Fortune Mouse', provider: 'PG Soft', image: '/games/fortune-mouse.jpg', category: 'slots-pg', players: 900, rtp: 96.9, href: '/games/pgsoft?game=fortune-mouse' },
  { id: 'fortune-rabbit', name: 'Fortune Rabbit', provider: 'PG Soft', image: '/games/fortune-rabbit.jpg', category: 'slots-pg', players: 800, badge: 'novo', rtp: 96.7, href: '/games/pgsoft?game=fortune-rabbit' },
  { id: 'fortune-dragon', name: 'Fortune Dragon', provider: 'PG Soft', image: '/games/fortune-dragon.jpg', category: 'slots-pg', players: 1500, rtp: 96.7, href: '/games/pgsoft?game=fortune-dragon' },
  { id: 'double-fortune', name: 'Double Fortune', provider: 'PG Soft', image: '/games/double-fortune.jpg', category: 'slots-pg', players: 500, rtp: 96.2, href: '/games/pgsoft?game=double-fortune' },
  { id: 'ganesha-gold', name: 'Ganesha Gold', provider: 'PG Soft', image: '/games/ganesha-gold.jpg', category: 'slots-pg', players: 750, rtp: 96.0, href: '/games/pgsoft?game=ganesha-gold' },
  { id: 'jungle-delight', name: 'Jungle Delight', provider: 'PG Soft', image: '/games/jungle-delight.jpg', category: 'slots-pg', players: 300, rtp: 96.0, href: '/games/pgsoft?game=jungle-delight' },
  { id: 'bikini-paradise', name: 'Bikini Paradise', provider: 'PG Soft', image: '/games/bikini-paradise.jpg', category: 'slots-pg', players: 450, rtp: 96.9, href: '/games/pgsoft?game=bikini-paradise' },
  { id: 'dragon-tiger-luck', name: 'Dragon Tiger Luck', provider: 'PG Soft', image: '/games/dragon-tiger-luck.jpg', category: 'slots-pg', players: 600, rtp: 96.9, href: '/games/pgsoft?game=dragon-tiger-luck' }
]

export const banners = [
  {
    id: 'bonus',
    eyebrow: 'Bônus de Boas-Vindas',
    title: 'Até 500% no Primeiro Depósito',
    description: 'Deposite a partir de R$ 20 e receba giros grátis nos slots em destaque.',
    cta: 'Resgatar bônus',
    image: '/banners/banner1.jpg',
  },
  {
    id: 'novos-jogos',
    eyebrow: 'Novidades na Plataforma',
    title: 'Gates of Olympus, Plinko e Sweet Bonanza',
    description: 'Três lançamentos jogáveis, com quedas em cascata e multiplicadores.',
    cta: 'Jogar agora',
    image: '/banners/banner2.jpg',
  },
  {
    id: 'slots',
    eyebrow: 'Novidades na Plataforma',
    title: 'Novas Emoções. Mais Chances. Só Aqui.',
    description: 'Descubra os novos lançamentos da BodeBet e leve sua sorte a outro nível.',
    cta: 'Explorar agora',
    image: '/banners/banner3.jpg',
  },
  {
    id: 'deposite',
    eyebrow: 'Bônus Exclusivo',
    title: 'Deposite R$10 e Ganhe R$20',
    description: 'Slots premium, pagamentos rápidos e 100% seguro.',
    cta: 'Aproveite agora!',
    image: '/banners/banner4.jpg',
  },
]

export const recentWins = [
  { player: 'lu***23', game: 'Aviator', amount: 12480.5 },
  { player: 'mar***os', game: 'Fortune Tiger', amount: 8210.0 },
  { player: 'pe***dro', game: 'Gates of Olympus', amount: 5677.9 },
  { player: 'ana***91', game: 'Mines', amount: 3145.2 },
  { player: 'jo***ao', game: 'Sweet Bonanza', amount: 2890.0 },
  { player: 'ka***ol', game: 'Plinko', amount: 1740.75 },
  { player: 'be***ta', game: 'Sweet Bonanza', amount: 998.4 },
]

export { formatBRL } from '@/lib/game-format'
