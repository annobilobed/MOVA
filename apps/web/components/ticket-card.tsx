"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { cedis, formatDate, formatTime, luggageLabel, tripTypeLabel } from "@/lib/format";
import type { Ticket } from "@/lib/types";
import { Badge, StatusBadge } from "./ui";

/** Digital ticket: the QR plus every detail as readable text (the QR is never the only information). */
export function TicketCard({ ticket, reveal = false }: { ticket: Ticket; reveal?: boolean }) {
  const reduce = useReducedMotion();
  const animate = reveal && !reduce;
  return (
    <motion.article
      aria-label={`Ticket for ${ticket.origin} to ${ticket.destination}, seat ${ticket.seat}`}
      initial={animate ? { opacity: 0, y: 40, rotateX: 18 } : false}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: animate ? 0.25 : 0 }}
      style={{ transformPerspective: 900 }}
      className="mx-auto w-full max-w-sm overflow-hidden rounded-[24px] bg-surface text-left shadow-float ring-1 ring-border"
    >
      <div className="bg-[linear-gradient(160deg,#2a1d4f_0%,#151b3d_55%,#0b1026_100%)] px-6 pt-5 pb-6 text-white">
        <div className="flex items-center justify-between text-sm">
          <span className="font-display font-extrabold tracking-[-0.02em]">MOVA</span>
          <span className="text-white/80">{tripTypeLabel(ticket.tripType)}</span>
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <div>
            <p className="text-xs text-white/75">From</p>
            <p className="font-display text-lg leading-tight font-bold">{ticket.origin}</p>
          </div>
          <svg aria-hidden viewBox="0 0 48 12" className="mb-1.5 w-12 text-aqua"><path d="M2 6h40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" /><circle cx="44" cy="6" r="3.5" fill="currentColor" /></svg>
          <div className="text-right">
            <p className="text-xs text-white/75">To</p>
            <p className="font-display text-lg leading-tight font-bold">{ticket.destination}</p>
          </div>
        </div>
      </div>
      <div className="relative px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted">Passenger</p>
            <p className="font-semibold">{ticket.passenger}</p>
          </div>
          {ticket.status === "boarded" ? <StatusBadge status="boarded" /> : ticket.status === "cancelled" ? <Badge tone="danger">Cancelled</Badge> : <StatusBadge status="confirmed" />}
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-4">
          <Detail label="Date" value={formatDate(ticket.departureAt)} />
          <Detail label="Departs" value={formatTime(ticket.departureAt)} mono />
          <Detail label="Seat" value={ticket.seat} mono big />
          <Detail label="Bus" value={ticket.busPlate} className="col-span-2" />
          <Detail label="Luggage" value={luggageLabel(ticket.luggage)} />
        </dl>
      </div>
      <div aria-hidden className="relative mx-6 border-t-2 border-dashed border-border">
        <span className="absolute -top-3 -left-9 size-6 rounded-full bg-ground" />
        <span className="absolute -top-3 -right-9 size-6 rounded-full bg-ground" />
      </div>
      <div className="flex flex-col items-center px-6 pt-5 pb-6">
        {ticket.qrSvg ? (
          <div
            role="img"
            aria-label={`QR code for ticket ${ticket.reference}. Show this to the driver.`}
            className={clsx("size-52 rounded-2xl bg-white p-3 [&_svg]:h-full [&_svg]:w-full", ticket.status !== "confirmed" && "opacity-40")}
            dangerouslySetInnerHTML={{ __html: ticket.qrSvg }}
          />
        ) : (
          <div className="skeleton size-52" />
        )}
        <p className="mt-3 text-center text-sm text-muted">
          {ticket.status === "boarded"
            ? "This ticket has been used."
            : ticket.status === "cancelled"
              ? `This trip was cancelled${ticket.cancelReason ? `: ${ticket.cancelReason}` : ""}. Your payment has been refunded.`
              : "Show this QR code and your UCC student ID to the driver of your bus when you board."}
        </p>
        <dl className="mt-4 grid w-full grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
          <Detail label="Booking reference" value={ticket.reference} mono small />
          <Detail label="Paid" value={cedis(ticket.amountPesewas)} mono small className="text-right" />
        </dl>
      </div>
    </motion.article>
  );
}

function Detail({ label, value, mono, big, small, className }: { label: string; value: string; mono?: boolean; big?: boolean; small?: boolean; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={clsx("font-semibold break-words", mono && "tabular", big && "font-display text-2xl leading-none font-extrabold text-accent-fg", small && "text-[13px]")}>{value}</dd>
    </div>
  );
}
