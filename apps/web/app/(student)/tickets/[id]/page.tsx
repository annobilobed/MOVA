"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { LoadState } from "@/components/load-state";
import { TicketCard } from "@/components/ticket-card";
import type { Ticket } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading, reload } = useApi<{ ticket: Ticket }>(`/tickets/${id}`);
  return (
    <div className="container-page max-w-xl py-8 sm:py-10">
      <Link href="/tickets" className="mb-6 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-muted hover:text-fg">
        <ArrowLeft aria-hidden className="size-4" /> My tickets
      </Link>
      <h1 className="sr-only">Ticket</h1>
      <LoadState loading={loading} error={error} reload={reload} label="Loading ticket…" />
      {data && <TicketCard ticket={data.ticket} />}
      {data && <p className="mt-6 text-center text-sm text-muted">Need to change or cancel? Booking cancellation isn't available yet. Contact support from the <Link href="/help#contact" className="font-semibold text-accent-fg underline">Help page</Link>.</p>}
    </div>
  );
}
