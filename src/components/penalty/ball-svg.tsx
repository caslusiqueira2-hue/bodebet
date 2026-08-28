/** Bola de futebol desenhada em SVG (gomos pretos e brancos). */
export function BallSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id="ballLight" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#eceff3" />
          <stop offset="100%" stopColor="#b9c0cc" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#ballLight)" stroke="#2b2f38" strokeWidth="2" />
      <g fill="#1b1f27">
        <polygon points="50,26 65,37 59,55 41,55 35,37" />
        <polygon points="50,4 62,12 65,25 50,24 35,25 38,12" opacity="0.9" />
        <polygon points="88,42 92,58 80,68 71,55 77,40" />
        <polygon points="12,42 23,40 29,55 20,68 8,58" />
        <polygon points="41,60 59,60 66,76 50,86 34,76" />
      </g>
      <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="4" />
    </svg>
  )
}
