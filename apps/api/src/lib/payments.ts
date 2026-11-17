import crypto from "node:crypto";
import type pg from "pg";
import { config, paymentsInTestMode } from "./config.js";
import { pool, query } from "./db.js";
import { getSeatLock, releaseSeat } from "./redis.js";
import * as paystack from "./paystack.js";

export type ProviderOutcome = { status: "success" | "failed"; amountPesewas: number; currency: string };

export const newReference = () => `MOVA-${crypto.randomBytes(9).toString("base64url").toUpperCase()}`;
const newQrToken = () => crypto.randomBytes(24).toString("base64url");

async function setStatus(client: pg.PoolClient, id: string, status: string, reason: string | null) {
  await client.query(
    "UPDATE payments SET status = $2::payment_status, status_reason = $3, updated_at = now(), paid_at = CASE WHEN $2::payment_status IN ('successful','flagged','refunded') THEN COALESCE(paid_at, now()) ELSE paid_at END WHERE id = $1",
    [id, status, reason],
  );
}

async function refund(reference: string) {
  if (paymentsInTestMode()) return; // test-mode payments move no money
  try {
    await paystack.refundTransaction(reference);
  } catch (err) {
    console.error("[refund-failed]", reference, (err as Error).message);
    await query("INSERT INTO audit_log (action, target, details) VALUES ('refund_failed', $1, $2)", [
      reference,
      JSON.stringify({ message: (err as Error).message }),
    ]);
  }
}

/**
 * Apply a verified provider outcome to a payment exactly once.
 * Safe to call repeatedly (duplicate webhooks, polling): only a pending payment changes.
 * Every successful payment ends in a booking or a refund (NFR-2).
 */
export async function finalizePayment(reference: string, outcome: ProviderOutcome) {
  const client = await pool.connect();
  let refundNeeded = false;
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("SELECT * FROM payments WHERE reference = $1 FOR UPDATE", [reference]);
    const payment = rows[0];
    if (!payment) {
      await client.query("ROLLBACK");
      return null;
    }
    if (payment.status !== "pending") {
      await client.query("COMMIT");
      return payment.status as string;
    }

    if (outcome.status === "failed") {
      await setStatus(client, payment.id, "failed", "Payment was not completed.");
      await client.query("COMMIT");
      return "failed";
    }

    if (outcome.amountPesewas !== payment.amount_pesewas || outcome.currency !== "GHS") {
      await setStatus(client, payment.id, "flagged", "Amount or currency did not match the booking.");
      await client.query("COMMIT");
      return "flagged";
    }

    // Seat still ours? Another student may hold it if our lock expired.
    const lock = await getSeatLock(payment.trip_id, payment.seat_number);
    const heldByOther = lock && lock.userId !== payment.user_id;

    let booked = false;
    if (!heldByOther) {
      await client.query("SAVEPOINT book");
      try {
        await client.query(
          `INSERT INTO bookings (trip_id, user_id, payment_id, seat_number, luggage, qr_token)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [payment.trip_id, payment.user_id, payment.id, payment.seat_number, payment.luggage, newQrToken()],
        );
        booked = true;
      } catch (err: any) {
        if (err.code !== "23505") throw err; // unique violation: seat already booked
        await client.query("ROLLBACK TO SAVEPOINT book");
      }
    }

    if (booked) {
      await setStatus(client, payment.id, "successful", null);
    } else {
      await setStatus(client, payment.id, "refunded", "The seat was taken before your payment completed, so it was refunded.");
      refundNeeded = true;
    }
    await client.query("COMMIT");
    if (booked) await releaseSeat(payment.trip_id, payment.seat_number, payment.user_id);
    if (refundNeeded) await refund(reference);
    return booked ? "successful" : "refunded";
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Ask Paystack for the authoritative status of a pending payment (used after interruptions). */
export async function refreshFromProvider(reference: string) {
  if (paymentsInTestMode()) return;
  try {
    const tx = await paystack.verifyTransaction(reference);
    if (tx.status === "success") {
      await finalizePayment(reference, { status: "success", amountPesewas: tx.amount, currency: tx.currency });
    } else if (tx.status === "failed" || tx.status === "abandoned" || tx.status === "reversed") {
      if (tx.status !== "abandoned") await finalizePayment(reference, { status: "failed", amountPesewas: tx.amount, currency: tx.currency });
    }
  } catch (err) {
    console.warn("[verify]", reference, (err as Error).message);
  }
}

export const callbackUrl = (reference: string) => `${config.webOrigin}/payments/${encodeURIComponent(reference)}`;
