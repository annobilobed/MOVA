import clsx from "clsx";
import { ArrowRight, Bus, Users } from "lucide-react";
import Link from "next/link";
import { cedis, formatDate, formatTime, tripTypeLabel } from "@/lib/format";
import type { Trip } from "@/lib/types";
import { buttonClass } from "@/lib/styles";
import { Badge, DemoBadge } from "./ui";

export function TripCard({ trip }: { trip: Trip }) {
  const low = trip.bookable && trip.seatsLeft <= 5;
  return (
    <article className="group relative flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift sm:flex-row sm:items-center sm:gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={trip.tripType === "campus_shuttle" ? "info" : "neutral"}>{tripTypeLabel(trip.tripType)}</Badge>
          {trip.isDemo && <DemoBadge />}
          {trip.status === "fully_booked" && <Badge tone="danger">Fully booked</Badge>}
          {trip.status === "departed" && <Badge>Departed</Badge>}
          {trip.status === "available" && trip.seatsLeft === 0 && <Badge tone="warning">All seats on hold</Badge>}
        </div>
        <div>
          <p className="tabular font-display text-[1.65rem] leading-none font-extrabold">
            {formatTime(trip.departureAt)} <span className="ml-1.5 text-base font-semibold text-muted">{formatDate(trip.departureAt)}</span>
          </p>
          <div className="mt-3 grid grid-cols-[12px_1fr] gap-x-3 gap-y-1.5">
            <span aria-hidden className="relative mt-1.5 size-3 rounded-full border-2 border-route bg-surface after:absolute after:top-[calc(100%+2px)] after:left-1/2 after:h-[calc(100%+8px)] after:w-0.5 after:-translate-x-1/2 after:bg-[repeating-linear-gradient(180deg,var(--route)_0_3px,transparent_3px_6px)]" />
            <p className="text-[15px] text-muted"><span className="sr-only">From </span>{trip.origin}</p>
            <span aria-hidden className="mt-1.5 size-3 rounded-full bg-route" />
            <h3 className="font-display text-lg leading-snug font-bold">
              <Link href={`/trips/${trip.id}`} className="rounded-sm after:absolute after:inset-0 after:rounded-[var(--radius-card)]">
                <span className="sr-only">To </span>{trip.destination}
              </Link>
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
          <span className={clsx("inline-flex items-center gap-1.5", low && "font-semibold text-coral-ink dark:text-coral")}>
            <Users aria-hidden className="size-4" />
            {trip.seatsLeft} {trip.seatsLeft === 1 ? "seat" : "seats"} left
          </span>
          <span className="inline-flex items-center gap-1.5 truncate"><Bus aria-hidden className="size-4" />{trip.operator}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-border pt-4 sm:flex-col sm:items-end sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
        <p>
          <span className="sr-only">Fare </span>
          <span className="tabular font-display text-2xl font-extrabold">{cedis(trip.farePesewas)}</span>
        </p>
        {trip.bookable ? (
          <span className={buttonClass("primary", "sm", "relative z-0 pointer-events-none")} aria-hidden>
            Choose seat <ArrowRight className="size-4" />
          </span>
        ) : (
          <span className="text-sm font-semibold text-muted">Not bookable</span>
        )}
      </div>
    </article>
  );
}

export function TripCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-5 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-col gap-3">
        <div className="skeleton h-5 w-28" />
        <div className="skeleton h-8 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
      <div className="skeleton h-10 w-32" />
    </div>
  );
}
