import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { clearSession, issueSession, requireAuth, toAuthUser } from "../lib/auth.js";
import { config } from "../lib/config.js";
import { query } from "../lib/db.js";
import { ah, conflict, HttpError } from "../lib/errors.js";

export const auth = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.isTest ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "rate_limited", message: "Too many attempts. Please wait a few minutes and try again." } },
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
  phone: z.string().trim().transform((s) => s.replace(/\s/g, "")).pipe(z.string().regex(/^(\+233|0)\d{9}$/, "Enter a Ghana phone number, e.g. 0241234567")),
  studentId: z.string().trim().min(4, "Enter your UCC student ID").max(30),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

auth.post(
  "/register",
  limiter,
  ah(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(input.password, 12);
    try {
      const { rows } = await query(
        `INSERT INTO users (full_name, email, phone, student_id, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, 'student') RETURNING *`,
        [input.fullName, input.email, input.phone, input.studentId, hash],
      );
      issueSession(res, rows[0].id);
      res.status(201).json({ user: toAuthUser(rows[0]) });
    } catch (err: any) {
      if (err.code === "23505") throw conflict("email_taken", "An account with this email already exists. Try signing in.");
      throw err;
    }
  }),
);

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address"), password: z.string().min(1, "Enter your password") });

auth.post(
  "/login",
  limiter,
  ah(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const { rows } = await query("SELECT * FROM users WHERE lower(email) = $1", [input.email]);
    const user = rows[0];
    const ok = user && user.is_active && (await bcrypt.compare(input.password, user.password_hash));
    if (!ok) throw new HttpError(401, "invalid_credentials", "That email and password don't match.");
    issueSession(res, user.id);
    res.json({ user: toAuthUser(user) });
  }),
);

auth.post("/logout", (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

auth.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));
