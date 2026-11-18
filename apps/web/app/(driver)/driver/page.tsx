"use client";

import { Route, ScanLine, Users } from "lucide-react";
import Link from "next/link";
import { DriverPassengers } from "@/components/driver-passengers";
import { LoadState } from "@/components/load-state";
import { Card, DemoBadge, EmptyState, PageHeader } from "@/components/ui";
import { formatDate, formatTime } from "@/lib/format";
import { buttonClass } from "@/lib/styles";
import type { Trip } from "@/lib/types";
import { useApi } from "@/lib/use-api";

type DriverTrip = Trip & { boarded: number; passengers: number };

export default function DriverHome() {
  const { data, error, loading, reload } = useApi<{ trips: DriverTrip[] }>("/driver/trips");
  return (
    <div className="container-page max-w-3xl py-8 sm:py-10">
      <PageHeader title="My trips" description="Trips assigned to your bus. Open the scanner to board passengers." />
      <LoadState loading={loading} error={error} reload={reload} label="Loading your trips…" />
      {data && !data.trips.length && (
        <EmptyState icon={<Route />} title="No trips assigned">Your operator hasn't assigned you to any upcoming trips yet.</EmptyState>
      )}
      <div className="grid gap-4">
        {data?.trips.map((t) => (
          <Card key={t.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="tabular font-display text-2xl font-extrabold">{formatTime(t.departureAt)} <span className="ml-1.5 text-base font-semibold text-muted">{formatDate(t.departureAt)}</span></p>
                <p className="mt-1 font-display text-lg font-bold">{t.origin} → {t.destination}</p>
                <p className="text-sm text-muted">{t.bus.plate}</p>
              </div>
              {t.isDemo && <DemoBadge />}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="inline-flex items-center gap-2 text-[15px]">
                <Users aria-hidden className="size-4.5 text-route" />
                <span className="tabular font-semibold">{t.boarded} of {t.passengers}</span> boarded
              </p>
              <Link href={`/driver/scan?trip=${t.id}`} className={buttonClass("primary", "lg")}><ScanLine className="size-5" /> Scan tickets</Link>
            </div>
            <DriverPassengers tripId={t.id} />
          </Card>
        ))}
      </div>
    </div>
  );
}
