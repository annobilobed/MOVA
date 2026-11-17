import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../lib/auth.js";
import { config, paymentsInTestMode } from "../lib/config.js";
import { query } from "../lib/db.js";
import { ah, conflict, forbidden, HttpError, notFound } from "../lib/errors.js";
import { quote } from "../lib/money.js";
import { callbackUrl, finalizePayment, newReference, refreshFromProvider } from "../lib/payments.js";
import * as paystack from "../lib/paystack.js";
import { getSeatLock } from "../lib/redis.js";
import { getTripRow, serializeTrip } from "../lib/trips.js";

export const payments = Router();

const startSchema = z.object({
  tripId: z.string().uuid(),
  seat: z.string().trim().min(1).max(5),
  luggage: z.enum(["none", "standard", "large"]).default("none"),
  // Any client-supplied amount is ignored; the server always calculates it (FR-17).
});

function serializePayment(p: any, booking?: any) {
  return {
    reference: p.reference,
    status: p.status as string,
    statusReason: p.status_reason,
    tripId: p.trip_id,
    seat: p.seat_number,
    luggage: p.luggage,
    farePesewas: p.fare_pesewas,
    luggagePesewas: p.luggage_pesewas,
    amountPesewas: p.amount_pesewas,
    provider: p.provider,
    createdAt: p.created_at,
    bookingId: booking?.id ?? null,
  };
}

payments.post(
  "/",
  requireAuth,
  ah(async (req, res) => {
    const input = startSchema.parse(req.body);
    const user = req.user!;
    const row = await getTripRow(input.tripId);
    if (!row) throw notFound("We couldn't find that trip.");
    if (serializeTrip(row).status !== "available") throw conflict("trip_unavailable", "This trip can no longer be booked.");

    const lock = await getSeatLock(row.id, input.seat);
    if (!lock || lock.userId !== user.id) {
      throw conflict("lock_expired", "Your seat hold has expired. Please choose your seat again.");
    }

    // Reuse an open payment for the same trip, seat and luggage instead of creating duplicates.
    const { rows: open } = await query(
      `SELECT * FROM payments WHERE user_id = $1 AND trip_id = $2 AND seat_number = $3 AND luggage = $4
         AND status = 'pending' AND created_at > now() - interval '15 minutes' ORDER BY created_at DESC LIMIT 1`,
      [user.id, row.id, input.seat, input.luggage],
    );
    if (open[0]) {
      return res.json({ payment: serializePayment(open[0]), authorizationUrl: open[0].authorization_url, lockExpiresAt: lock.expiresAt });
    }

    const amounts = quote(row.fare_pesewas, input.luggage);
    const reference = newReference();
    const testMode = paymentsInTestMode();
    let authorizationUrl = `${config.webOrigin}/checkout/test/${reference}`;
    if (!testMode) {
      try {
        const tx = await paystack.initializeTransaction({
          email: user.email,
          amountPesewas: amounts.amountPesewas,
          reference,
          callbackUrl: callbackUrl(reference),
        });
        authorizationUrl = tx.authorization_url;
      } catch (err) {
        console.error("[paystack-init]", (err as Error).message);
        throw new HttpError(502, "payment_unavailable", "We couldn't reach the payment service. Your seat is still held — please try again.");
      }
    }
    const { rows } = await query(
      `INSERT INTO payments (reference, user_id, trip_id, seat_number, luggage, fare_pesewas, luggage_pesewas, amount_pesewas, provider, authorization_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [reference, user.id, row.id, input.seat, input.luggage, amounts.farePesewas, amounts.luggagePesewas, amounts.amountPesewas, testMode ? "test" : "paystack", authorizationUrl],
    );
    res.status(201).json({ payment: serializePayment(rows[0]), authorizationUrl, lockExpiresAt: lock.expiresAt });
  }),
);

payments.get(
  "/:reference",
  requireAuth,
  ah(async (req, res) => {
    const load = () => query("SELECT * FROM payments WHERE reference = $1", [String(req.params.reference)]);
    let { rows } = await load();
    if (!rows[0]) throw notFound("We couldn't find that payment.");
    if (rows[0].user_id !== req.user!.id) throw forbidden();
    if (rows[0].status === "pending") {
      await refreshFromProvider(rows[0].reference);
      ({ rows } = await load());
    }
    const { rows: b } = await query("SELECT id FROM bookings WHERE payment_id = $1", [rows[0].id]);
    const lock = await getSeatLock(rows[0].trip_id, rows[0].seat_number);
    res.set("Cache-Control", "no-store");
    res.json({
      payment: serializePayment(rows[0], b[0]),
      seatStillHeld: Boolean(lock && lock.userId === req.user!.id),
      lockExpiresAt: lock && lock.userId === req.user!.id ? lock.expiresAt : null,
    });
  }),
);

/**
 * Test-mode checkout only (no Paystack key configured): simulates the provider's verified outcome.
 * Disabled whenever a real key is set, and impossible in production (config refuses to start).
 */
payments.post(
  "/:reference/test-outcome",
  requireAuth,
  ah(async (req, res) => {
    if (!paymentsInTestMode()) throw notFound();
    const { outcome } = z.object({ outcome: z.enum(["success", "failed", "tampered"]) }).parse(req.body);
    const { rows } = await query("SELECT * FROM payments WHERE reference = $1", [String(req.params.reference)]);
    if (!rows[0]) throw notFound("We couldn't find that payment.");
    if (rows[0].user_id !== req.user!.id) throw forbidden();
    const amount = outcome === "tampered" ? rows[0].amount_pesewas - 100 : rows[0].amount_pesewas;
    const status = await finalizePayment(rows[0].reference, {
      status: outcome === "failed" ? "failed" : "success",
      amountPesewas: amount,
      currency: "GHS",
    });
    res.json({ status });
  }),
);
