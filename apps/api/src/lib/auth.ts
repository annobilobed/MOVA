import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { query } from "./db.js";
import { forbidden, unauthorized } from "./errors.js";

export type Role = "student" | "driver" | "operator" | "super_admin";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string | null;
  role: Role;
  companyId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const SESSION_COOKIE = "mova_session";

export function issueSession(res: Response, userId: string) {
  const token = jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: `${config.sessionDays}d` });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: "lax",
    maxAge: config.sessionDays * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSession(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export const toAuthUser = (row: any): AuthUser => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  studentId: row.student_id,
  role: row.role,
  companyId: row.company_id,
});

/** Attach req.user if a valid session cookie is present. */
export async function loadUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string };
    const { rows } = await query("SELECT * FROM users WHERE id = $1 AND is_active", [payload.sub]);
    if (rows[0]) req.user = toAuthUser(rows[0]);
  } catch {
    // invalid or expired session: treat as signed out
  }
  next();
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) =>
  req.user ? next() : next(unauthorized());

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden());
    next();
  };
