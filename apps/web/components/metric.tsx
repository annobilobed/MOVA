/** Quiet summary row of real backend counts; "—" when a value is unavailable. */
export function SummaryRow({ items, loading }: { items: { label: string; value: number | null | undefined }[]; loading?: boolean }) {
  return (
    <dl className="grid grid-cols-2 divide-border rounded-[var(--radius-card)] border border-border bg-surface sm:flex sm:divide-x">
      {items.map((i) => (
        <div key={i.label} className="flex flex-1 flex-col gap-0.5 px-5 py-4">
          <dt className="text-sm text-muted">{i.label}</dt>
          <dd className="tabular text-2xl font-bold">{loading ? <span className="skeleton inline-block h-7 w-10 align-middle" /> : i.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
