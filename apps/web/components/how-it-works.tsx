"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Armchair, CheckCircle2, CreditCard, QrCode, ScanLine, Smartphone } from "lucide-react";
import { useState } from "react";

const steps = [
  { id: "seat", title: "Pick your seat", body: "Choose the exact seat you want on the bus map. We hold it for you for 10 minutes while you pay.", Icon: Armchair },
  { id: "pay", title: "Pay your way", body: "Pay in cedis with mobile money or card through Paystack. You see the full fare before you pay.", Icon: CreditCard },
  { id: "ticket", title: "Get your QR ticket", body: "As soon as your payment is confirmed, your ticket appears in My tickets. No printing needed.", Icon: QrCode },
  { id: "board", title: "Show it and board", body: "The driver of your bus scans your QR code at the door. Each ticket works once, for your seat only.", Icon: ScanLine },
] as const;

type StepId = (typeof steps)[number]["id"];

export function HowItWorks() {
  const [active, setActive] = useState<StepId>("seat");
  const reduce = useReducedMotion();
  const index = steps.findIndex((s) => s.id === active);

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <ol className="relative flex flex-col gap-2" aria-label="How MOVA works">
        {/* the lane line that ties the steps together: dashed road paint, with a glowing stud travelling to the active step */}
        <span aria-hidden className="absolute top-8 bottom-8 left-[27px] w-0.5 bg-[repeating-linear-gradient(180deg,var(--border)_0_7px,transparent_7px_13px)]" />
        <motion.span
          aria-hidden
          className="absolute top-8 left-[27px] w-0.5 origin-top bg-[repeating-linear-gradient(180deg,var(--route)_0_7px,transparent_7px_13px)]"
          animate={{ height: `calc(${(index / (steps.length - 1)) * 100}% - ${index === steps.length - 1 ? 64 : 0}px)` }}
          transition={{ duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.span
          aria-hidden
          className="absolute left-[23px] z-0 size-2.5 rounded-full bg-amber shadow-[0_0_12px_3px_rgba(255,181,71,0.6)]"
          style={{ top: 28 }}
          animate={{ top: `calc(${(index / (steps.length - 1)) * 100}% - ${index === steps.length - 1 ? 40 : -28}px)` }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        {steps.map((s, i) => {
          const on = s.id === active;
          const done = i < index;
          return (
            <li key={s.id}>
              <button
                onClick={() => setActive(s.id)}
                onMouseEnter={() => setActive(s.id)}
                aria-pressed={on}
                className={clsx(
                  "relative flex w-full items-start gap-4 rounded-2xl p-3 text-left transition-colors duration-200",
                  on ? "bg-surface shadow-soft" : "hover:bg-surface/60",
                )}
              >
                <span
                  className={clsx(
                    "relative z-10 grid size-[34px] shrink-0 translate-x-[7px] place-items-center rounded-full border-2 text-sm font-bold transition-colors duration-200",
                    on ? "border-accent bg-accent-solid text-on-accent" : done ? "border-route bg-surface text-route" : "border-border bg-surface text-muted",
                  )}
                >
                  {done ? <CheckCircle2 aria-hidden className="size-4" /> : i + 1}
                </span>
                <span className="pl-1">
                  <span className="block font-display text-lg font-bold">{s.title}</span>
                  <span className={clsx("block text-[15px] text-muted transition-[max-height,opacity] duration-300", on ? "max-h-24 opacity-100" : "max-h-0 overflow-hidden opacity-0 lg:max-h-24 lg:opacity-100")}>
                    {s.body}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div aria-hidden className="relative mx-auto w-full max-w-md">
        <div className="relative rounded-[32px] border border-border bg-surface p-3 shadow-float">
          <div className="flex items-center justify-between px-3 pt-1 pb-3 text-xs font-semibold text-muted">
            <span className="tabular">09:41</span>
            <Smartphone className="size-3.5" />
          </div>
          <div className="relative h-[372px] overflow-hidden rounded-[22px] bg-ground">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0 p-5"
                initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                {active === "seat" && <SeatDemo />}
                {active === "pay" && <PayDemo />}
                {active === "ticket" && <TicketDemo />}
                {active === "board" && <BoardDemo />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted">Illustration</p>
      </div>
    </div>
  );
}

function SeatDemo() {
  const taken = new Set([2, 3, 6, 9, 10, 13, 18]);
  return (
    <div>
      <p className="text-sm font-semibold">Choose your seat</p>
      <div className="mt-4 grid grid-cols-[repeat(2,1fr)_16px_repeat(2,1fr)] gap-1.5">
        {Array.from({ length: 24 }, (_, i) => i + 1).flatMap((n, i) => {
          const cells = [];
          if (i % 4 === 2) cells.push(<span key={`a${n}`} />);
          const sel = n === 14;
          cells.push(
            <span
              key={n}
              className={clsx(
                "tabular grid h-8 place-items-center rounded-lg text-xs font-semibold",
                sel ? "bg-accent-solid text-on-accent ring-4 ring-accent/35" : taken.has(n) ? "bg-border text-muted line-through" : "border border-aqua bg-surface text-fg",
              )}
            >
              {n}
            </span>,
          );
          return cells;
        })}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-surface p-3 text-sm shadow-soft">
        <span className="font-semibold">Seat 14 selected</span>
        <span className="tabular text-route font-semibold">Held 09:58</span>
      </div>
    </div>
  );
}

function PayDemo() {
  return (
    <div className="flex h-full flex-col">
      <p className="text-sm font-semibold">Checkout</p>
      <dl className="mt-4 space-y-2 rounded-xl bg-surface p-4 text-sm shadow-soft">
        <div className="flex justify-between"><dt className="text-muted">Trip fare</dt><dd className="tabular font-medium">GH₵ —</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Luggage</dt><dd className="tabular font-medium">GH₵ —</dd></div>
        <div className="flex justify-between border-t border-border pt-2 font-semibold"><dt>Total</dt><dd className="tabular">GH₵ —</dd></div>
      </dl>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <span className="rounded-xl border-2 border-accent bg-surface p-3 font-semibold">Mobile money</span>
        <span className="rounded-xl border border-border bg-surface p-3 text-muted">Card</span>
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-xl bg-info-bg p-3 text-sm font-medium text-accent-fg">
        <span className="size-2 animate-pulse rounded-full bg-accent" /> Confirming your payment…
      </div>
    </div>
  );
}

function TicketDemo() {
  return (
    <div className="flex h-full flex-col items-center">
      <div className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="size-4" /> Your booking is confirmed</div>
      <div className="mt-4 w-full rounded-2xl bg-surface p-4 shadow-soft">
        <div className="mx-auto grid size-32 grid-cols-8 gap-0.5 rounded-lg bg-white p-2">
          {Array.from({ length: 64 }, (_, i) => (
            <span key={i} className={clsx("rounded-[1px]", (i * 7 + (i % 5) * 3) % 3 === 0 || [0, 1, 8, 9, 6, 7, 14, 15, 48, 49, 56, 57].includes(i) ? "bg-ink" : "bg-transparent")} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-dashed border-border pt-3 text-center text-xs">
          <div><p className="text-muted">Seat</p><p className="tabular font-bold">14</p></div>
          <div><p className="text-muted">Departs</p><p className="tabular font-bold whitespace-nowrap">6:00 AM</p></div>
          <div><p className="text-muted">Bus</p><p className="font-bold">GR ···</p></div>
        </div>
      </div>
    </div>
  );
}

function BoardDemo() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-success-bg text-center">
      <span className="grid size-16 place-items-center rounded-full bg-success text-white dark:text-ink"><CheckCircle2 className="size-8" /></span>
      <p className="mt-4 font-display text-2xl font-extrabold text-success">Valid ticket</p>
      <p className="mt-1 text-sm text-muted">Seat 14 · Passenger boarded</p>
    </div>
  );
}
