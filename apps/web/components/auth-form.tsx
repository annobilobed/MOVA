"use client";

import { Lock, Mail, Phone, User as UserIcon, IdCard } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { roleHome } from "@/lib/format";
import type { User } from "@/lib/types";
import { useSession } from "./session";
import { Alert, Button, Field } from "./ui";

type Errors = Record<string, string | undefined>;

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const next: Errors = {};
    if (!data.email) next.email = "Enter your email address";
    if (!data.password) next.password = "Enter your password";
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const { user } = await api<{ user: User }>("/auth/login", { method: "POST", json: data });
      await refresh();
      router.push(safeNext(params.get("next")) ?? roleHome(user.role));
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert tone="error">{formError}</Alert>}
      <Field label="Email address" name="email" type="email" autoComplete="email" icon={<Mail />} error={errors.email} />
      <Field label="Password" name="password" type="password" autoComplete="current-password" icon={<Lock />} error={errors.password} />
      <Button type="submit" size="lg" loading={loading} loadingText="Signing in…">Sign in</Button>
      <p className="text-center text-[15px] text-muted">
        New to MOVA? <Link href={`/auth/register${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`} className="font-semibold text-accent-fg hover:underline">Create a student account</Link>
      </p>
      <p className="text-center text-sm text-muted">Forgot your password? Password reset isn't available yet — contact support from the Help page.</p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const next: Errors = {};
    if (!data.fullName || data.fullName.trim().length < 2) next.fullName = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(data.email ?? "")) next.email = "Enter a valid email address";
    if (!/^(\+233|0)\d{9}$/.test((data.phone ?? "").replace(/\s/g, ""))) next.phone = "Enter a Ghana phone number, e.g. 024 123 4567";
    if (!data.studentId || data.studentId.trim().length < 4) next.studentId = "Enter your UCC student ID";
    if ((data.password ?? "").length < 8) next.password = "Use at least 8 characters";
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await api("/auth/register", { method: "POST", json: data });
      await refresh();
      router.push(safeNext(params.get("next")) ?? "/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setErrors(Object.fromEntries(Object.entries(err.fields).map(([k, v]) => [k, v?.[0]])));
      }
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert tone="error">{formError}</Alert>}
      <Field label="Full name" name="fullName" autoComplete="name" icon={<UserIcon />} error={errors.fullName} />
      <Field label="Email address" name="email" type="email" autoComplete="email" icon={<Mail />} error={errors.email} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone number" name="phone" type="tel" inputMode="tel" autoComplete="tel" icon={<Phone />} error={errors.phone} helper="Ghana number" />
        <Field label="UCC student ID" name="studentId" icon={<IdCard />} error={errors.studentId} helper="As on your student card" />
      </div>
      <Field label="Password" name="password" type="password" autoComplete="new-password" icon={<Lock />} error={errors.password} helper="At least 8 characters" />
      <Button type="submit" size="lg" loading={loading} loadingText="Creating account…">Create account</Button>
      <p className="text-center text-[15px] text-muted">
        Already have an account? <Link href="/auth/sign-in" className="font-semibold text-accent-fg hover:underline">Sign in</Link>
      </p>
      <p className="text-center text-xs text-muted">By creating an account you agree to the <Link href="/terms" className="underline">Terms of travel</Link> and <Link href="/privacy" className="underline">Privacy notice</Link>.</p>
    </form>
  );
}
