import { query } from "./db.js";
import { layoutSeats, type SeatLayout } from "./layout.js";
import { tripLocks } from "./redis.js";

export type TripStatus = "available" | "fully_booked" | "departed" | "cancelled";

export const TRIP_SELECT = `
  SELECT t.*, b.plate, b.capacity, b.layout, b.driver_id, c.name AS company_name,
    (SELECT count(*)::int FROM bookings bk WHERE bk.trip_id = t.id AND bk.status IN ('confirmed','boarded')) AS booked_count
  FROM trips t
  JOIN buses b ON b.id = t.bus_id
  JOIN companies c ON c.id = t.company_id`;

export function serializeTrip(row: any, lockedCount = 0) {
  const departed = new Date(row.departure_at).getTime() <= Date.now();
  const seatsLeft = Math.max(0, row.capacity - row.booked_count - lockedCount);
  let status: TripStatus = "available";
  if (row.is_cancelled) status = "cancelled";
  else if (departed) status = "departed";
  else if (row.capacity - row.booked_count <= 0) status = "fully_booked";
  return {
    id: row.id,
    origin: row.origin,
    destination: row.destination,
    departureAt: new Date(row.departure_at).toISOString(),
    farePesewas: row.fare_pesewas,
    tripType: row.trip_type as "inter_regional" | "campus_shuttle",
    bus: { id: row.bus_id, plate: row.plate, capacity: row.capacity },
    operator: row.company_name,
    seatsLeft,
    status,
    bookable: status === "available" && seatsLeft > 0,
    isDemo: row.is_demo,
    cancelReason: row.cancel_reason ?? null,
  };
}

export async function getTripRow(id: string) {
  const { rows } = await query(`${TRIP_SELECT} WHERE t.id = $1`, [id]);
  return rows[0] ?? null;
}

export type SeatState = "available" | "selected" | "booked" | "locked";

/** Seat map for a trip, derived from bookings and active locks, from the viewer's point of view. */
export async function seatMap(row: any, viewerId?: string) {
  const layout = row.layout as SeatLayout;
  const { rows: booked } = await query<{ seat_number: string }>(
    "SELECT seat_number FROM bookings WHERE trip_id = $1 AND status IN ('confirmed','boarded')",
    [row.id],
  );
  const bookedSet = new Set(booked.map((b) => b.seat_number));
  const locks = await tripLocks(row.id);
  const states: Record<string, SeatState> = {};
  for (const seat of layoutSeats(layout)) {
    if (bookedSet.has(seat)) states[seat] = "booked";
    else if (locks.has(seat)) states[seat] = locks.get(seat) === viewerId ? "selected" : "locked";
    else states[seat] = "available";
  }
  return { layout, states };
}
