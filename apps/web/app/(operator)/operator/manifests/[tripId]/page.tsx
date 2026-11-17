"use client";

import { ArrowLeft, Printer, Users } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { LoadState } from "@/components/load-state";
import { Badge, Button, Card, DemoBadge, EmptyState } from "@/components/ui";
import { formatDate, formatTime, luggageLabel, tripTypeLabel } from "@/lib/format";
import type { Trip } from "@/lib/types";
import { useApi } from "@/lib/use-api";

interface Passenger { seat: string; name: string; studentId: string | null; phone: string; luggage: string; boarded: boolean }

export default function Manifest({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const { data, error, loading, reload } = useApi<{ trip: Trip; passengers: Passenger[] }>(`/operator/trips/${tripId}/manifest`);
  const boarded = data?.passengers.filter((p) => p.boarded).length ?? 0;

  return (
    <div className="container-page py-8 sm:py-10 print:max-w-none print:p-0">
      <Link href="/operator/trips" className="no-print mb-6 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-muted hover:text-fg">
        <ArrowLeft aria-hidden className="size-4" /> Trips
      </Link>
      <LoadState loading={loading} error={error} reload={reload} label="Loading manifest…" />
      {data && (
        <>
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:mb-4">
            <div>
              <p className="text-sm font-semibold text-muted print:text-black">MOVA passenger manifest {data.trip.isDemo && <DemoBadge className="ml-1 print:ring-black" />}</p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl print:text-2xl">{data.trip.origin} → {data.trip.destination}</h1>
              <p className="mt-1 text-[15px] text-muted print:text-black">
                {formatDate(data.trip.departureAt)} at <span className="tabular font-semibold">{formatTime(data.trip.departureAt)}</span> · {data.trip.bus.plate} · {tripTypeLabel(data.trip.tripType)} · {data.trip.operator}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="tabular text-[15px]"><span className="font-bold">{data.passengers.length}</span> passengers · <span className="font-bold">{boarded}</span> boarded</p>
              <Button className="no-print" variant="outline" onClick={() => window.print()}><Printer className="size-4" />Print</Button>
            </div>
          </header>
          {data.passengers.length === 0 ? (
            <EmptyState icon={<Users />} title="No passengers yet">Bookings for this trip will appear here.</EmptyState>
          ) : (
            <Card className="overflow-hidden print:rounded-none print:border-0 print:shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-[15px] print:min-w-0 print:text-[12px]">
                  <thead className="border-b border-border bg-ground text-xs font-semibold text-muted uppercase print:bg-white print:text-black">
                    <tr>
                      <th scope="col" className="px-4 py-3">Seat</th>
                      <th scope="col" className="px-4 py-3">Passenger</th>
                      <th scope="col" className="px-4 py-3">Student ID</th>
                      <th scope="col" className="px-4 py-3">Phone</th>
                      <th scope="col" className="px-4 py-3">Luggage</th>
                      <th scope="col" className="px-4 py-3">Boarding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border print:divide-black/30">
                    {data.passengers.map((p) => (
                      <tr key={p.seat} className="break-inside-avoid">
                        <td className="tabular px-4 py-2.5 font-display text-lg font-extrabold print:text-sm">{p.seat}</td>
                        <td className="px-4 py-2.5 font-semibold">{p.name}</td>
                        <td className="tabular px-4 py-2.5">{p.studentId ?? "—"}</td>
                        <td className="tabular px-4 py-2.5">{p.phone}</td>
                        <td className="px-4 py-2.5">{luggageLabel(p.luggage)}</td>
                        <td className="px-4 py-2.5">{p.boarded ? <Badge tone="success">Boarded</Badge> : <Badge>Not yet</Badge>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
          <p className="mt-4 text-xs text-muted print:text-black">Contains personal data protected under Ghana's Data Protection Act, 2012 (Act 843). Handle and dispose of printed copies securely. Printed {new Date().toLocaleString("en-GB")}.</p>
        </>
      )}
    </div>
  );
}
