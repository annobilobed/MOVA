import { Router } from "express";
import QRCode from "qrcode";
import { requireAuth } from "../lib/auth.js";
import { query } from "../lib/db.js";
import { ah, forbidden, notFound } from "../lib/errors.js";

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
