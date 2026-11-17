/** Static, lightweight hero illustration: shown first, and kept for reduced motion, data saver and no-WebGL devices. */
export function BusFallback() {
  return (
    <svg viewBox="0 0 640 440" aria-hidden className="h-full w-full">
      <defs>
        <linearGradient id="bf-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E9E8FF" />
        </linearGradient>
      </defs>
      {/* route ribbon */}
      <path d="M-20 380 C 140 330, 240 300, 340 290 S 560 230, 680 150" fill="none" stroke="#0a9c90" strokeWidth="92" strokeLinecap="round" transform="translate(0 10)" />
      <path d="M-20 380 C 140 330, 240 300, 340 290 S 560 230, 680 150" fill="none" stroke="#12D6C5" strokeWidth="88" strokeLinecap="round" />
      <path d="M-20 380 C 140 330, 240 300, 340 290 S 560 230, 680 150" fill="none" stroke="#ffffff" strokeWidth="5" strokeDasharray="16 14" strokeLinecap="round" />
      {/* shadow */}
      <ellipse cx="330" cy="318" rx="190" ry="20" fill="#171936" opacity="0.22" />
      {/* coach body */}
      <g transform="translate(140 150) skewY(-8)">
        <path d="M14 0 H330 Q366 0 372 34 L380 132 Q380 150 362 150 H14 Q0 150 0 136 V14 Q0 0 14 0Z" fill="url(#bf-body)" />
        <rect x="0" y="96" width="380" height="40" fill="#493BFF" />
        <rect x="0" y="90" width="380" height="7" fill="#12D6C5" />
        <rect x="22" y="-8" width="300" height="10" rx="5" fill="#8655FF" />
        {[24, 80, 136, 192, 248].map((x) => (
          <rect key={x} x={x} y="22" width="48" height="52" rx="7" fill="#232659" />
        ))}
        <path d="M312 22 H342 Q360 22 364 44 L368 74 H312Z" fill="#232659" />
        <rect x="364" y="108" width="12" height="10" rx="2" fill="#FFD166" />
        {[70, 296].map((x) => (
          <g key={x}>
            <circle cx={x} cy="150" r="27" fill="#171936" />
            <circle cx={x} cy="150" r="12" fill="#C9CBE0" />
          </g>
        ))}
      </g>
      {/* pins */}
      <g transform="translate(92 250)">
        <path d="M0 0 C -26 0 -26 -40 0 -58 C 26 -40 26 0 0 0Z" fill="#8655FF" transform="rotate(180 0 -29)" />
        <circle cx="0" cy="-36" r="9" fill="#fff" />
      </g>
      <g transform="translate(560 128)">
        <path d="M0 0 C -26 0 -26 -40 0 -58 C 26 -40 26 0 0 0Z" fill="#FF6B79" transform="rotate(180 0 -29)" />
        <circle cx="0" cy="-36" r="9" fill="#fff" />
      </g>
    </svg>
  );
}
