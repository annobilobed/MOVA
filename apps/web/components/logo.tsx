import clsx from "clsx";

/** MOVA mark: a road vanishing to the horizon under an amber headlight dot, inside a night tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={clsx("shrink-0", className)}>
      <defs>
        <linearGradient id="mova-mark" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2a1d4f" />
          <stop offset="0.55" stopColor="#151b3d" />
          <stop offset="1" stopColor="#0b1026" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#mova-mark)" />
      <path d="M17.5 17 L9 34 H31 L22.5 17 Z" fill="#262e5c" />
      <path d="M20 19v2.6M20 24.4v3.6M20 30.6v3.4" stroke="#ffe3a3" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 17h26" stroke="#f0803c" strokeWidth="1.4" strokeLinecap="round" opacity=".8" />
      <circle cx="20" cy="10.5" r="3.6" fill="#ffb547" />
    </svg>
  );
}

export function Logo({ className, tone = "auto" }: { className?: string; tone?: "auto" | "light" }) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <LogoMark className="size-8" />
      <span className={clsx("font-display text-[1.35rem] leading-none font-black tracking-[-0.01em]", tone === "light" ? "text-white" : "text-fg")}>MOVA</span>
    </span>
  );
}
