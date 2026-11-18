"use client";

import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Info, Loader2, WifiOff, XCircle } from "lucide-react";
import Link from "next/link";
import { forwardRef, useId, useState } from "react";
import { buttonClass, inputClass, type Size, type Variant } from "@/lib/styles";
import type { PaymentStatus } from "@/lib/types";

export { buttonClass, inputClass };

/* ---------- Button ---------- */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, loadingText, className, children, disabled, ...props },
  ref,
) {
  return (
    <button ref={ref} className={buttonClass(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Loader2 aria-hidden className="size-4 animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
});

export function ButtonLink({ href, variant = "primary", size = "md", className, children }: { href: string; variant?: Variant; size?: Size; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

/* ---------- Form field ---------- */

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, error, helper, icon, id, className, type, required, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const describedBy = [error && `${inputId}-error`, helper && `${inputId}-help`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-semibold text-fg">
        {label}
        {required && <span aria-hidden className="ml-0.5 text-danger">*</span>}
      </label>
      <div className="relative">
        {icon && <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted [&_svg]:size-4.5">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && show ? "text" : type}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={clsx(inputClass(!!error, !!icon), isPassword && "pr-12")}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            aria-controls={inputId}
            className="absolute top-1/2 right-0.5 grid size-11 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-fg"
          >
            {show ? <EyeOff aria-hidden className="size-4.5" /> : <Eye aria-hidden className="size-4.5" />}
          </button>
        )}
      </div>
      {helper && !error && <p id={`${inputId}-help`} className="text-[13px] text-muted">{helper}</p>}
      {error && (
        <p id={`${inputId}-error`} className="flex items-center gap-1.5 text-[13px] font-medium text-danger">
          <XCircle aria-hidden className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

/** After a failed submit, move keyboard and screen-reader focus to the first field with an error. */
export function focusFirstInvalid(form?: HTMLElement | null) {
  setTimeout(() => (form ?? document).querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
}

export function SelectField({ label, error, helper, id, children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; helper?: string }) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={selectId} className="text-sm font-semibold text-fg">{label}</label>
      <select id={selectId} aria-invalid={error ? true : undefined} aria-describedby={error ? `${selectId}-error` : undefined} className={clsx(inputClass(!!error), "appearance-none bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat pr-10")} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23626782' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...props}>
        {children}
      </select>
      {helper && !error && <p className="text-[13px] text-muted">{helper}</p>}
      {error && <p id={`${selectId}-error`} className="text-[13px] font-medium text-danger">{error}</p>}
    </div>
  );
}

/* ---------- Status badge ---------- */

const badgeTone = {
  neutral: "bg-raised text-muted ring-border",
  info: "bg-info-bg text-accent-fg ring-accent/20",
  success: "bg-success-bg text-success ring-success/25",
  warning: "bg-warning-bg text-warning ring-warning/25",
  danger: "bg-danger-bg text-danger ring-danger/25",
  demo: "bg-sun/25 text-sun-ink ring-sun/60 dark:text-sun",
} as const;

export function Badge({ tone = "neutral", icon, children, className }: { tone?: keyof typeof badgeTone; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap [&_svg]:size-3.5", badgeTone[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge tone="demo" className={className}>
      Demo data
    </Badge>
  );
}

const paymentBadge: Record<PaymentStatus | "boarded" | "confirmed", { tone: keyof typeof badgeTone; label: string; Icon: typeof Info }> = {
  pending: { tone: "info", label: "Pending", Icon: Loader2 },
  successful: { tone: "success", label: "Successful", Icon: CheckCircle2 },
  confirmed: { tone: "success", label: "Confirmed", Icon: CheckCircle2 },
  failed: { tone: "danger", label: "Failed", Icon: XCircle },
  refunded: { tone: "warning", label: "Refunded", Icon: Info },
  flagged: { tone: "warning", label: "Needs review", Icon: AlertTriangle },
  boarded: { tone: "neutral", label: "Boarded", Icon: CheckCircle2 },
};

export function StatusBadge({ status }: { status: keyof typeof paymentBadge }) {
  const { tone, label, Icon } = paymentBadge[status];
  return <Badge tone={tone} icon={<Icon aria-hidden className={status === "pending" ? "animate-spin" : undefined} />}>{label}</Badge>;
}

/* ---------- Alert ---------- */

const alertTone = {
  info: { cls: "bg-info-bg text-fg border-accent/20", Icon: Info, iconCls: "text-accent-fg" },
  success: { cls: "bg-success-bg text-fg border-success/25", Icon: CheckCircle2, iconCls: "text-success" },
  warning: { cls: "bg-warning-bg text-fg border-warning/25", Icon: AlertTriangle, iconCls: "text-warning" },
  error: { cls: "bg-danger-bg text-fg border-danger/25", Icon: XCircle, iconCls: "text-danger" },
  offline: { cls: "bg-raised text-fg border-border", Icon: WifiOff, iconCls: "text-muted" },
} as const;

export function Alert({ tone = "info", title, children, action, className }: { tone?: keyof typeof alertTone; title?: string; children?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  const { cls, Icon, iconCls } = alertTone[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={clsx("flex gap-3 rounded-2xl border p-4", cls, className)}>
      <Icon aria-hidden className={clsx("mt-0.5 size-5 shrink-0", iconCls)} />
      <div className="min-w-0 flex-1 text-[15px]">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={clsx("text-muted", title && "mt-0.5")}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */

export function EmptyState({ icon, title, children, action }: { icon: React.ReactNode; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div aria-hidden className="mb-4 grid size-14 place-items-center rounded-2xl bg-info-bg text-accent-fg [&_svg]:size-6">{icon}</div>
      <h2 className="text-lg font-bold">{title}</h2>
      {children && <p className="mt-1.5 max-w-sm text-[15px] text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Card ---------- */

export function Card({ className, children, as: Tag = "div" }: { className?: string; children: React.ReactNode; as?: "div" | "section" | "article" }) {
  return <Tag className={clsx("rounded-[var(--radius-card)] border border-border bg-surface shadow-soft", className)}>{children}</Tag>;
}

/* ---------- Loading ---------- */

export function RouteLoader({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-10 text-muted">
      <div aria-hidden className="relative h-1 w-40 overflow-hidden rounded-full bg-border">
        <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-route" style={{ animation: "route-sweep 1.1s var(--ease-out-expo) infinite" }} />
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {description && <div className="mt-1.5 text-[15px] text-muted">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
