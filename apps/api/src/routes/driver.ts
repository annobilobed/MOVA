import { Router } from "express";
import { z } from "zod";
import { requireRole } from "../lib/auth.js";
import { query } from "../lib/db.js";
import { ah } from "../lib/errors.js";
import { serializeTrip, TRIP_SELECT } from "../lib/trips.js";
import { LUGGAGE_LABELS, type Luggage } from "../lib/money.js";

export const driver = Router();
driver.use(requireRole("driver"));

driver.get(
  "/trips",
  ah(async (req, res) => {
    const { rows } = await query(
      `${TRIP_SELECT} WHERE b.driver_id = $1 AND t.departure_at > now() - interval '12 hours' AND NOT t.is_cancelled ORDER BY t.departure_at`,
      [req.user!.id],
    );
    const result = await Promise.all(
      rows.map(async (r) => {
        const { rows: c } = await query(
          "SELECT count(*) FILTER (WHERE status = 'boarded')::int AS boarded, count(*)::int AS total FROM bookings WHERE trip_id = $1 AND status IN ('confirmed','boarded')",
          [r.id],
        );
        return { ...serializeTrip(r), boarded: c[0].boarded, passengers: c[0].total };
      }),
    );
    res.json({ trips: result });
  }),
);

const validateSchema = z.object({ code: z.string().trim().min(1).max(200), tripId: z.string().uuid() });

/**
 * Validate a scanned ticket for a trip on the driver's assigned bus.
 * A ticket is accepted once; repeat scans and wrong-bus tickets are rejected (FR-26..29).
 */
driver.post(
  "/validate",
  ah(async (req, res) => {
    const { code, tripId } = validateSchema.parse(req.body);
    const token = code.startsWith("MOVA1:") ? code.slice(6) : code;
    const { rows: tripRows } = await query(`${TRIP_SELECT} WHERE t.id = $1 AND b.driver_id = $2`, [tripId, req.user!.id]);
    if (!tripRows[0]) {
      return res.status(403).json({ result: "not_your_trip", message: "This trip isn't assigned to you." });
    }
    const { rows } = await query(
      `SELECT bk.*, u.full_name, u.student_id, t.bus_id, t.origin, t.destination, t.departure_at
       FROM bookings bk JOIN users u ON u.id = bk.user_id JOIN trips t ON t.id = bk.trip_id
       WHERE bk.qr_token = $1`,
      [token],
    );
    const bk = rows[0];
    if (!bk || bk.status === "cancelled") return res.json({ result: "invalid", message: "This isn't a valid MOVA ticket." });
    const passenger = { name: bk.full_name, studentId: bk.student_id, seat: bk.seat_number, route: `${bk.origin} → ${bk.destination}`, luggage: LUGGAGE_LABELS[bk.luggage as Luggage] };
    if (bk.trip_id !== tripId) {
      return res.json({ result: "wrong_bus", message: "This ticket is for a different trip or bus.", passenger });
    }
    const { rows: updated } = await query(
      "UPDATE bookings SET status = 'boarded', boarded_at = now(), boarded_by = $2 WHERE id = $1 AND status = 'confirmed' RETURNING boarded_at",
      [bk.id, req.user!.id],
    );
    if (!updated[0]) {
      // Re-check by the same driver on the same trip (e.g. after a luggage top-up): not a misuse.
      if (bk.boarded_by === req.user!.id) {
        const at = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Accra" }).format(new Date(bk.boarded_at));
        return res.json({
          result: "rechecked",
          message: `This ticket was scanned at ${at}. Only let this person on if they match the name and seat below — a shared screenshot looks the same.`,
          passenger,
          boardedAt: bk.boarded_at,
        });
      }
      return res.json({ result: "already_used", message: "This ticket has already been used.", passenger, boardedAt: bk.boarded_at });
    }
    res.json({ result: "valid", message: "Ticket valid. Passenger boarded.", passenger, boardedAt: updated[0].boarded_at });
  }),
);

/** Passenger list for a driver's own trip: a reference that keeps working if the network drops after loading. */
driver.get(
  "/trips/:id/passengers",
  ah(async (req, res) => {
    const { rows: t } = await query(`${TRIP_SELECT} WHERE t.id = $1 AND b.driver_id = $2`, [String(req.params.id), req.user!.id]).catch(() => ({ rows: [] as any[] }));
    if (!t[0]) return res.status(404).json({ error: { code: "not_found", message: "This trip isn't assigned to you." } });
    const { rows } = await query(
      `SELECT bk.seat_number, bk.luggage, bk.status, u.full_name, u.student_id FROM bookings bk JOIN users u ON u.id = bk.user_id
       WHERE bk.trip_id = $1 AND bk.status IN ('confirmed','boarded')
       ORDER BY NULLIF(regexp_replace(bk.seat_number, '\\D', '', 'g'), '')::int NULLS LAST`,
      [String(req.params.id)],
    );
    res.set("Cache-Control", "no-store");
    res.json({
      trip: serializeTrip(t[0]),
      passengers: rows.map((r) => ({ seat: r.seat_number, name: r.full_name, studentId: r.student_id, luggage: LUGGAGE_LABELS[r.luggage as Luggage], boarded: r.status === "boarded" })),
    });
  }),
);
