"use client";

import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { LoadState } from "@/components/load-state";
import { SummaryRow } from "@/components/metric";
import { Badge, Card, DemoBadge, PageHeader } from "@/components/ui";
import { formatDate, formatTime } from "@/lib/format";
import { buttonClass } from "@/lib/styles";
import type { Trip } from "@/lib/types";
import { useApi } from "@/lib/use-api";

interface Overview { company: { name: string; isDemo: boolean } | null; metrics: { upcomingTrips: number; buses: number; upcomingPassengers: number; next24h: number } }
type OpTrip = Trip & { booked: number };

export default function OperatorOverview() {
  const ov = useApi<Overview>("/operator/overview");
  const trips = useApi<{ trips: OpTrip[] }>("/operator/trips");
  const m = ov.data?.metrics;
  const soon = (trips.data?.trips ?? []).filter((t) => t.status !== "departed").slice(0, 6);

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        title="Operations overview"
        description={ov.data?.company ? <span className="inline-flex items-center gap-2">{ov.data.company.name} {ov.data.company.isDemo && <DemoBadge />}</span> : "All companies"}
        actions={<Link href="/operator/trips#new" className={buttonClass()}><Plus className="size-4" />New trip</Link>}
      />
      {ov.error && <LoadState loading={false} error={ov.error} reload={ov.reload} label="" />}
      <SummaryRow
        loading={ov.loading}
        items={[
          { label: "Departing in 24 hours", value: m?.next24h },
          { label: "Upcoming trips", value: m?.upcomingTrips },
          { label: "Booked passengers", value: m?.upcomingPassengers },
          { label: "Buses", value: m?.buses },
        ]}
      />

      <Card as="section" className="mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold">Next departures</h2>
          <Link href="/operator/trips" className="inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-accent-fg hover:underline">All trips <ArrowRight className="size-4" /></Link>
        </div>
        <LoadState loading={trips.loading} error={trips.error} reload={trips.reload} label="Loading trips…" />
        {trips.data && !soon.length && <p className="px-5 py-8 text-center text-muted">No upcoming departures. Create a trip to get started.</p>}
        <ul className="divide-y divide-border">
          {soon.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
              <div className="w-28">
                <p className="tabular font-bold">{formatTime(t.departureAt)}</p>
                <p className="text-sm text-muted">{formatDate(t.departureAt)}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{t.origin} → {t.destination}</p>
                <p className="text-sm whitespace-nowrap text-muted">{t.bus.plate}</p>
              </div>
              <p className="tabular text-sm"><span className="font-semibold">{t.booked}</span><span className="text-muted"> / {t.bus.capacity} booked</span></p>
              {t.status === "fully_booked" && <Badge tone="danger">Full</Badge>}
              <Link href={`/operator/manifests/${t.id}`} className={buttonClass("outline", "sm")}>Manifest</Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
