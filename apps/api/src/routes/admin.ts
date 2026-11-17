import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { requireRole } from "../lib/auth.js";
import { query } from "../lib/db.js";
import { ah, badRequest, conflict, notFound } from "../lib/errors.js";

export const admin = Router();
admin.use(requireRole("super_admin"));

admin.get(
  "/overview",
  ah(async (_req, res) => {
    const { rows } = await query(`SELECT
      (SELECT count(*)::int FROM users) AS users,
      (SELECT count(*)::int FROM users WHERE role = 'student') AS students,
      (SELECT count(*)::int FROM companies) AS companies,
      (SELECT count(*)::int FROM payments WHERE status = 'flagged') AS flagged_payments,
      (SELECT count(*)::int FROM payments WHERE status = 'refunded') AS refunded_payments,
      (SELECT count(*)::int FROM bookings WHERE status IN ('confirmed','boarded')) AS bookings`);
    const r = rows[0];
    res.json({
      metrics: {
        users: r.users, students: r.students, companies: r.companies,
        flaggedPayments: r.flagged_payments, refundedPayments: r.refunded_payments, bookings: r.bookings,
      },
    });
  }),
);

admin.get(
  "/users",
  ah(async (req, res) => {
    const q = z.object({ search: z.string().trim().max(100).optional(), role: z.enum(["student", "driver", "operator", "super_admin"]).optional() }).parse(req.query);
    const params: unknown[] = [];
    const where: string[] = [];
    if (q.search) { params.push(`%${q.search}%`); where.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.student_id ILIKE $${params.length})`); }
    if (q.role) { params.push(q.role); where.push(`u.role = $${params.length}`); }
    const { rows } = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.student_id, u.role, u.is_active, u.created_at, c.name AS company_name, u.company_id
       FROM users u LEFT JOIN companies c ON c.id = u.company_id
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY u.created_at DESC LIMIT 200`,
      params,
    );
    res.json({
      users: rows.map((u) => ({
        id: u.id, fullName: u.full_name, email: u.email, phone: u.phone, studentId: u.student_id, role: u.role,
        isActive: u.is_active, createdAt: u.created_at, company: u.company_id ? { id: u.company_id, name: u.company_name } : null,
      })),
    });
  }),
);

const updateSchema = z.object({
  role: z.enum(["student", "driver", "operator", "super_admin"]).optional(),
  companyId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
});

admin.patch(
  "/users/:id",
  ah(async (req, res) => {
    const input = updateSchema.parse(req.body);
    if (String(req.params.id) === req.user!.id && (input.role && input.role !== "super_admin" || input.isActive === false)) {
      throw badRequest("self_change", "You can't remove your own admin access.");
    }
    const { rows: existing } = await query("SELECT * FROM users WHERE id = $1", [String(req.params.id)]).catch(() => ({ rows: [] as any[] }));
    if (!existing[0]) throw notFound("User not found.");
    const role = input.role ?? existing[0].role;
    const companyId = input.companyId !== undefined ? input.companyId : existing[0].company_id;
    if ((role === "operator" || role === "driver") && !companyId) {
      throw badRequest("company_required", "Drivers and operators must belong to a company.");
    }
    const { rows } = await query(
      "UPDATE users SET role = $2, company_id = $3, is_active = COALESCE($4, is_active) WHERE id = $1 RETURNING id, role, company_id, is_active",
      [String(req.params.id), role, role === "student" || role === "super_admin" ? null : companyId, input.isActive ?? null],
    );
    await query("INSERT INTO audit_log (actor_id, action, target, details) VALUES ($1, 'user_updated', $2, $3)", [
      req.user!.id, String(req.params.id), JSON.stringify({ before: { role: existing[0].role, companyId: existing[0].company_id, isActive: existing[0].is_active }, after: input }),
    ]);
    res.json({ user: rows[0] });
  }),
);

const staffSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().transform((s) => s.replace(/\s/g, "")).pipe(z.string().regex(/^(\+233|0)\d{9}$/, "Enter a Ghana phone number")),
  role: z.enum(["driver", "operator", "super_admin"]),
  companyId: z.string().uuid().nullable().optional(),
});

/** Create a staff account with a one-time temporary password shown once to the admin. */
admin.post(
  "/users",
  ah(async (req, res) => {
    const input = staffSchema.parse(req.body);
    if (input.role !== "super_admin" && !input.companyId) throw badRequest("company_required", "Choose a company for this account.");
    const tempPassword = crypto.randomBytes(9).toString("base64url");
    try {
      const { rows } = await query(
        "INSERT INTO users (full_name, email, phone, password_hash, role, company_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
        [input.fullName, input.email, input.phone, await bcrypt.hash(tempPassword, 12), input.role, input.role === "super_admin" ? null : input.companyId],
      );
      await query("INSERT INTO audit_log (actor_id, action, target, details) VALUES ($1, 'user_created', $2, $3)", [req.user!.id, rows[0].id, JSON.stringify({ role: input.role })]);
      res.status(201).json({ user: { id: rows[0].id }, tempPassword });
    } catch (err: any) {
      if (err.code === "23505") throw conflict("email_taken", "An account with this email already exists.");
      throw err;
    }
  }),
);

admin.get(
  "/companies",
  ah(async (_req, res) => {
    const { rows } = await query(
      `SELECT c.*, (SELECT count(*)::int FROM buses WHERE company_id = c.id) AS buses,
        (SELECT count(*)::int FROM users WHERE company_id = c.id) AS staff
       FROM companies c ORDER BY c.name`,
    );
    res.json({ companies: rows.map((c) => ({ id: c.id, name: c.name, isDemo: c.is_demo, buses: c.buses, staff: c.staff })) });
  }),
);

admin.post(
  "/companies",
  ah(async (req, res) => {
    const { name } = z.object({ name: z.string().trim().min(2).max(120) }).parse(req.body);
    try {
      const { rows } = await query("INSERT INTO companies (name) VALUES ($1) RETURNING id, name", [name]);
      await query("INSERT INTO audit_log (actor_id, action, target) VALUES ($1, 'company_created', $2)", [req.user!.id, rows[0].id]);
      res.status(201).json({ company: rows[0] });
    } catch (err: any) {
      if (err.code === "23505") throw conflict("company_exists", "A company with this name already exists.");
      throw err;
    }
  }),
);
