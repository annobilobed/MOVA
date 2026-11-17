"use client";

import { Ticket as TicketIcon } from "lucide-react";
import Link from "next/link";
import { LoadState } from "@/components/load-state";
import { TicketRow } from "@/components/ticket-row";
import { EmptyState, PageHeader } from "@/components/ui";
import { buttonClass } from "@/lib/styles";
import type { Ticket } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export default function TicketsPage() {
  const { data, error, loading, reload } = useApi<{ tickets: Ticket[] }>("/tickets");
  const tickets = data?.tickets ?? [];
  const upcoming = tickets.filter((t) => t.upcoming).sort((a, b) => a.departureAt.localeCompare(b.departureAt));
  const past = tickets.filter((t) => !t.upcoming);

  return (
    <div className="container-page max-w-3xl py-8 sm:py-10">
      <PageHeader title="My tickets" description="Show the QR code to your driver when you board." />
      <LoadState loading={loading} error={error} reload={reload} label="Loading your tickets…" />
      {data && !tickets.length && (
        <EmptyState icon={<TicketIcon />} title="No tickets yet" action={<Link href="/trips" className={buttonClass()}>Find available trips</Link>}>
          Book a seat and your QR ticket appears here as soon as your payment is confirmed.
        </EmptyState>
      )}
      {upcoming.length > 0 && (
        <section aria-labelledby="up">
          <h2 id="up" className="mb-3 text-lg font-bold">Upcoming</h2>
          <div className="grid gap-3">{upcoming.map((t) => <TicketRow key={t.id} ticket={t} />)}</div>
        </section>
      )}
      {past.length > 0 && (
        <section aria-labelledby="past" className="mt-10">
          <h2 id="past" className="mb-3 text-lg font-bold">Past and used</h2>
          <div className="grid gap-3">{past.map((t) => <TicketRow key={t.id} ticket={t} />)}</div>
        </section>
      )}
    </div>
  );
}
