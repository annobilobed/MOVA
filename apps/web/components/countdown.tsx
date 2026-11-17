"use client";

import clsx from "clsx";
import { Timer } from "lucide-react";
import { useEffect, useState } from "react";

/** Counts down to a server-issued expiry. Never starts before the server confirms the hold. */
export function useCountdown(expiresAt: string | null, onExpire?: () => void) {
  const [left, setLeft] = useState(() => (expiresAt ? new Date(expiresAt).getTime() - Date.now() : 0));
  useEffect(() => {
    if (!expiresAt) return;
    const end = new Date(expiresAt).getTime();
    let fired = false;
    const tick = () => {
      const ms = end - Date.now();
      setLeft(ms);
      if (ms <= 0 && !fired) {
        fired = true;
        onExpire?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);
  return Math.max(0, left);
}

export const mmss = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export function HoldTimer({ expiresAt, onExpire, className, totalMs = 10 * 60 * 1000 }: { expiresAt: string; onExpire?: () => void; className?: string; totalMs?: number }) {
  const left = useCountdown(expiresAt, onExpire);
  const urgent = left < 2 * 60 * 1000;
  const pct = Math.max(0, Math.min(1, left / totalMs)) * 100;
  return (
    <div className={clsx("rounded-2xl p-3.5", urgent ? "bg-warning-bg" : "bg-success-bg", className)}>
      <div className="flex items-center gap-3">
        <Timer aria-hidden className={clsx("size-5 shrink-0", urgent ? "text-warning" : "text-success")} />
        <p className="flex-1 text-sm">
          <span className="font-semibold">Your seat is held</span> while you complete payment.
        </p>
        <span role="timer" aria-label={`${Math.ceil(left / 60000)} minutes left`} className={clsx("tabular font-display text-xl font-extrabold", urgent ? "text-warning" : "text-success")}>
          {mmss(left)}
        </span>
      </div>
      {/* the route line: drains toward the stop as the hold runs down */}
      <div aria-hidden className="relative mt-3 ml-8 h-2">
        <span className="absolute inset-y-[3px] right-0 left-0 rounded-full bg-[repeating-linear-gradient(90deg,currentColor_0_5px,transparent_5px_9px)] text-border" />
        <span
          className={clsx("absolute inset-y-[2px] left-0 rounded-full transition-[width] duration-1000 ease-linear", urgent ? "bg-sun" : "bg-aqua")}
          style={{ width: `${pct}%` }}
        />
        <span className={clsx("absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-surface transition-[left] duration-1000 ease-linear", urgent ? "border-sun" : "border-aqua")} style={{ left: `${pct}%` }} />
        <span className="absolute top-1/2 right-0 size-2.5 -translate-y-1/2 rounded-full bg-fg/30" />
      </div>
    </div>
  );
}
