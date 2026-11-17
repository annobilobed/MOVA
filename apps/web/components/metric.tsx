import clsx from "clsx";

/** Dashboard metric: shows only real backend values; "—" when unavailable. */
export function Metric({ label, value, hint, accent }: { label: string; value: number | null | undefined; hint?: string; accent?: boolean }) {
  return (
    <div className={clsx("rounded-[var(--radius-card)] border p-5", accent ? "border-transparent bg-[linear-gradient(120deg,#493BFF_0%,#8655FF_100%)] text-white" : "border-border bg-surface")}>
      <p className={clsx("text-sm font-medium", accent ? "text-white/80" : "text-muted")}>{label}</p>
      {value === undefined ? (
        <div className="skeleton mt-2 h-9 w-16" />
      ) : (
        <p className="tabular mt-1 font-display text-4xl font-extrabold">{value ?? "—"}</p>
      )}
      {hint && <p className={clsx("mt-1 text-sm", accent ? "text-white/75" : "text-muted")}>{hint}</p>}
    </div>
  );
}
