import { cn } from '@/lib/utils';

export function AviatorPlane({ className }: { className?: string }) {
  return (
    <div className={cn('relative flex items-center justify-center w-24 h-24', className)}>
      {/* Thruster Glow */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-16 h-8 bg-gradient-to-r from-orange-500 via-red-500 to-transparent blur-md rounded-full -rotate-12" />
      
      {/* Sleek 3D-like SVG Jet */}
      <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] z-10 relative">
        <defs>
          <linearGradient id="jetBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e60000"/>
            <stop offset="40%" stopColor="#990000"/>
            <stop offset="100%" stopColor="#4d0000"/>
          </linearGradient>
          <linearGradient id="jetWing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4af37"/>
            <stop offset="100%" stopColor="#8a4400"/>
          </linearGradient>
          <linearGradient id="jetCockpit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1a1a"/>
            <stop offset="50%" stopColor="#4d4d4d"/>
            <stop offset="100%" stopColor="#000000"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Main Body */}
        <path d="M20 50 Q 80 40 180 50 Q 190 51 195 53 Q 200 55 180 58 Q 80 65 20 55 Z" fill="url(#jetBody)" stroke="#d4af37" strokeWidth="1"/>
        
        {/* Back Fin */}
        <path d="M25 52 L 15 25 L 45 45 Z" fill="url(#jetBody)" stroke="#d4af37" strokeWidth="1.5"/>
        
        {/* Main Wing (Far) */}
        <path d="M100 48 L 130 35 L 140 48 Z" fill="url(#jetBody)"/>
        
        {/* Main Wing (Near) */}
        <path d="M80 55 L 40 85 L 110 60 Z" fill="url(#jetWing)" stroke="#ffdf70" strokeWidth="1"/>
        
        {/* Cockpit */}
        <path d="M120 48 Q 140 40 160 49 Q 140 52 120 48 Z" fill="url(#jetCockpit)" stroke="#d4af37" strokeWidth="1"/>
        
        {/* Thruster Base */}
        <ellipse cx="20" cy="52.5" rx="4" ry="8" fill="#333" stroke="#d4af37" strokeWidth="1"/>
        
        {/* Fire Particle / Engine Glow */}
        <path d="M16 52.5 Q 0 45 5 52.5 Q 0 60 16 52.5 Z" fill="#ffaa00" filter="url(#glow)"/>
        <path d="M16 52.5 Q -10 50 0 52.5 Q -10 55 16 52.5 Z" fill="#fff" opacity="0.8"/>
        
        {/* Gold Accent Lines */}
        <path d="M30 52 Q 100 45 160 52" fill="none" stroke="#d4af37" strokeWidth="1.5" opacity="0.8"/>
      </svg>
    </div>
  );
}

