"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { Ban, Check, Clock, SteeringWheel } from "./seat-icons";
import type { SeatLayout, SeatState } from "@/lib/types";

const stateLabel: Record<SeatState, string> = {
  available: "Available",
  selected: "Selected",
  booked: "Booked",
  locked: "Temporarily unavailable",
};

export function SeatLegend() {
  const items: { state: SeatState; label: string }[] = [
    { state: "available", label: "Available" },
    { state: "selected", label: "Your seat" },
    { state: "locked", label: "Temporarily unavailable" },
    { state: "booked", label: "Booked" },
  ];
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Seat legend">
      {items.map((i) => (
        <li key={i.state} className="flex items-center gap-2">
          <span aria-hidden className={clsx(seatClass(i.state), "size-6 text-[10px]")}>{seatGlyph(i.state)}</span>
          {i.label}
        </li>
      ))}
    </ul>
  );
}

function seatGlyph(state: SeatState) {
  if (state === "booked") return <Ban className="size-3.5" />;
  if (state === "locked") return <Clock className="size-3.5" />;
  if (state === "selected") return <Check className="size-3.5" />;
  return null;
}

function seatClass(state: SeatState, pending = false) {
  return clsx(
    "relative grid place-items-center rounded-[10px] font-semibold tabular select-none",
    state === "available" && "border-2 border-aqua bg-surface text-fg hover:-translate-y-0.5 hover:shadow-lift hover:border-electric cursor-pointer",
    state === "selected" && "bg-electric text-white ring-4 ring-electric/25 dark:bg-accent",
    state === "booked" && "bg-border text-muted cursor-not-allowed",
    state === "locked" && "bg-coral/15 text-coral-ink border border-dashed border-coral/60 cursor-not-allowed dark:text-coral",
    pending && "opacity-60",
    "transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out",
  );
}

export function SeatMap({
  layout,
  states,
  onSelect,
  pendingSeat,
  disabled,
}: {
  layout: SeatLayout;
  states: Record<string, SeatState>;
  onSelect: (seat: string) => void;
  pendingSeat?: string | null;
  disabled?: boolean;
}) {
  const reduce = useReducedMotion();
  const cols = layout[0]?.length ?? 5;
  return (
    <div className="mx-auto w-full max-w-[340px] rounded-[28px] border-2 border-border bg-ground p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-border pb-3 text-xs font-semibold text-muted">
        <span>Front of bus</span>
        <span className="flex items-center gap-1.5"><SteeringWheel className="size-5" /> Driver</span>
      </div>
      <div role="grid" aria-label="Seat map" className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {layout.map((row, r) => (
          <div role="row" key={r} className="contents">
            {row.map((seat, c) => {
              if (!seat) return <span role="gridcell" key={`${r}-${c}`} aria-hidden />;
              const state = states[seat] ?? "booked";
              const selectable = state === "available" && !disabled;
              return (
                <span role="gridcell" key={seat}>
                  <motion.button
                    type="button"
                    onClick={() => selectable && onSelect(seat)}
                    disabled={!selectable && state !== "selected"}
                    aria-disabled={!selectable}
                    aria-pressed={state === "selected"}
                    aria-label={`Seat ${seat}, ${stateLabel[state]}`}
                    className={clsx(seatClass(state, pendingSeat === seat), "aspect-square w-full text-sm")}
                    animate={state === "selected" && !reduce ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {state === "available" || state === "selected" ? seat : seatGlyph(state)}
                    {(state === "booked" || state === "locked") && <span className="sr-only">{seat}</span>}
                  </motion.button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-4 border-t-2 border-dashed border-border pt-3 text-center text-xs font-semibold text-muted">Back of bus</p>
    </div>
  );
}
