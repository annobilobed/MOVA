"use client";

import { FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Button, Card, RouteLoader } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { cedis } from "@/lib/format";
import type { Payment } from "@/lib/types";

/**
 * Stand-in for the Paystack payment page, used only while no Paystack key is configured.
 * The API refuses these calls whenever a real key is set.
 */
export function TestCheckout({ reference }: { reference: string }) {
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    api<{ payment: Payment }>(`/payments/${reference}`).then((r) => setPayment(r.payment)).catch((e) => setError((e as ApiError).message));
  }, [reference]);

  async function outcome(o: "success" | "failed" | "tampered") {
    setBusy(o);
    try {
      await api(`/payments/${reference}/test-outcome`, { method: "POST", json: { outcome: o } });
      router.push(`/payments/${reference}`);
    } catch (e) {
      setError((e as ApiError).message);
      setBusy(null);
    }
  }

  return (
    <div className="container-page max-w-lg py-12">
      <Alert tone="warning" title="Test mode — no real money moves" className="mb-6">
        Paystack isn't connected yet, so this page stands in for the Paystack checkout. Choose an outcome to test the booking flow.
      </Alert>
      {error && <Alert tone="error" className="mb-6">{error}</Alert>}
      {!payment && !error && <RouteLoader label="Loading payment…" />}
      {payment && (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-sun/30 text-sun-ink dark:text-sun"><FlaskConical aria-hidden className="size-5" /></span>
            <div>
              <h1 className="text-xl font-bold">Test payment</h1>
              <p className="tabular text-sm text-muted">{payment.reference}</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted">Amount</p>
          <p className="tabular font-display text-3xl font-extrabold">{cedis(payment.amountPesewas)}</p>
          {payment.status !== "pending" ? (
            <Button className="mt-6 w-full" onClick={() => router.push(`/payments/${reference}`)}>See payment status</Button>
          ) : (
            <div className="mt-6 grid gap-2">
              <Button size="lg" onClick={() => outcome("success")} loading={busy === "success"} disabled={!!busy}>Simulate successful payment</Button>
              <Button variant="outline" onClick={() => outcome("failed")} loading={busy === "failed"} disabled={!!busy}>Simulate failed payment</Button>
              <Button variant="text" onClick={() => outcome("tampered")} loading={busy === "tampered"} disabled={!!busy}>Simulate wrong amount (flagged)</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
