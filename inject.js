const fs = require('fs');
let code = fs.readFileSync('src/lib/casino-data.ts', 'utf8');

const newGames = \  { id: 'fortune-ox', name: 'Fortune Ox', provider: 'PG Soft', image: 'https://supergamess.netlify.app/f_ox.png', category: 'slots-pg', players: 1200, rtp: 96.8, href: '/games/pgsoft?game=fortune-ox' },
  { id: 'fortune-mouse', name: 'Fortune Mouse', provider: 'PG Soft', image: 'https://supergamess.netlify.app/f_mouse.png', category: 'slots-pg', players: 900, rtp: 96.9, href: '/games/pgsoft?game=fortune-mouse' },
  { id: 'fortune-rabbit', name: 'Fortune Rabbit', provider: 'PG Soft', image: 'https://supergamess.netlify.app/f_rabbit.png', category: 'slots-pg', players: 800, badge: 'novo', rtp: 96.7, href: '/games/pgsoft?game=fortune-rabbit' },
  { id: 'fortune-dragon', name: 'Fortune Dragon', provider: 'PG Soft', image: 'https://supergamess.netlify.app/f_dragon.png', category: 'slots-pg', players: 1500, rtp: 96.7, href: '/games/pgsoft?game=fortune-dragon' },
  { id: 'double-fortune', name: 'Double Fortune', provider: 'PG Soft', image: 'https://supergamess.netlify.app/d_fortune.png', category: 'slots-pg', players: 500, rtp: 96.2, href: '/games/pgsoft?game=double-fortune' },
  { id: 'ganesha-gold', name: 'Ganesha Gold', provider: 'PG Soft', image: 'https://supergamess.netlify.app/g_gold.png', category: 'slots-pg', players: 750, rtp: 96.0, href: '/games/pgsoft?game=ganesha-gold' },
  { id: 'jungle-delight', name: 'Jungle Delight', provider: 'PG Soft', image: 'https://supergamess.netlify.app/j_delight.png', category: 'slots-pg', players: 300, rtp: 96.0, href: '/games/pgsoft?game=jungle-delight' },
  { id: 'bikini-paradise', name: 'Bikini Paradise', provider: 'PG Soft', image: 'https://supergamess.netlify.app/b_paradise.png', category: 'slots-pg', players: 450, rtp: 96.9, href: '/games/pgsoft?game=bikini-paradise' },
  { id: 'dragon-tiger-luck', name: 'Dragon Tiger Luck', provider: 'PG Soft', image: 'https://supergamess.netlify.app/dt_luck.png', category: 'slots-pg', players: 600, rtp: 96.9, href: '/games/pgsoft?game=dragon-tiger-luck' },
];\;

code = code.replace(/\{ id: 'originais', label: 'Originais' \},/, \{ id: 'originais', label: 'Originais' },
  { id: 'slots-pg', label: 'Slots PG' },\);
  
code = code.replace(/export type GameCategoryId = 'slots' \\| 'crash' \\| 'ao-vivo' \\| 'originais'/, \export type GameCategoryId = 'slots' | 'crash' | 'ao-vivo' | 'originais' | 'slots-pg'\);

code = code.replace(/href: '\\/games\\/sweet-candy',\n  },/, \href: '/games/sweet-candy',
  },\n\ + newGames.replace('];', ''));

fs.writeFileSync('src/lib/casino-data.ts', code);

