import { Router } from "express";
import QRCode from "qrcode";
import { z } from "zod";
import { requireAuth } from "../lib/auth.js";
import { config, paymentsInTestMode } from "../lib/config.js";
import { query } from "../lib/db.js";
import { ah, badRequest, conflict, forbidden, HttpError, notFound } from "../lib/errors.js";
import { LUGGAGE_FEES, luggageRank, type Luggage } from "../lib/money.js";
import { callbackUrl, newReference } from "../lib/payments.js";
import * as paystack from "../lib/paystack.js";

export const tickets = Router();

const TICKET_SELECT = `
  SELECT bk.*, t.origin, t.destination, t.departure_at, t.trip_type, b.plate, c.name AS company_name,
    p.reference, p.amount_pesewas, u.full_name, u.student_id
  FROM bookings bk
  JOIN trips t ON t.id = bk.trip_id
  JOIN buses b ON b.id = t.bus_id
  JOIN companies c ON c.id = t.company_id
  JOIN payments p ON p.id = bk.payment_id
  JOIN users u ON u.id = bk.user_id`;

function serialize(r: any) {
  const departed = new Date(r.departure_at).getTime() < Date.now() - 6 * 3600 * 1000;
  return {
    id: r.id,
    tripId: r.trip_id,
    passenger: r.full_name,
    studentId: r.student_id,
    origin: r.origin,
    destination: r.destination,
    departureAt: new Date(r.departure_at).toISOString(),
    tripType: r.trip_type,
    busPlate: r.plate,
    operator: r.company_name,
    seat: r.seat_number,
    luggage: r.luggage,
    status: r.status as "confirmed" | "boarded" | "cancelled",
    boardedAt: r.boarded_at,
    reference: r.reference,
    amountPesewas: r.amount_pesewas,
    upcoming: r.status === "confirmed" && !departed,
  };
}

tickets.get(
  "/",
  requireAuth,
  ah(async (req, res) => {
    const { rows } = await query(`${TICKET_SELECT} WHERE bk.user_id = $1 ORDER BY t.departure_at DESC`, [req.user!.id]);
    res.json({ tickets: rows.map(serialize) });
  }),
);

tickets.get(
  "/:id",
  requireAuth,
  ah(async (req, res) => {
    const { rows } = await query(`${TICKET_SELECT} WHERE bk.id = $1`, [String(req.params.id)]).catch(() => ({ rows: [] as any[] }));
    const r = rows[0];
    if (!r) throw notFound("We couldn't find that ticket.");
    if (r.user_id !== req.user!.id) throw forbidden();
    // The QR encodes only the opaque ticket token; drivers validate it against the server.
    const qrSvg = await QRCode.toString(`MOVA1:${r.qr_token}`, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
    res.set("Cache-Control", "no-store");
    res.json({ ticket: { ...serialize(r), qrSvg } });
  }),
);

/**
 * Luggage top-up: pay only the difference to raise a ticket's luggage allowance.
 * Allowed until two hours after departure, so students can top up at the station or on board.
 */
tickets.post(
  "/:id/luggage",
  requireAuth,
  ah(async (req, res) => {
    const { luggage } = z.object({ luggage: z.enum(["standard", "large"]) }).parse(req.body);
    const { rows } = await query(`${TICKET_SELECT} WHERE bk.id = $1`, [String(req.params.id)]).catch(() => ({ rows: [] as any[] }));
    const bk = rows[0];
    if (!bk) throw notFound("We couldn't find that ticket.");
    if (bk.user_id !== req.user!.id) throw forbidden();
    if (bk.status === "cancelled") throw conflict("ticket_cancelled", "This ticket is cancelled.");
    if (new Date(bk.departure_at).getTime() < Date.now() - 2 * 3600 * 1000) throw conflict("trip_over", "This trip has finished, so luggage can no longer be added.");
    const current = bk.luggage as Luggage;
    if (luggageRank(luggage) <= luggageRank(current)) throw badRequest("no_upgrade", "Your ticket already includes this much luggage.");
    const amount = LUGGAGE_FEES[luggage] - LUGGAGE_FEES[current];

    const { rows: open } = await query(
      `SELECT * FROM payments WHERE kind = 'luggage_topup' AND booking_id = $1 AND luggage = $2 AND status = 'pending'
         AND created_at > now() - interval '15 minutes' ORDER BY created_at DESC LIMIT 1`,
      [bk.id, luggage],
    );
    if (open[0]) return res.json({ reference: open[0].reference, authorizationUrl: open[0].authorization_url, amountPesewas: open[0].amount_pesewas });

    const reference = newReference();
    let authorizationUrl = `${config.webOrigin}/checkout/test/${reference}`;
    if (!paymentsInTestMode()) {
      try {
        const tx = await paystack.initializeTransaction({ email: req.user!.email, amountPesewas: amount, reference, callbackUrl: callbackUrl(reference) });
        authorizationUrl = tx.authorization_url;
      } catch (err) {
        console.error("[paystack-init]", (err as Error).message);
        throw new HttpError(502, "payment_unavailable", "We couldn't reach the payment service. Please try again.");
      }
    }
    await query(
      `INSERT INTO payments (reference, user_id, trip_id, seat_number, luggage, fare_pesewas, luggage_pesewas, amount_pesewas, provider, authorization_url, kind, booking_id)
       VALUES ($1,$2,$3,$4,$5,0,$6,$6,$7,$8,'luggage_topup',$9)`,
      [reference, req.user!.id, bk.trip_id, bk.seat_number, luggage, amount, paymentsInTestMode() ? "test" : "paystack", authorizationUrl, bk.id],
    );
    res.status(201).json({ reference, authorizationUrl, amountPesewas: amount });
  }),
);
