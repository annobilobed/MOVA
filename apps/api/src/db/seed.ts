/**
 * DEMO DATA for development and presentations only. Every company and trip is flagged
 * is_demo = true and the web app labels it. Routes, fares and plates are illustrative,
 * not real MOVA schedules.
 */
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool, query } from "../lib/db.js";
import { defaultLayout } from "../lib/layout.js";
import { migrate } from "./migrate.js";

export const DEMO_PASSWORD = "MovaDemo2026!";

export async function seed() {
  await migrate();
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const { rows: existing } = await query("SELECT id FROM companies WHERE name = 'MOVA Demo Transport'");
  if (existing[0]) {
    console.log("Demo data already present.");
    return;
  }
  const { rows: [company] } = await query("INSERT INTO companies (name, is_demo) VALUES ('MOVA Demo Transport', true) RETURNING id");
  const { rows: [other] } = await query("INSERT INTO companies (name, is_demo) VALUES ('Coastal Demo Coaches', true) RETURNING id");

  const user = async (name: string, email: string, role: string, companyId: string | null, studentId: string | null = null) =>
    (await query(
      "INSERT INTO users (full_name, email, phone, student_id, password_hash, role, company_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
      [name, email, "0240000000", studentId, hash, role, companyId],
    )).rows[0].id as string;

  await user("Demo Student", "student@demo.mova", "student", null, "PS/CSC/22/0001");
  const d1 = await user("Kwesi Demo (Driver)", "driver@demo.mova", "driver", company.id);
  const d2 = await user("Esi Demo (Driver)", "driver2@demo.mova", "driver", company.id);
  await user("Ama Demo (Operator)", "operator@demo.mova", "operator", company.id);
  await user("Coastal Demo Operator", "operator2@demo.mova", "operator", other.id);
  await user("Demo Super Admin", "admin@demo.mova", "super_admin", null);

  const bus = async (companyId: string, plate: string, capacity: number, driverId: string | null) =>
    (await query("INSERT INTO buses (company_id, plate, capacity, layout, driver_id) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [companyId, plate, capacity, JSON.stringify(defaultLayout(capacity)), driverId])).rows[0].id as string;

  const b1 = await bus(company.id, "DEMO-GR 1001-26", 49, d1);
  const b2 = await bus(company.id, "DEMO-GR 1002-26", 49, d2);
  const b3 = await bus(company.id, "DEMO-CR 2001-26", 33, d1);
  const b4 = await bus(other.id, "DEMO-CR 3001-26", 49, null);

  const day = (d: number, h: number, m = 0) => {
    const t = new Date();
    t.setUTCDate(t.getUTCDate() + d);
    t.setUTCHours(h, m, 0, 0); // Accra is UTC+0
    return t.toISOString();
  };
  const trips: [string, string, string, string, string, number, string][] = [
    [company.id, b1, "Cape Coast (UCC)", "Accra", day(1, 6), 9500, "inter_regional"],
    [company.id, b2, "Cape Coast (UCC)", "Kumasi", day(1, 7, 30), 14000, "inter_regional"],
    [company.id, b1, "Cape Coast (UCC)", "Takoradi", day(2, 9), 6000, "inter_regional"],
    [company.id, b2, "Cape Coast (UCC)", "Tamale", day(3, 5), 32000, "inter_regional"],
    [company.id, b1, "Cape Coast (UCC)", "Ho", day(4, 6, 30), 18000, "inter_regional"],
    [company.id, b2, "Cape Coast (UCC)", "Accra", day(5, 14), 9500, "inter_regional"],
    [company.id, b3, "UCC Science", "Old Site (Administration)", day(1, 8), 300, "campus_shuttle"],
    [company.id, b3, "Old Site (Administration)", "UCC Science", day(1, 12), 300, "campus_shuttle"],
    [company.id, b3, "UCC Science", "Kotokuraba Market", day(2, 16), 500, "campus_shuttle"],
    [other.id, b4, "Cape Coast (UCC)", "Koforidua", day(3, 7), 15000, "inter_regional"],
  ];
  for (const t of trips) {
    await query(
      "INSERT INTO trips (company_id, bus_id, origin, destination, departure_at, fare_pesewas, trip_type, is_demo) VALUES ($1,$2,$3,$4,$5,$6,$7,true)",
      t,
    );
  }
  console.log(`Seeded demo data. Demo accounts use password ${DEMO_PASSWORD}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  seed().then(() => pool.end()).catch((e) => { console.error(e); process.exit(1); });
}
