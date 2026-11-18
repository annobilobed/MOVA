import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/format";
import type { Ticket } from "@/lib/types";
import { StatusBadge } from "./ui";

export function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className={clsx(
        "group flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-soft transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift sm:p-5",
        !ticket.upcoming && "opacity-80",
      )}
    >
      <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-info-bg text-center">
        <span className="text-[11px] font-semibold text-muted">Seat</span>
        <span className="tabular -mt-1 font-display text-xl font-extrabold text-accent-fg">{ticket.seat}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-bold">{ticket.origin} → {ticket.destination}</p>
        <p className="text-sm text-muted">
          {formatDate(ticket.departureAt)} · <span className="tabular">{formatTime(ticket.departureAt)}</span> · {ticket.busPlate}
        </p>
      </div>
      {ticket.status === "cancelled" ? <StatusBadge status="refunded" /> : <StatusBadge status={ticket.status === "boarded" ? "boarded" : "confirmed"} />}
      <ChevronRight aria-hidden className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
