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

export function HoldTimer({ expiresAt, onExpire, className }: { expiresAt: string; onExpire?: () => void; className?: string }) {
  const left = useCountdown(expiresAt, onExpire);
  const urgent = left < 2 * 60 * 1000;
  return (
    <div className={clsx("flex items-center gap-3 rounded-2xl p-3.5", urgent ? "bg-warning-bg" : "bg-success-bg", className)}>
      <Timer aria-hidden className={clsx("size-5 shrink-0", urgent ? "text-warning" : "text-success")} />
      <p className="flex-1 text-sm">
        <span className="font-semibold">Your seat is held</span> while you complete payment.
      </p>
      <span role="timer" aria-label={`${Math.ceil(left / 60000)} minutes left`} className={clsx("tabular font-display text-xl font-extrabold", urgent ? "text-warning" : "text-success")}>
        {mmss(left)}
      </span>
    </div>
  );
}
