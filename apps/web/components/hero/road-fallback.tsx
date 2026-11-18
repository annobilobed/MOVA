/** Static night-road picture: shown first, and kept for reduced motion, data saver and no-WebGL devices. */
export function RoadFallback() {
  const palms = [
    [70, 330, 1.25], [190, 300, 0.9], [290, 282, 0.7], [1180, 330, 1.25], [1060, 300, 0.9], [960, 282, 0.7],
  ] as const;
  return (
    <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" aria-hidden className="h-full w-full">
      <defs>
        <linearGradient id="rf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1026" />
          <stop offset="0.45" stopColor="#2a1d4f" />
          <stop offset="0.68" stopColor="#b4506a" />
          <stop offset="0.8" stopColor="#f0803c" />
        </linearGradient>
        <linearGradient id="rf-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2f4f" />
          <stop offset="1" stopColor="#141829" />
        </linearGradient>
        <radialGradient id="rf-beam" cx="0.5" cy="0" r="0.8">
          <stop offset="0" stopColor="#ffe2a8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffe2a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#rf-sky)" />
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={(i * 211) % 1280} cy={(i * 97) % 300} r={i % 7 === 0 ? 1.6 : 0.9} fill="#fff" opacity={0.35 + ((i * 13) % 10) / 20} />
      ))}
      {/* horizon town lights */}
      {Array.from({ length: 70 }, (_, i) => (
        <circle key={`t${i}`} cx={(i * 53) % 1280} cy={392 + ((i * 7) % 8)} r="1.4" fill="#ffcf8a" opacity="0.8" />
      ))}
      <rect y="398" width="1280" height="322" fill="#0d1424" />
      {/* road in perspective */}
      <path d="M610 398 L670 398 L1120 720 L160 720 Z" fill="url(#rf-road)" />
      <path d="M612 398 L210 720 M668 398 L1070 720" stroke="#d8dcef" strokeWidth="3" opacity="0.7" />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const y = 410 + k * k * 9 + k * 12;
        const h = 6 + k * 6;
        return <rect key={k} x={638 - k} y={y} width={4 + k * 1.6} height={h} fill="#f4f5ff" opacity={0.9} />;
      })}
      {[0, 1, 2, 3, 4, 5, 6].map((k) => {
        const t = k / 6;
        const y = 405 + t * t * 300;
        return (
          <g key={`s${k}`} fill="#ffe3a3">
            <circle cx={612 - t * t * 395} cy={y} r={1.5 + t * 3} />
            <circle cx={668 + t * t * 395} cy={y} r={1.5 + t * 3} />
          </g>
        );
      })}
      {/* palms */}
      {palms.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`} fill="#0a0f1e">
          <path d="M-4 0 C -2 -60, 6 -110, 14 -150 L 20 -150 C 12 -108, 6 -60, 6 0 Z" />
          {[-150, -110, -70, -30, 10, 50].map((r) => (
            <path key={r} d="M17 -150 C 40 -170, 75 -160, 95 -140 C 70 -150, 40 -152, 17 -146 Z" transform={`rotate(${r} 17 -150)`} />
          ))}
        </g>
      ))}
      {/* the coach, head-on, headlights on */}
      <path d="M430 720 L560 470 L720 470 L850 720 Z" fill="url(#rf-beam)" opacity="0.7" />
      <g transform="translate(560 430)">
        <rect x="0" y="0" width="160" height="150" rx="16" fill="#eef0ff" />
        <rect x="10" y="12" width="140" height="62" rx="9" fill="#3b4596" />
        <rect x="10" y="12" width="140" height="62" rx="9" fill="#ffcf8a" opacity="0.18" />
        <rect x="18" y="-6" width="124" height="12" rx="4" fill="#f0803c" />
        <rect x="0" y="96" width="160" height="10" fill="#ffb547" />
        <rect x="14" y="116" width="34" height="14" rx="3" fill="#ffe3a3" />
        <rect x="112" y="116" width="34" height="14" rx="3" fill="#ffe3a3" />
        <rect x="60" y="118" width="40" height="10" rx="2" fill="#0e1330" />
        <rect x="6" y="150" width="26" height="20" rx="4" fill="#0e1330" />
        <rect x="128" y="150" width="26" height="20" rx="4" fill="#0e1330" />
      </g>
    </svg>
  );
}
