import { cn } from '@/lib/utils';
import { SymbolId } from '@/lib/fortune-tiger-engine';

export function TigerLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex flex-col items-center justify-center', className)}>
      <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#ffdf70] via-[#d4af37] to-[#aa7c11] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '1px #591b0c' }}>
        FORTUNE
      </h1>
      <h2 className="font-black text-6xl md:text-7xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#ff5e5e] via-[#e61919] to-[#8a0000] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] -mt-4" style={{ WebkitTextStroke: '2px #ffdf70' }}>
        TIGER
      </h2>
      <div className="absolute -top-10 -z-10 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.4)_0%,transparent_70%)] blur-xl" />
    </div>
  );
}

export function TigerCharacter({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-48 h-48 md:w-56 md:h-56', className)}>
      {/* Glow behind tiger */}
      <div className="absolute inset-0 bg-yellow-500/30 blur-2xl rounded-full" />
      
      {/* Rich SVG Illustration of a Stylized Asian Tiger Head */}
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tigerGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe259"/>
            <stop offset="100%" stopColor="#ffa751"/>
          </linearGradient>
          <linearGradient id="tigerRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff4b2b"/>
            <stop offset="100%" stopColor="#b31217"/>
          </linearGradient>
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff"/>
            <stop offset="50%" stopColor="#00ffcc"/>
            <stop offset="100%" stopColor="#006644"/>
          </radialGradient>
        </defs>
        
        {/* Ears */}
        <path d="M 40 70 Q 20 40 50 20 Q 80 10 70 50 Z" fill="url(#tigerGold)" stroke="#803a00" strokeWidth="3"/>
        <path d="M 160 70 Q 180 40 150 20 Q 120 10 130 50 Z" fill="url(#tigerGold)" stroke="#803a00" strokeWidth="3"/>
        <path d="M 45 60 Q 35 35 55 25 Z" fill="#fff" opacity="0.8"/>
        <path d="M 155 60 Q 165 35 145 25 Z" fill="#fff" opacity="0.8"/>

        {/* Head Base */}
        <path d="M 30 110 C 20 160 60 190 100 190 C 140 190 180 160 170 110 C 180 60 140 30 100 30 C 60 30 20 60 30 110 Z" fill="url(#tigerGold)" stroke="#8a4400" strokeWidth="4"/>
        
        {/* White Fur around mouth */}
        <path d="M 50 130 C 40 170 90 180 100 180 C 110 180 160 170 150 130 C 160 145 130 165 100 165 C 70 165 40 145 50 130 Z" fill="#fff" opacity="0.9"/>

        {/* Red Crown / Forehead Markings */}
        <path d="M 85 45 L 115 45 L 100 65 Z" fill="url(#tigerRed)"/>
        <path d="M 80 55 L 120 55 L 100 70 Z" fill="url(#tigerRed)"/>
        <path d="M 95 35 L 105 35 L 100 85 Z" fill="url(#tigerRed)"/>

        {/* Stripes */}
        <path d="M 30 90 L 60 100 L 35 110 Z" fill="#3a1a00"/>
        <path d="M 170 90 L 140 100 L 165 110 Z" fill="#3a1a00"/>
        <path d="M 35 125 L 65 120 L 45 140 Z" fill="#3a1a00"/>
        <path d="M 165 125 L 135 120 L 155 140 Z" fill="#3a1a00"/>

        {/* Eyes */}
        <ellipse cx="70" cy="95" rx="18" ry="12" fill="#fff" stroke="#3a1a00" strokeWidth="3" transform="rotate(-10 70 95)"/>
        <ellipse cx="130" cy="95" rx="18" ry="12" fill="#fff" stroke="#3a1a00" strokeWidth="3" transform="rotate(10 130 95)"/>
        <circle cx="70" cy="95" r="7" fill="url(#eyeGlow)"/>
        <circle cx="130" cy="95" r="7" fill="url(#eyeGlow)"/>
        <circle cx="70" cy="95" r="3" fill="#000"/>
        <circle cx="130" cy="95" r="3" fill="#000"/>
        
        {/* Eyebrows */}
        <path d="M 50 80 Q 70 70 85 85" fill="none" stroke="#3a1a00" strokeWidth="5" strokeLinecap="round"/>
        <path d="M 150 80 Q 130 70 115 85" fill="none" stroke="#3a1a00" strokeWidth="5" strokeLinecap="round"/>

        {/* Nose */}
        <path d="M 90 120 L 110 120 L 100 135 Z" fill="url(#tigerRed)" stroke="#660000" strokeWidth="2"/>
        
        {/* Mouth */}
        <path d="M 100 135 Q 100 150 85 145" fill="none" stroke="#3a1a00" strokeWidth="3" strokeLinecap="round"/>
        <path d="M 100 135 Q 100 150 115 145" fill="none" stroke="#3a1a00" strokeWidth="3" strokeLinecap="round"/>

        {/* Whiskers */}
        <path d="M 75 130 L 40 125" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 75 140 L 45 145" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 125 130 L 160 125" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 125 140 L 155 145" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

export function SymbolIcon({ id, className }: { id: SymbolId; className?: string }) {
  // Common container for symbols
  const containerClass = cn('w-full h-full p-2 flex items-center justify-center relative drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]', className);

  switch (id) {
    case 'tiger':
      return (
        <div className={containerClass}>
          <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full" />
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="url(#tigerGold)" stroke="#fff" strokeWidth="2"/>
            <path d="M30 40 Q50 20 70 40 Q80 70 50 80 Q20 70 30 40Z" fill="url(#tigerRed)"/>
            <text x="50" y="65" fontFamily="sans-serif" fontSize="40" fill="#fff" fontWeight="bold" textAnchor="middle" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>W</text>
          </svg>
        </div>
      );
    case 'ingot':
      return (
        <div className={containerClass}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="ingotGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff7a1"/>
                <stop offset="40%" stopColor="#ffd700"/>
                <stop offset="100%" stopColor="#b8860b"/>
              </linearGradient>
            </defs>
            <path d="M20 70 Q10 40 30 30 L70 30 Q90 40 80 70 Z" fill="url(#ingotGold)" stroke="#8b6508" strokeWidth="2"/>
            <path d="M30 30 Q50 10 70 30 Z" fill="#ffef82"/>
            <path d="M35 50 Q50 40 65 50 Q50 60 35 50 Z" fill="#daa520" opacity="0.6"/>
          </svg>
        </div>
      );
    case 'firecracker':
      return (
        <div className={containerClass}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="fireRed" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff1a1a"/>
                <stop offset="50%" stopColor="#e60000"/>
                <stop offset="100%" stopColor="#990000"/>
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="30" height="60" rx="5" fill="url(#fireRed)" stroke="#ffd700" strokeWidth="3"/>
            <rect x="20" y="30" width="60" height="10" fill="#ffd700"/>
            <rect x="20" y="60" width="60" height="10" fill="#ffd700"/>
            <path d="M50 20 Q60 5 70 10" fill="none" stroke="#888" strokeWidth="3"/>
            <circle cx="70" cy="10" r="3" fill="#ffaa00"/>
          </svg>
        </div>
      );
    case 'drum':
      return (
        <div className={containerClass}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <ellipse cx="50" cy="30" rx="40" ry="15" fill="#fff" stroke="#d4af37" strokeWidth="5"/>
            <path d="M10 30 L10 70 Q50 90 90 70 L90 30 Z" fill="#b31217" stroke="#800000" strokeWidth="2"/>
            <ellipse cx="50" cy="70" rx="40" ry="15" fill="none" stroke="#d4af37" strokeWidth="5"/>
            <path d="M30 30 L20 70 M50 30 L50 75 M70 30 L80 70" stroke="#d4af37" strokeWidth="3"/>
          </svg>
        </div>
      );
    case 'orange':
      return (
        <div className={containerClass}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id="orangeGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffb347"/>
                <stop offset="70%" stopColor="#ff7b00"/>
                <stop offset="100%" stopColor="#cc5500"/>
              </radialGradient>
            </defs>
            <circle cx="50" cy="55" r="40" fill="url(#orangeGrad)"/>
            <path d="M50 15 Q60 5 75 15 Q65 25 50 15 Z" fill="#4caf50" stroke="#2e7d32" strokeWidth="2"/>
            <path d="M50 15 Q40 5 25 15 Q35 25 50 15 Z" fill="#388e3c" stroke="#1b5e20" strokeWidth="2"/>
          </svg>
        </div>
      );
    case 'coin':
      return (
        <div className={containerClass}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="#ffd700" stroke="#b8860b" strokeWidth="4"/>
            <circle cx="50" cy="50" r="32" fill="none" stroke="#daa520" strokeWidth="2" strokeDasharray="4,4"/>
            <rect x="35" y="35" width="30" height="30" fill="none" stroke="#b8860b" strokeWidth="4"/>
          </svg>
        </div>
      );
    default:
      return null;
  }
}

