/** Goleiro desenhado em SVG, com braços esticados para a defesa. */
export function KeeperSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      {/* braços esticados */}
      <g stroke="#f5b625" strokeWidth="11" strokeLinecap="round">
        <line x1="30" y1="42" x2="8" y2="26" />
        <line x1="90" y1="42" x2="112" y2="26" />
      </g>
      {/* luvas */}
      <circle cx="7" cy="23" r="9" fill="#e8e8f0" stroke="#2b2f38" strokeWidth="2" />
      <circle cx="113" cy="23" r="9" fill="#e8e8f0" stroke="#2b2f38" strokeWidth="2" />
      {/* corpo */}
      <path
        d="M40 38 h40 a10 10 0 0 1 10 10 v26 a8 8 0 0 1 -8 8 h-44 a8 8 0 0 1 -8 -8 v-26 a10 10 0 0 1 10 -10 z"
        fill="#7c3fd6"
        stroke="#2b1145"
        strokeWidth="2"
      />
      {/* pernas */}
      <g stroke="#3a1a63" strokeWidth="12" strokeLinecap="round">
        <line x1="50" y1="82" x2="38" y2="112" />
        <line x1="70" y1="82" x2="84" y2="110" />
      </g>
      {/* chuteiras */}
      <ellipse cx="35" cy="114" rx="10" ry="5" fill="#111318" />
      <ellipse cx="87" cy="112" rx="10" ry="5" fill="#111318" />
      {/* cabeça */}
      <circle cx="60" cy="24" r="14" fill="#e7b58a" stroke="#2b2f38" strokeWidth="2" />
      <path d="M46 20 a14 14 0 0 1 28 0 z" fill="#2b1145" />
    </svg>
  )
}
