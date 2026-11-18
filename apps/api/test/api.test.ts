import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { config } from "../src/lib/config.js";
import { pool, query } from "../src/lib/db.js";
import { redis } from "../src/lib/redis.js";
import { signPayload } from "../src/lib/paystack.js";
import { DEMO_PASSWORD, seed } from "../src/db/seed.js";

const app = createApp();

async function reset() {
  await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await redis.flushdb();
  await seed();
}

async function login(email: string) {
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/login").send({ email, password: DEMO_PASSWORD });
  expect(res.status).toBe(200);
  return agent;
}

async function newStudent(email: string) {
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/register").send({
    fullName: "Test Student",
    email,
    phone: "024 123 4567",
    studentId: "PS/TST/22/0099",
    password: "longenough1",
  });
  expect(res.status).toBe(201);
  return agent;
}

async function firstTrip(destination = "Accra") {
  const res = await request(app).get(`/api/trips?destination=${destination}`);
  return res.body.trips[0];
}

beforeAll(reset);
afterAll(async () => {
  await pool.end();
  redis.disconnect();
});

describe("accounts", () => {
  it("registers, logs out and logs back in; rejects duplicate email", async () => {
    const agent = await newStudent("new@student.test");
    expect((await agent.get("/api/auth/me")).body.user.role).toBe("student");
    await agent.post("/api/auth/logout");
    expect((await agent.get("/api/auth/me")).status).toBe(401);
    const again = await agent.post("/api/auth/login").send({ email: "NEW@student.test", password: "longenough1" });
    expect(again.status).toBe(200);
    const dup = await request(app).post("/api/auth/register").send({
      fullName: "Dup", email: "new@student.test", phone: "0241234567", studentId: "ABCD1", password: "longenough1",
    });
    expect(dup.status).toBe(409);
  });

  it("sets an httpOnly session cookie", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "student@demo.mova", password: DEMO_PASSWORD });
    expect(res.headers["set-cookie"][0]).toMatch(/HttpOnly/i);
  });

  it("returns field errors for invalid registration", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "bad" });
    expect(res.status).toBe(400);
    expect(res.body.error.fields.email).toBeTruthy();
  });
});

describe("trip discovery", () => {
  it("lists upcoming trips with fare, seats left and filters", async () => {
    const all = await request(app).get("/api/trips");
    expect(all.body.trips.length).toBeGreaterThan(5);
    const t = all.body.trips[0];
    expect(t).toMatchObject({ origin: expect.any(String), destination: expect.any(String), farePesewas: expect.any(Number), seatsLeft: expect.any(Number) });
    const shuttles = await request(app).get("/api/trips?type=campus_shuttle");
    expect(shuttles.body.trips.every((x: any) => x.tripType === "campus_shuttle")).toBe(true);
  });

  it("seat layout matches bus capacity", async () => {
    const trip = await firstTrip();
    const res = await request(app).get(`/api/trips/${trip.id}/seats`);
    const seats = res.body.layout.flat().filter(Boolean);
    expect(seats.length).toBe(trip.bus.capacity);
    expect(res.body.layout.at(-1).filter(Boolean).length).toBe(5); // back row of five
  });
});

describe("seat locking and payment", () => {
  it("locks a seat for one student and blocks others", async () => {
    const trip = await firstTrip();
    const a = await newStudent("a@student.test");
    const b = await newStudent("b@student.test");
    const lock = await a.post(`/api/trips/${trip.id}/locks`).send({ seat: "1" });
    expect(lock.status).toBe(201);
    const remaining = new Date(lock.body.lock.expiresAt).getTime() - Date.now();
    expect(remaining).toBeGreaterThan(590_000);
    expect(remaining).toBeLessThanOrEqual(600_000);
    expect((await b.post(`/api/trips/${trip.id}/locks`).send({ seat: "1" })).status).toBe(409);
    const seats = await b.get(`/api/trips/${trip.id}/seats`);
    expect(seats.body.states["1"]).toBe("locked");
    const mine = await a.get(`/api/trips/${trip.id}/seats`);
    expect(mine.body.states["1"]).toBe("selected");
  });

  it("server calculates the amount and ignores client totals", async () => {
    const trip = await firstTrip();
    const s = await newStudent("pay@student.test");
    await s.post(`/api/trips/${trip.id}/locks`).send({ seat: "2" });
    const res = await s.post("/api/payments").send({ tripId: trip.id, seat: "2", luggage: "standard", amountPesewas: 1 });
    expect(res.status).toBe(201);
    expect(res.body.payment.amountPesewas).toBe(trip.farePesewas + 1500);
    expect(res.body.payment.status).toBe("pending");
  });

  it("refuses payment without a live seat hold", async () => {
    const trip = await firstTrip();
    const s = await newStudent("nohold@student.test");
    const res = await s.post("/api/payments").send({ tripId: trip.id, seat: "3" });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("lock_expired");
  });

  it("creates one booking and ticket on success; tampered amount is flagged", async () => {
    const trip = await firstTrip("Kumasi");
    const s = await newStudent("ok@student.test");
    await s.post(`/api/trips/${trip.id}/locks`).send({ seat: "5" });
    const pay = await s.post("/api/payments").send({ tripId: trip.id, seat: "5" });
    const ref = pay.body.payment.reference;
    expect((await s.post(`/api/payments/${ref}/test-outcome`).send({ outcome: "success" })).body.status).toBe("successful");
    // Repeat outcome (like a duplicate webhook) changes nothing.
    expect((await s.post(`/api/payments/${ref}/test-outcome`).send({ outcome: "success" })).body.status).toBe("successful");
    const status = await s.get(`/api/payments/${ref}`);
    expect(status.body.payment.bookingId).toBeTruthy();
    const tickets = await s.get("/api/tickets");
    expect(tickets.body.tickets).toHaveLength(1);
    const ticket = await s.get(`/api/tickets/${tickets.body.tickets[0].id}`);
    expect(ticket.body.ticket.qrSvg).toContain("<svg");
    expect(ticket.body.ticket.seat).toBe("5");

    const t = await newStudent("tamper@student.test");
    await t.post(`/api/trips/${trip.id}/locks`).send({ seat: "6" });
    const p2 = await t.post("/api/payments").send({ tripId: trip.id, seat: "6" });
    const r2 = await t.post(`/api/payments/${p2.body.payment.reference}/test-outcome`).send({ outcome: "tampered" });
    expect(r2.body.status).toBe("flagged");
    expect((await t.get("/api/tickets")).body.tickets).toHaveLength(0);
  });

  it("double booking: second payment for a taken seat is refunded", async () => {
    const trip = await firstTrip("Takoradi");
    const a = await newStudent("race-a@student.test");
    const b = await newStudent("race-b@student.test");
    await a.post(`/api/trips/${trip.id}/locks`).send({ seat: "9" });
    const pa = await a.post("/api/payments").send({ tripId: trip.id, seat: "9" });
    // Simulate a's hold expiring, then b holds and pays first.
    await redis.del(`mova:lock:${trip.id}:9`);
    await b.post(`/api/trips/${trip.id}/locks`).send({ seat: "9" });
    const pb = await b.post("/api/payments").send({ tripId: trip.id, seat: "9" });
    expect((await b.post(`/api/payments/${pb.body.payment.reference}/test-outcome`).send({ outcome: "success" })).body.status).toBe("successful");
    expect((await a.post(`/api/payments/${pa.body.payment.reference}/test-outcome`).send({ outcome: "success" })).body.status).toBe("refunded");
    const { rows } = await query("SELECT count(*)::int AS n FROM bookings WHERE trip_id = $1 AND seat_number = '9'", [trip.id]);
    expect(rows[0].n).toBe(1);
  });
});

describe("webhooks", () => {
  it("rejects invalid signatures and processes duplicates once", async () => {
    const original = config.paystackSecret;
    config.paystackSecret = "sk_test_webhook_secret";
    try {
      const trip = await firstTrip("Tamale");
      const { rows: [u] } = await query("SELECT id FROM users WHERE email = 'student@demo.mova'");
      await query(
        `INSERT INTO payments (reference, user_id, trip_id, seat_number, fare_pesewas, luggage_pesewas, amount_pesewas, provider)
         VALUES ('WH-1', $1, $2, '12', $3, 0, $3, 'paystack')`,
        [u.id, trip.id, trip.farePesewas],
      );
      const body = JSON.stringify({ event: "charge.success", data: { reference: "WH-1", amount: trip.farePesewas, currency: "GHS" } });
      const bad = await request(app).post("/api/webhooks/paystack").set("x-paystack-signature", "00".repeat(64)).set("content-type", "application/json").send(body);
      expect(bad.status).toBe(401);
      const sig = signPayload(body, config.paystackSecret);
      for (let i = 0; i < 3; i++) {
        const ok = await request(app).post("/api/webhooks/paystack").set("x-paystack-signature", sig).set("content-type", "application/json").send(body);
        expect(ok.status).toBe(200);
      }
      const { rows } = await query("SELECT count(*)::int AS n FROM bookings b JOIN payments p ON p.id = b.payment_id WHERE p.reference = 'WH-1'");
      expect(rows[0].n).toBe(1);
    } finally {
      config.paystackSecret = original;
    }
  });
});

describe("ticket validation", () => {
  it("accepts a valid ticket once and rejects repeat and wrong-bus scans", async () => {
    const trip = await firstTrip("Kumasi"); // bus assigned to driver2
    const { rows: [bk] } = await query("SELECT qr_token FROM bookings WHERE trip_id = $1 LIMIT 1", [trip.id]);
    const driver2 = await login("driver2@demo.mova");
    const first = await driver2.post("/api/driver/validate").send({ code: `MOVA1:${bk.qr_token}`, tripId: trip.id });
    expect(first.body.result).toBe("valid");
    const repeat = await driver2.post("/api/driver/validate").send({ code: `MOVA1:${bk.qr_token}`, tripId: trip.id });
    expect(repeat.body.result).toBe("rechecked"); // same driver re-checking, e.g. after a luggage top-up
    const invalid = await driver2.post("/api/driver/validate").send({ code: "MOVA1:nope", tripId: trip.id });
    expect(invalid.body.result).toBe("invalid");

    const other = await firstTrip("Accra"); // driver1's bus
    const driver1 = await login("driver@demo.mova");
    const notMine = await driver1.post("/api/driver/validate").send({ code: `MOVA1:${bk.qr_token}`, tripId: trip.id });
    expect(notMine.status).toBe(403);
    const wrongBus = await driver1.post("/api/driver/validate").send({ code: `MOVA1:${bk.qr_token}`, tripId: other.id });
    expect(wrongBus.body.result).toBe("wrong_bus");
  });
});

describe("operator and roles", () => {
  it("operator sees manifest for own company only", async () => {
    const trip = await firstTrip("Kumasi");
    const op = await login("operator@demo.mova");
    const manifest = await op.get(`/api/operator/trips/${trip.id}/manifest`);
    expect(manifest.status).toBe(200);
    expect(manifest.body.passengers[0]).toMatchObject({ seat: "5", studentId: expect.any(String), phone: expect.any(String) });
    const op2 = await login("operator2@demo.mova");
    expect((await op2.get(`/api/operator/trips/${trip.id}/manifest`)).status).toBe(404);
  });

  it("operator creates buses and future trips; past trips are refused", async () => {
    const op = await login("operator@demo.mova");
    const bus = await op.post("/api/operator/buses").send({ plate: "test-gr 77-26", capacity: 49 });
    expect(bus.status).toBe(201);
    const past = await op.post("/api/operator/trips").send({
      busId: bus.body.bus.id, origin: "Cape Coast", destination: "Accra", departureAt: new Date(Date.now() - 3600_000).toISOString(), fareGhs: 90, tripType: "inter_regional",
    });
    expect(past.status).toBe(400);
    const future = await op.post("/api/operator/trips").send({
      busId: bus.body.bus.id, origin: "Cape Coast", destination: "Accra", departureAt: new Date(Date.now() + 86400_000).toISOString(), fareGhs: 90, tripType: "inter_regional",
    });
    expect(future.status).toBe(201);
  });

  it("students cannot reach driver, operator or admin endpoints", async () => {
    const s = await login("student@demo.mova");
    expect((await s.get("/api/driver/trips")).status).toBe(403);
    expect((await s.get("/api/operator/trips")).status).toBe(403);
    expect((await s.get("/api/admin/users")).status).toBe(403);
    expect((await request(app).get("/api/tickets")).status).toBe(401);
  });

  it("super admin can change roles, with audit", async () => {
    const a = await login("admin@demo.mova");
    const users = await a.get("/api/admin/users?search=new@student.test");
    const id = users.body.users[0].id;
    const companies = await a.get("/api/admin/companies");
    const res = await a.patch(`/api/admin/users/${id}`).send({ role: "driver", companyId: companies.body.companies[0].id });
    expect(res.status).toBe(200);
    const { rows } = await query("SELECT count(*)::int AS n FROM audit_log WHERE action = 'user_updated'");
    expect(rows[0].n).toBe(1);
  });
});

describe("luggage top-ups", () => {
  it("lets a student add luggage after paying, charging only the difference", async () => {
    const trip = await firstTrip("Ho");
    const s = await newStudent("luggage@student.test");
    await s.post(`/api/trips/${trip.id}/locks`).send({ seat: "20" });
    const pay = await s.post("/api/payments").send({ tripId: trip.id, seat: "20", luggage: "none" });
    expect(pay.body.payment.amountPesewas).toBe(trip.farePesewas); // 25 kg included in the fare
    await s.post(`/api/payments/${pay.body.payment.reference}/test-outcome`).send({ outcome: "success" });
    const ticketId = (await s.get("/api/tickets")).body.tickets[0].id;

    const top = await s.post(`/api/tickets/${ticketId}/luggage`).send({ luggage: "standard" });
    expect(top.status).toBe(201);
    expect(top.body.amountPesewas).toBe(1500);
    expect((await s.post(`/api/payments/${top.body.reference}/test-outcome`).send({ outcome: "success" })).body.status).toBe("successful");
    expect((await s.get(`/api/tickets/${ticketId}`)).body.ticket.luggage).toBe("standard");

    const top2 = await s.post(`/api/tickets/${ticketId}/luggage`).send({ luggage: "large" });
    expect(top2.body.amountPesewas).toBe(1500); // difference between 1 and 2 extra bags
    const same = await s.post(`/api/tickets/${ticketId}/luggage`).send({ luggage: "standard" });
    expect(same.status).toBe(400);

    const other = await newStudent("nosy@student.test");
    expect((await other.post(`/api/tickets/${ticketId}/luggage`).send({ luggage: "large" })).status).toBe(403);
  });

  it("shows the luggage allowance to the driver on scan", async () => {
    const trip = await firstTrip("Ho"); // driver@demo.mova's bus
    const { rows: [bk] } = await query("SELECT qr_token FROM bookings WHERE trip_id = $1 LIMIT 1", [trip.id]);
    const d = await login("driver@demo.mova");
    const res = await d.post("/api/driver/validate").send({ code: `MOVA1:${bk.qr_token}`, tripId: trip.id });
    expect(res.body.result).toBe("valid");
    expect(res.body.passenger.luggage).toBe("25 kg included + 1 extra bag");
  });
});
