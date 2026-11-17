"use client";

import { ArrowRight, Search, Ticket as TicketIcon } from "lucide-react";
import Link from "next/link";
import { LoadState } from "@/components/load-state";
import { useSession } from "@/components/session";
import { TicketCard } from "@/components/ticket-card";
import { TicketRow } from "@/components/ticket-row";
import { TripSearch } from "@/components/trip-search";
import { Card, EmptyState } from "@/components/ui";
import { buttonClass } from "@/lib/styles";
import type { Ticket } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export default function Dashboard() {
  const { user } = useSession();
  const { data, error, loading, reload } = useApi<{ tickets: Ticket[] }>("/tickets");
  const upcoming = (data?.tickets ?? []).filter((t) => t.upcoming).sort((a, b) => a.departureAt.localeCompare(b.departureAt));
  const next = upcoming[0];
  const nextFull = useApi<{ ticket: Ticket }>(next ? `/tickets/${next.id}` : null);
  const firstName = user?.fullName.split(" ")[0];

  return (
    <div className="container-page max-w-5xl py-8 sm:py-10">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Hi {firstName}</h1>
      <p className="mt-1 text-muted">{next ? "Your next trip is coming up." : "Where are you heading next?"}</p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-8">
          <Card as="section" className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Search aria-hidden className="size-5 text-route" /> Find a trip</h2>
            <TripSearch />
          </Card>
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Upcoming tickets</h2>
              <Link href="/tickets" className="inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-accent-fg hover:underline">All tickets <ArrowRight className="size-4" /></Link>
            </div>
            <LoadState loading={loading} error={error} reload={reload} label="Loading your tickets…" />
            {data && (upcoming.length ? (
              <div className="grid gap-3">{upcoming.map((t) => <TicketRow key={t.id} ticket={t} />)}</div>
            ) : (
              <EmptyState icon={<TicketIcon />} title="No upcoming trips" action={<Link href="/trips" className={buttonClass()}>Find available trips</Link>}>
                When you book a seat, your ticket shows up here.
              </EmptyState>
            ))}
          </section>
        </div>
        {next && (
          <aside aria-label="Next trip ticket" className="lg:sticky lg:top-8">
            <h2 className="mb-4 text-lg font-bold">Next trip</h2>
            {nextFull.data ? <TicketCard ticket={nextFull.data.ticket} /> : <div className="skeleton h-[560px] w-full rounded-[24px]" />}
          </aside>
        )}
      </div>
    </div>
  );
}
