import { Router, type Request } from "express";
import { z } from "zod";
import { requireRole } from "../lib/auth.js";
import { query } from "../lib/db.js";
import { ah, badRequest, conflict, forbidden, notFound } from "../lib/errors.js";
import { defaultLayout } from "../lib/layout.js";
import { redis, tripLocks } from "../lib/redis.js";
import { refund } from "../lib/payments.js";
import { pool } from "../lib/db.js";
import { serializeTrip, TRIP_SELECT } from "../lib/trips.js";

export const operator = Router();
operator.use(requireRole("operator", "super_admin"));

/** Company scope is enforced here, on the server (FR-34). Super admins may act for any company. */
function scope(req: Request): string | null {
  if (req.user!.role === "super_admin") {
    const c = (req.query.companyId ?? req.body?.companyId) as string | undefined;
    return c || null;
  }
  if (!req.user!.companyId) throw forbidden("Your account isn't linked to a transport company yet.");
  return req.user!.companyId;
}

operator.get(
  "/overview",
  ah(async (req, res) => {
    const c = scope(req);
    const { rows } = await query(
      `SELECT
        (SELECT count(*)::int FROM trips WHERE departure_at > now() AND NOT is_cancelled AND ($1::uuid IS NULL OR company_id = $1)) AS upcoming_trips,
        (SELECT count(*)::int FROM buses WHERE ($1::uuid IS NULL OR company_id = $1)) AS buses,
        (SELECT count(*)::int FROM bookings bk JOIN trips t ON t.id = bk.trip_id
           WHERE t.departure_at > now() AND bk.status IN ('confirmed','boarded') AND ($1::uuid IS NULL OR t.company_id = $1)) AS upcoming_passengers,
        (SELECT count(*)::int FROM trips WHERE departure_at BETWEEN now() AND now() + interval '24 hours' AND NOT is_cancelled AND ($1::uuid IS NULL OR company_id = $1)) AS next_24h`,
      [c],
    );
    const r = rows[0];
    const { rows: company } = c ? await query("SELECT name, is_demo FROM companies WHERE id = $1", [c]) : { rows: [] as any[] };
    res.json({
      company: company[0] ? { name: company[0].name, isDemo: company[0].is_demo } : null,
      metrics: { upcomingTrips: r.upcoming_trips, buses: r.buses, upcomingPassengers: r.upcoming_passengers, next24h: r.next_24h },
    });
  }),
);

operator.get(
  "/buses",
  ah(async (req, res) => {
    const c = scope(req);
    const { rows } = await query(
      `SELECT b.*, u.full_name AS driver_name FROM buses b LEFT JOIN users u ON u.id = b.driver_id
       WHERE ($1::uuid IS NULL OR b.company_id = $1) ORDER BY b.plate`,
      [c],
    );
    res.json({
      buses: rows.map((b) => ({ id: b.id, plate: b.plate, capacity: b.capacity, driver: b.driver_id ? { id: b.driver_id, name: b.driver_name } : null })),
    });
  }),
);

operator.get(
  "/drivers",
  ah(async (req, res) => {
    const c = scope(req);
    const { rows } = await query(
      "SELECT id, full_name FROM users WHERE role = 'driver' AND is_active AND ($1::uuid IS NULL OR company_id = $1) ORDER BY full_name",
      [c],
    );
    res.json({ drivers: rows.map((d) => ({ id: d.id, name: d.full_name })) });
  }),
);

const busSchema = z.object({
  plate: z.string().trim().toUpperCase().min(3, "Enter the plate number").max(20),
  capacity: z.coerce.number().int().min(9, "At least 9 seats").max(90, "At most 90 seats"),
  driverId: z.string().uuid().nullable().optional(),
});

operator.post(
  "/buses",
  ah(async (req, res) => {
    const c = scope(req);
    if (!c) throw badRequest("company_required", "Choose a company for this bus.");
    const input = busSchema.parse(req.body);
    if (input.driverId) {
      const { rows } = await query("SELECT 1 FROM users WHERE id = $1 AND role = 'driver' AND company_id = $2", [input.driverId, c]);
      if (!rows[0]) throw badRequest("invalid_driver", "That driver isn't part of your company.");
    }
    try {
      const { rows } = await query(
        "INSERT INTO buses (company_id, plate, capacity, layout, driver_id) VALUES ($1,$2,$3,$4,$5) RETURNING *",
        [c, input.plate, input.capacity, JSON.stringify(defaultLayout(input.capacity)), input.driverId ?? null],
      );
      res.status(201).json({ bus: { id: rows[0].id, plate: rows[0].plate, capacity: rows[0].capacity } });
    } catch (err: any) {
      if (err.code === "23505") throw conflict("plate_taken", "A bus with this plate number already exists.");
      throw err;
    }
  }),
);

operator.get(
  "/trips",
  ah(async (req, res) => {
    const c = scope(req);
    const when = req.query.when === "past" ? "t.departure_at <= now()" : "t.departure_at > now() - interval '12 hours'";
    const { rows } = await query(
      `${TRIP_SELECT} WHERE ($1::uuid IS NULL OR t.company_id = $1) AND ${when} ORDER BY t.departure_at ${req.query.when === "past" ? "DESC" : "ASC"} LIMIT 200`,
      [c],
    );
    const result = await Promise.all(rows.map(async (r) => ({ ...serializeTrip(r, (await tripLocks(r.id)).size), booked: r.booked_count })));
    res.json({ trips: result });
  }),
);

const tripSchema = z.object({
  busId: z.string().uuid("Choose a bus"),
  origin: z.string().trim().min(2, "Enter the origin").max(80),
  destination: z.string().trim().min(2, "Enter the destination").max(80),
  departureAt: z.string().datetime({ offset: true, message: "Enter a valid departure time" }),
  fareGhs: z.coerce.number().positive("Fare must be more than 0").max(10000),
  tripType: z.enum(["inter_regional", "campus_shuttle"]),
});

operator.post(
  "/trips",
  ah(async (req, res) => {
    const c = scope(req);
    const input = tripSchema.parse(req.body);
    if (new Date(input.departureAt).getTime() <= Date.now()) {
      throw badRequest("past_departure", "Departure time must be in the future.", { fields: { departureAt: ["Departure time must be in the future."] } });
    }
    const { rows: bus } = await query("SELECT * FROM buses WHERE id = $1 AND ($2::uuid IS NULL OR company_id = $2)", [input.busId, c]);
    if (!bus[0]) throw badRequest("invalid_bus", "Choose one of your buses.");
    // A bus (and its driver) can't be in two places at once.
    const { rows: clash } = await query(
      `SELECT origin, destination, departure_at FROM trips WHERE bus_id = $1 AND NOT is_cancelled
         AND departure_at BETWEEN $2::timestamptz - interval '3 hours' AND $2::timestamptz + interval '3 hours' LIMIT 1`,
      [input.busId, input.departureAt],
    );
    if (clash[0]) {
      const when = new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Africa/Accra" }).format(new Date(clash[0].departure_at));
      throw badRequest("bus_busy", `This bus already has a trip within 3 hours (${clash[0].origin} → ${clash[0].destination}, ${when}). Choose another bus or time.`, {
        fields: { departureAt: ["This bus is already scheduled within 3 hours of this time."] },
      });
    }
    const { rows } = await query(
      `INSERT INTO trips (company_id, bus_id, origin, destination, departure_at, fare_pesewas, trip_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [bus[0].company_id, input.busId, input.origin, input.destination, input.departureAt, Math.round(input.fareGhs * 100), input.tripType],
    );
    res.status(201).json({ trip: { id: rows[0].id } });
  }),
);

operator.get(
  "/trips/:id/manifest",
  ah(async (req, res) => {
    const c = scope(req);
    const { rows: t } = await query(`${TRIP_SELECT} WHERE t.id = $1 AND ($2::uuid IS NULL OR t.company_id = $2)`, [String(req.params.id), c]).catch(
      () => ({ rows: [] as any[] }),
    );
    if (!t[0]) throw notFound("We couldn't find that trip in your company.");
    const { rows } = await query(
      `SELECT bk.seat_number, bk.luggage, bk.status, bk.boarded_at, u.full_name, u.student_id, u.phone
       FROM bookings bk JOIN users u ON u.id = bk.user_id
       WHERE bk.trip_id = $1 AND bk.status IN ('confirmed','boarded')
       ORDER BY NULLIF(regexp_replace(bk.seat_number, '\\D', '', 'g'), '')::int NULLS LAST, bk.seat_number`,
      [String(req.params.id)],
    );
    res.set("Cache-Control", "no-store");
    res.json({
      trip: serializeTrip(t[0]),
      passengers: rows.map((r) => ({
        seat: r.seat_number,
        name: r.full_name,
        studentId: r.student_id,
        phone: r.phone,
        luggage: r.luggage,
        boarded: r.status === "boarded",
        boardedAt: r.boarded_at,
      })),
    });
  }),
);

/**
 * Cancel a trip: no new bookings, every ticket is cancelled, and every successful payment
 * for it (fares and luggage top-ups) is refunded. Recorded in the audit log.
 */
operator.post(
  "/trips/:id/cancel",
  ah(async (req, res) => {
    const c = scope(req);
    const { reason } = z.object({ reason: z.string().trim().min(3, "Give a short reason for passengers").max(300) }).parse(req.body);
    const id = String(req.params.id);
    const client = await pool.connect();
    let refunds: string[] = [];
    try {
      await client.query("BEGIN");
      const { rows: t } = await client.query("SELECT * FROM trips WHERE id = $1 AND ($2::uuid IS NULL OR company_id = $2) FOR UPDATE", [id, c]).catch(() => ({ rows: [] as any[] }));
      if (!t[0]) throw notFound("We couldn't find that trip in your company.");
      if (t[0].is_cancelled) throw conflict("already_cancelled", "This trip is already cancelled.");
      if (new Date(t[0].departure_at).getTime() < Date.now() - 2 * 3600 * 1000) throw conflict("trip_over", "This trip has already finished.");
      await client.query("UPDATE trips SET is_cancelled = true, cancelled_at = now(), cancel_reason = $2 WHERE id = $1", [id, reason]);
      const { rows: b } = await client.query("UPDATE bookings SET status = 'cancelled' WHERE trip_id = $1 AND status IN ('confirmed','boarded') RETURNING id", [id]);
      const { rows: p } = await client.query(
        `UPDATE payments SET status = 'refunded', status_reason = $2, updated_at = now()
         WHERE trip_id = $1 AND status = 'successful' RETURNING reference`,
        [id, `The trip was cancelled by the operator: ${reason}`],
      );
      // Pending payments for this trip will be refunded on arrival (finalizePayment refuses cancelled trips).
      await client.query("INSERT INTO audit_log (actor_id, action, target, details) VALUES ($1, 'trip_cancelled', $2, $3)", [
        req.user!.id, id, JSON.stringify({ reason, bookings: b.length, refunds: p.length }),
      ]);
      await client.query("COMMIT");
      refunds = p.map((r) => r.reference);
      res.json({ cancelled: true, bookingsCancelled: b.length, paymentsRefunded: p.length });
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw err;
    } finally {
      client.release();
    }
    for (const ref of refunds) await refund(ref);
    // Release any seat holds on the cancelled trip.
    let cursor = "0";
    do {
      const [next, keys] = await redis.scan(cursor, "MATCH", `mova:lock:${id}:*`, "COUNT", 200);
      cursor = next;
      if (keys.length) await redis.del(...keys);
    } while (cursor !== "0");
  }),
);
