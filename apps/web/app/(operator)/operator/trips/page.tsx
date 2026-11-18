"use client";

import clsx from "clsx";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CancelTripButton } from "@/components/cancel-trip";
import { LoadState } from "@/components/load-state";
import { Alert, Badge, Button, Card, DemoBadge, Field, PageHeader, SelectField, inputClass } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { cedis, formatDate, formatTime, tripTypeLabel } from "@/lib/format";
import { buttonClass } from "@/lib/styles";
import type { Trip } from "@/lib/types";
import { useApi } from "@/lib/use-api";

type OpTrip = Trip & { booked: number };
interface BusRow { id: string; plate: string; capacity: number; driver: { name: string } | null }

const statusBadge: Record<Trip["status"], React.ReactNode> = {
  available: <Badge tone="success">Open</Badge>,
  fully_booked: <Badge tone="danger">Fully booked</Badge>,
  departed: <Badge>Departed</Badge>,
  cancelled: <Badge tone="warning">Cancelled</Badge>,
};

export default function OperatorTrips() {
  const [when, setWhen] = useState<"upcoming" | "past">("upcoming");
  const trips = useApi<{ trips: OpTrip[] }>(`/operator/trips${when === "past" ? "?when=past" : ""}`);
  const buses = useApi<{ buses: BusRow[] }>("/operator/buses");
  const [q, setQ] = useState("");
  const [type, setType] = useState("");

  const filtered = useMemo(
    () =>
      (trips.data?.trips ?? []).filter(
        (t) => (!type || t.tripType === type) && (!q || `${t.origin} ${t.destination} ${t.bus.plate}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [trips.data, q, type],
  );

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader title="Trips" description="Create departures and open passenger manifests." />

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card as="section" className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
            <div role="tablist" aria-label="Trip period" className="inline-flex rounded-xl bg-ground p-1">
              {(["upcoming", "past"] as const).map((w) => (
                <button key={w} role="tab" aria-selected={when === w} onClick={() => setWhen(w)} className={clsx("rounded-lg px-3.5 py-1.5 text-sm font-semibold capitalize", when === w ? "bg-surface text-fg shadow-soft" : "text-muted")}>
                  {w}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <label htmlFor="trip-filter" className="sr-only">Search trips</label>
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" />
              <input id="trip-filter" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search route or plate" className={clsx(inputClass(false, true), "h-10")} />
            </div>
            <label htmlFor="type-filter" className="sr-only">Trip type</label>
            <select id="type-filter" value={type} onChange={(e) => setType(e.target.value)} className={clsx(inputClass(), "h-10 sm:w-44")}>
              <option value="">All types</option>
              <option value="inter_regional">Inter-regional</option>
              <option value="campus_shuttle">Campus shuttle</option>
            </select>
          </div>
          <LoadState loading={trips.loading} error={trips.error} reload={trips.reload} label="Loading trips…" />
          {trips.data && !filtered.length && <p className="px-5 py-10 text-center text-muted">{trips.data.trips.length ? "No trips match your filters." : `No ${when} trips.`}</p>}
          {filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[15px]">
                <thead className="border-b border-border bg-ground text-xs font-semibold text-muted uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">Departure</th>
                    <th scope="col" className="px-4 py-3">Route</th>
                    <th scope="col" className="px-4 py-3">Bus</th>
                    <th scope="col" className="px-4 py-3 text-right">Fare</th>
                    <th scope="col" className="px-4 py-3 text-right">Booked</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-ground/60">
                      <td className="px-4 py-3 whitespace-nowrap"><span className="tabular font-semibold">{formatTime(t.departureAt)}</span><br /><span className="text-sm text-muted">{formatDate(t.departureAt)}</span></td>
                      <td className="px-4 py-3"><span className="font-semibold">{t.origin} → {t.destination}</span><br /><span className="text-sm text-muted">{tripTypeLabel(t.tripType)} {t.isDemo && <DemoBadge className="ml-1" />}</span></td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{t.bus.plate}</td>
                      <td className="tabular px-4 py-3 text-right">{cedis(t.farePesewas)}</td>
                      <td className="tabular px-4 py-3 text-right">{t.booked} / {t.bus.capacity}</td>
                      <td className="px-4 py-3">{statusBadge[t.status]}</td>
                      <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><CancelTripButton trip={t} booked={t.booked} onDone={trips.reload} /><Link href={`/operator/manifests/${t.id}`} className={buttonClass("outline", "sm")}>Manifest</Link></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <NewTripForm buses={buses.data?.buses ?? []} busesLoading={buses.loading} onCreated={trips.reload} />
      </div>
    </div>
  );
}

function NewTripForm({ buses, busesLoading, onCreated }: { buses: BusRow[]; busesLoading: boolean; onCreated: () => void }) {
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const minLocal = useMemo(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const errs: Record<string, string> = {};
    if (!d.busId) errs.busId = "Choose a bus";
    if (!d.origin?.trim()) errs.origin = "Enter the origin";
    if (!d.destination?.trim()) errs.destination = "Enter the destination";
    if (!d.departureAt) errs.departureAt = "Choose the departure time";
    else if (new Date(`${d.departureAt}:00Z`).getTime() <= Date.now()) errs.departureAt = "Departure time must be in the future";
    if (!(Number(d.fareGhs) > 0)) errs.fareGhs = "Enter a fare above 0";
    setErrors(errs);
    setMsg(null);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      // Times are entered in Accra time (UTC+0, no daylight saving).
      await api("/operator/trips", { method: "POST", json: { ...d, departureAt: `${d.departureAt}:00Z` } });
      setMsg({ tone: "success", text: `Trip to ${d.destination} created.` });
      form.reset();
      onCreated();
    } catch (err) {
      const e2 = err as ApiError;
      if (e2.fields) setErrors(Object.fromEntries(Object.entries(e2.fields).map(([k, v]) => [k, v?.[0]])));
      setMsg({ tone: "error", text: e2.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card as="section" className="p-5 xl:sticky xl:top-8">
      <h2 id="new" className="flex scroll-mt-24 items-center gap-2 text-lg font-bold"><Plus aria-hidden className="size-5 text-route" /> New trip</h2>
      <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-4">
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <SelectField label="Bus" name="busId" defaultValue="" error={errors.busId} helper={!busesLoading && !buses.length ? "Add a bus first on the Buses page." : undefined}>
          <option value="" disabled>{busesLoading ? "Loading buses…" : "Choose a bus"}</option>
          {buses.map((b) => <option key={b.id} value={b.id}>{b.plate} · {b.capacity} seats</option>)}
        </SelectField>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Field label="Origin" name="origin" error={errors.origin} />
          <Field label="Destination" name="destination" error={errors.destination} />
        </div>
        <Field label="Departure (Accra time)" name="departureAt" type="datetime-local" min={minLocal} error={errors.departureAt} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Field label="Fare (GH₵)" name="fareGhs" type="number" inputMode="decimal" min="0.01" step="0.01" error={errors.fareGhs} />
          <SelectField label="Trip type" name="tripType" defaultValue="inter_regional">
            <option value="inter_regional">Inter-regional</option>
            <option value="campus_shuttle">Campus shuttle</option>
          </SelectField>
        </div>
        <Button type="submit" loading={saving} loadingText="Creating trip…">Create trip</Button>
      </form>
    </Card>
  );
}
