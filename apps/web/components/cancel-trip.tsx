"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Trip } from "@/lib/types";
import { Alert, Button, Field } from "./ui";

/** Cancel a trip with a reason passengers will see. Cancels every ticket and refunds every payment. */
export function CancelTripButton({ trip, booked, onDone }: { trip: Trip; booked: number; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) ref.current?.showModal();
  }, [open]);
  if (trip.status === "cancelled" || trip.status === "departed") return null;

  async function confirm() {
    if (reason.trim().length < 3) {
      setError("Give a short reason passengers will see, e.g. \"Bus breakdown\".");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api(`/operator/trips/${trip.id}/cancel`, { method: "POST", json: { reason } });
      setOpen(false);
      onDone();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="text" className="text-danger hover:bg-danger-bg" onClick={() => setOpen(true)}>Cancel trip</Button>
      {open && (
        <dialog ref={ref} onClose={() => setOpen(false)} aria-labelledby="ct-title" className="m-auto w-[min(500px,calc(100vw-2rem))] rounded-[var(--radius-card)] border border-border bg-surface p-6 text-left text-fg shadow-float backdrop:bg-night/60 backdrop:backdrop-blur-sm">
          <h2 id="ct-title" className="text-xl font-bold">Cancel {trip.origin} → {trip.destination}?</h2>
          <p className="mt-1 text-[15px] text-muted">{formatDateTime(trip.departureAt)} · {trip.bus.plate}</p>
          <Alert tone="warning" className="mt-4" title={booked ? `${booked} ${booked === 1 ? "passenger" : "passengers"} will be refunded` : "No passengers have booked yet"}>
            Every ticket on this trip is cancelled and every payment, including luggage top-ups, is refunded. This can't be undone.
          </Alert>
          <Field className="mt-4" label="Reason passengers will see" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Bus breakdown" error={error ?? undefined} />
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Keep trip</Button>
            <Button variant="danger" onClick={confirm} loading={busy} loadingText="Cancelling…">Cancel and refund</Button>
          </div>
        </dialog>
      )}
    </>
  );
}
