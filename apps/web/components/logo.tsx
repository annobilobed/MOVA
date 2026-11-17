import clsx from "clsx";

/** MOVA mark: a route line that bends into an M and ends at a stop. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={clsx("shrink-0", className)}>
      <defs>
        <linearGradient id="mova-mark" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#493BFF" />
          <stop offset="1" stopColor="#8655FF" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#mova-mark)" />
      <path d="M10 28V14.5a2.5 2.5 0 0 1 4.6-1.4L20 21l5.4-7.9a2.5 2.5 0 0 1 4.6 1.4V24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="28.5" r="3.2" fill="#12D6C5" />
    </svg>
  );
}

export function Logo({ className, tone = "auto" }: { className?: string; tone?: "auto" | "light" }) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <LogoMark className="size-8" />
      <span className={clsx("font-display text-xl font-extrabold tracking-[-0.03em]", tone === "light" ? "text-white" : "text-fg")}>MOVA</span>
    </span>
  );
}
