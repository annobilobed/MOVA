import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../lib/auth.js";
import { query } from "../lib/db.js";
import { ah, badRequest, conflict, notFound } from "../lib/errors.js";
import { layoutSeats } from "../lib/layout.js";
import { LUGGAGE_DETAILS, LUGGAGE_FEES, LUGGAGE_LABELS, LUGGAGE_ORDER, LUGGAGE_POLICY, quote } from "../lib/money.js";
import { lockSeat, releaseSeat, tripLocks } from "../lib/redis.js";
import { getTripRow, seatMap, serializeTrip, TRIP_SELECT } from "../lib/trips.js";

export const trips = Router();

const searchSchema = z.object({
  origin: z.string().trim().max(80).optional(),
  destination: z.string().trim().max(80).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  type: z.enum(["inter_regional", "campus_shuttle"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

trips.get(
  "/",
  ah(async (req, res) => {
    const q = searchSchema.parse(req.query);
    const where = ["NOT t.is_cancelled", "t.departure_at > now()"];
    const params: unknown[] = [];
    if (q.origin) { params.push(`%${q.origin}%`); where.push(`t.origin ILIKE $${params.length}`); }
    if (q.destination) { params.push(`%${q.destination}%`); where.push(`t.destination ILIKE $${params.length}`); }
    if (q.date) {
      params.push(q.date);
      where.push(`(t.departure_at AT TIME ZONE 'Africa/Accra')::date = $${params.length}::date`);
    }
    if (q.type) { params.push(q.type); where.push(`t.trip_type = $${params.length}`); }
    params.push(q.limit);
    const { rows } = await query(`${TRIP_SELECT} WHERE ${where.join(" AND ")} ORDER BY t.departure_at LIMIT $${params.length}`, params);
    const result = await Promise.all(rows.map(async (r) => serializeTrip(r, (await tripLocks(r.id)).size)));
    res.json({ trips: result });
  }),
);

/** Distinct places for search suggestions — only places that have upcoming trips. */
trips.get(
  "/places",
  ah(async (_req, res) => {
    const { rows } = await query(
      `SELECT DISTINCT origin AS place, 'origin' AS kind FROM trips WHERE departure_at > now() AND NOT is_cancelled
       UNION SELECT DISTINCT destination, 'destination' FROM trips WHERE departure_at > now() AND NOT is_cancelled`,
    );
    res.json({
      origins: rows.filter((r) => r.kind === "origin").map((r) => r.place).sort(),
      destinations: rows.filter((r) => r.kind === "destination").map((r) => r.place).sort(),
    });
  }),
);

trips.get(
  "/luggage",
  (_req, res) =>
    res.json({
      policy: LUGGAGE_POLICY,
      options: LUGGAGE_ORDER.map((k) => ({ id: k, label: LUGGAGE_LABELS[k], detail: LUGGAGE_DETAILS[k], feePesewas: LUGGAGE_FEES[k] })),
    }),
);

trips.get(
  "/:id",
  ah(async (req, res) => {
    const row = await getTripRow(String(req.params.id)).catch(() => null);
    if (!row) throw notFound("We couldn't find that trip.");
    res.json({ trip: serializeTrip(row, (await tripLocks(row.id)).size) });
  }),
);

trips.get(
  "/:id/seats",
  ah(async (req, res) => {
    const row = await getTripRow(String(req.params.id)).catch(() => null);
    if (!row) throw notFound("We couldn't find that trip.");
    const map = await seatMap(row, req.user?.id);
    res.set("Cache-Control", "no-store");
    res.json({ trip: serializeTrip(row, Object.values(map.states).filter((s) => s === "locked" || s === "selected").length), ...map });
  }),
);

trips.get(
  "/:id/quote",
  ah(async (req, res) => {
    const luggage = z.enum(["none", "standard", "large"]).default("none").parse(req.query.luggage);
    const row = await getTripRow(String(req.params.id)).catch(() => null);
    if (!row) throw notFound("We couldn't find that trip.");
    res.json({ quote: quote(row.fare_pesewas, luggage) });
  }),
);

const lockSchema = z.object({ seat: z.string().trim().min(1).max(5) });

trips.post(
  "/:id/locks",
  requireAuth,
  ah(async (req, res) => {
    const { seat } = lockSchema.parse(req.body);
    const row = await getTripRow(String(req.params.id)).catch(() => null);
    if (!row) throw notFound("We couldn't find that trip.");
    const trip = serializeTrip(row);
    if (trip.status !== "available") throw conflict("trip_unavailable", "This trip can no longer be booked.");
    if (!layoutSeats(row.layout).includes(seat)) throw badRequest("invalid_seat", "That seat doesn't exist on this bus.");
    const { rows: booked } = await query(
      "SELECT 1 FROM bookings WHERE trip_id = $1 AND seat_number = $2 AND status IN ('confirmed','boarded')",
      [row.id, seat],
    );
    if (booked.length) throw conflict("seat_booked", "Sorry, that seat has just been booked. Please choose another.");
    const { rows: mine } = await query(
      "SELECT 1 FROM bookings WHERE trip_id = $1 AND user_id = $2 AND status IN ('confirmed','boarded')",
      [row.id, req.user!.id],
    );
    if (mine.length) throw conflict("already_booked", "You already have a seat on this trip. See My tickets.");
    const lock = await lockSeat(row.id, seat, req.user!.id);
    if (!lock) throw conflict("seat_locked", "Another student is holding that seat right now. Please choose another.");
    res.status(201).json({ lock: { seat: lock.seat, expiresAt: lock.expiresAt } });
  }),
);

trips.delete(
  "/:id/locks/:seat",
  requireAuth,
  ah(async (req, res) => {
    await releaseSeat(String(req.params.id), String(req.params.seat), req.user!.id);
    res.json({ ok: true });
  }),
);

