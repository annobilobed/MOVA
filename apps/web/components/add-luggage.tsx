"use client";

import { Luggage as LuggageIcon, Plus } from "lucide-react";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { cedis } from "@/lib/format";
import type { Luggage, Ticket } from "@/lib/types";
import { LuggageChoice, LuggageRules, useLuggage } from "./luggage";
import { Alert, Button, Card } from "./ui";

const ORDER: Luggage[] = ["none", "standard", "large"];

/** Top up a ticket's luggage allowance (until two hours after departure). Pays only the difference. */
export function AddLuggage({ ticket }: { ticket: Ticket }) {
  const data = useLuggage();
  const [open, setOpen] = useState(false);
  const next = ORDER[ORDER.indexOf(ticket.luggage) + 1];
  const [choice, setChoice] = useState<Luggage>(next ?? ticket.luggage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stillOpen = ticket.status !== "cancelled" && new Date(ticket.departureAt).getTime() > Date.now() - 2 * 3600 * 1000;
  if (!next || !stillOpen) return null;

  const fee = (l: Luggage) => data?.options.find((o) => o.id === l)?.feePesewas ?? 0;
  const diff = fee(choice) - fee(ticket.luggage);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ authorizationUrl: string }>(`/tickets/${ticket.id}/luggage`, { method: "POST", json: { luggage: choice } });
      window.location.href = r.authorizationUrl;
    } catch (e) {
      setError((e as ApiError).message);
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <Plus aria-hidden className="size-4" /> Add luggage
      </Button>
    );
  }

  return (
    <Card as="section" className="p-5 text-left">
      <h2 className="flex items-center gap-2 text-lg font-bold"><LuggageIcon aria-hidden className="size-5 text-route" /> Add luggage</h2>
      <p className="mt-1 text-[15px] text-muted">Carrying more than your ticket allows? Add it now and pay only the difference. Your ticket updates straight away.</p>
      <div className="mt-4 flex flex-col gap-3">
        {error && <Alert tone="error">{error}</Alert>}
        {data && <LuggageChoice options={data.options} value={choice} onChange={setChoice} current={ticket.luggage} disabled={busy} />}
        <LuggageRules policy={data?.policy} compact />
        <div className="flex items-center justify-between border-t border-border pt-3 text-lg font-bold">
          <span>To pay</span>
          <span className="tabular">{cedis(Math.max(0, diff))}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button className="flex-1" onClick={pay} loading={busy} loadingText="Starting payment…" disabled={diff <= 0}>Pay {cedis(Math.max(0, diff))}</Button>
        </div>
      </div>
    </Card>
  );
}
