"use client";

import { Bus, Plus } from "lucide-react";
import { useState } from "react";
import { LoadState } from "@/components/load-state";
import { Alert, Button, Card, EmptyState, Field, PageHeader, SelectField } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";

interface BusRow { id: string; plate: string; capacity: number; driver: { id: string; name: string } | null }

export default function OperatorBuses() {
  const buses = useApi<{ buses: BusRow[] }>("/operator/buses");
  const drivers = useApi<{ drivers: { id: string; name: string }[] }>("/operator/drivers");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const errs: Record<string, string> = {};
    if (!d.plate || d.plate.trim().length < 3) errs.plate = "Enter the plate number";
    const cap = Number(d.capacity);
    if (!Number.isInteger(cap) || cap < 9 || cap > 90) errs.capacity = "Enter between 9 and 90 seats";
    setErrors(errs);
    setMsg(null);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await api("/operator/buses", { method: "POST", json: { plate: d.plate, capacity: cap, driverId: d.driverId || null } });
      setMsg({ tone: "success", text: `Bus ${d.plate.toUpperCase()} added.` });
      form.reset();
      buses.reload();
    } catch (err) {
      const e2 = err as ApiError;
      if (e2.fields) setErrors(Object.fromEntries(Object.entries(e2.fields).map(([k, v]) => [k, v?.[0]])));
      setMsg({ tone: "error", text: e2.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader title="Buses" description="Each bus gets the standard coach layout for its capacity (rows of 2 + 2 with a back row of 5)." />
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card as="section" className="overflow-hidden">
          <LoadState loading={buses.loading} error={buses.error} reload={buses.reload} label="Loading buses…" />
          {buses.data && !buses.data.buses.length && <div className="p-5"><EmptyState icon={<Bus />} title="No buses yet">Add your first bus with the form.</EmptyState></div>}
          {buses.data && buses.data.buses.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[15px]">
                <thead className="border-b border-border bg-ground text-xs font-semibold text-muted uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">Plate</th>
                    <th scope="col" className="px-4 py-3 text-right">Seats</th>
                    <th scope="col" className="px-4 py-3">Assigned driver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {buses.data.buses.map((b) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">{b.plate}</td>
                      <td className="tabular px-4 py-3 text-right">{b.capacity}</td>
                      <td className="px-4 py-3">{b.driver?.name ?? <span className="text-muted">Not assigned</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card as="section" className="p-5 xl:sticky xl:top-8">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Plus aria-hidden className="size-5 text-route" /> Add a bus</h2>
          <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-4">
            {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
            <Field label="Plate number" name="plate" autoCapitalize="characters" error={errors.plate} />
            <Field label="Seat capacity" name="capacity" type="number" inputMode="numeric" defaultValue={49} min={9} max={90} error={errors.capacity} helper="Standard coach: 49 seats" />
            <SelectField label="Assigned driver (optional)" name="driverId" defaultValue="">
              <option value="">No driver yet</option>
              {drivers.data?.drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </SelectField>
            <Button type="submit" loading={saving} loadingText="Adding bus…">Add bus</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
