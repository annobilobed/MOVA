"use client";

import { ChevronDown, Users } from "lucide-react";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Badge, Button } from "./ui";

interface Passenger { seat: string; name: string; studentId: string | null; luggage: string; boarded: boolean }

/** Read-only passenger list for the driver. Once opened it stays on screen, so it still helps if the network drops. */
export function DriverPassengers({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Passenger[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        setList((await api<{ passengers: Passenger[] }>(`/driver/trips/${tripId}/passengers`)).passengers);
        setError(null);
      } catch (e) {
        setError((e as ApiError).message + (list ? " Showing the list from earlier." : ""));
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="mt-3">
      <Button variant="outline" size="sm" onClick={toggle} aria-expanded={open} loading={loading}>
        <Users aria-hidden className="size-4" /> Passenger list <ChevronDown aria-hidden className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-border">
          {error && <p role="alert" className="bg-warning-bg px-4 py-2 text-sm">{error}</p>}
          {list && list.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted">No passengers booked yet.</p>}
          {list && list.length > 0 && (
            <ul className="divide-y divide-border">
              {list.map((p) => (
                <li key={p.seat} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="tabular w-8 font-display text-lg font-black text-accent-fg">{p.seat}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.name}</span>
                    <span className="block text-xs text-muted">{p.studentId ?? "—"} · {p.luggage}</span>
                  </span>
                  {p.boarded ? <Badge tone="success">Boarded</Badge> : <Badge>Not yet</Badge>}
                </li>
              ))}
            </ul>
          )}
          <p className="bg-ground px-4 py-2 text-xs text-muted">Reference only. Always scan tickets to board passengers.</p>
        </div>
      )}
    </div>
  );
}
