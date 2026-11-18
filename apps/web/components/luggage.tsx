"use client";

import clsx from "clsx";
import { Info, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cedis } from "@/lib/format";
import type { Luggage } from "@/lib/types";

export interface LuggageOption { id: Luggage; label: string; detail: string; feePesewas: number }
export interface LuggagePolicy { includedKg: number; marginKg: number; extraBagKg: number }

export function useLuggage() {
  const [data, setData] = useState<{ options: LuggageOption[]; policy: LuggagePolicy } | null>(null);
  useEffect(() => {
    api<{ options: LuggageOption[]; policy: LuggagePolicy }>("/trips/luggage").then(setData).catch(() => {});
  }, []);
  return data;
}

/** Simple drawn bags: one main bag, plus one per extra bag. */
function Bags({ count }: { count: number }) {
  return (
    <svg aria-hidden viewBox="0 0 64 32" className="h-7 w-14 shrink-0 text-accent-fg">
      {Array.from({ length: count }, (_, i) => (
        <g key={i} transform={`translate(${i * 19} ${i === 0 ? 4 : 8})`}>
          <rect x="2" y="6" width={i === 0 ? 20 : 16} height={i === 0 ? 20 : 16} rx="3" fill="currentColor" fillOpacity={i === 0 ? 0.9 : 0.55} />
          <path d={i === 0 ? "M8 6V3h8v3" : "M7 6V3h6v3"} fill="none" stroke="currentColor" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

/** Luggage options with plain descriptions. `current` greys out options at or below an existing allowance (top-ups). */
export function LuggageChoice({
  options,
  value,
  onChange,
  disabled,
  current,
}: {
  options: LuggageOption[];
  value: Luggage;
  onChange: (v: Luggage) => void;
  disabled?: boolean;
  current?: Luggage;
}) {
  const rank = (l: Luggage) => options.findIndex((o) => o.id === l);
  const base = current ? options.find((o) => o.id === current)?.feePesewas ?? 0 : 0;
  return (
    <div className="grid gap-2">
      {options.map((o, i) => {
        const owned = current !== undefined && rank(o.id) <= rank(current);
        const price = o.feePesewas - base;
        return (
          <label
            key={o.id}
            className={clsx(
              "flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 transition-colors has-[:checked]:border-accent has-[:checked]:bg-info-bg",
              (disabled || owned) && "cursor-not-allowed opacity-60",
            )}
          >
            <input type="radio" name="luggage" value={o.id} checked={value === o.id} disabled={disabled || owned} onChange={() => onChange(o.id)} className="mt-1 size-4 accent-[var(--accent)]" />
            <Bags count={i + 1} />
            <span className="flex-1">
              <span className="block text-[15px] font-semibold">{o.label}</span>
              <span className="block text-[13px] text-muted">{o.detail}</span>
            </span>
            <span className="tabular pt-0.5 text-sm font-semibold text-muted">
              {owned ? (current === o.id ? "Your ticket" : "Included") : price ? `+ ${cedis(price)}` : "Free"}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** The luggage rules every student sees before paying. */
export function LuggageRules({ policy, compact }: { policy?: LuggagePolicy; compact?: boolean }) {
  const inc = policy?.includedKg ?? 25;
  const margin = policy?.marginKg ?? 3;
  const extra = policy?.extraBagKg ?? 25;
  return (
    <div className="rounded-xl border border-border bg-ground p-3.5 text-[13px] text-muted">
      <p className="flex items-center gap-1.5 font-semibold text-fg"><Info aria-hidden className="size-4 text-accent-fg" /> Luggage rules</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-5">
        <li>Every ticket includes <b className="text-fg">{inc} kg</b>: one main bag, plus a small bag on your lap.</li>
        <li>Each extra bag can weigh up to {extra} kg. We allow up to <b className="text-fg">{margin} kg</b> over any limit.</li>
        <li>Luggage is checked when you board. If you have more than you paid for, add luggage from <b className="text-fg">My tickets</b> — even at the station — and pay only the difference. No cash.</li>
        {!compact && (
          <li className="flex list-none items-start gap-1.5 -ml-5">
            <Scale aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span>No luggage scale? Stand on a bathroom scale holding your bag, then without it. The difference is your bag's weight.</span>
          </li>
        )}
      </ul>
    </div>
  );
}
