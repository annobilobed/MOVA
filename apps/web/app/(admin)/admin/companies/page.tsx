"use client";

import { Building2 } from "lucide-react";
import { useState } from "react";
import { LoadState } from "@/components/load-state";
import { Alert, Button, Card, DemoBadge, EmptyState, Field, PageHeader } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";

interface Company { id: string; name: string; isDemo: boolean; buses: number; staff: number }

export default function Companies() {
  const { data, error, loading, reload } = useApi<{ companies: Company[] }>("/admin/companies");
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [nameError, setNameError] = useState<string>();
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(new FormData(form).get("name") ?? "").trim();
    setNameError(name.length < 2 ? "Enter the company name" : undefined);
    if (name.length < 2) return;
    setSaving(true);
    try {
      await api("/admin/companies", { method: "POST", json: { name } });
      setMsg({ tone: "success", text: `${name} added. Create operator and driver accounts for it on the Users page.` });
      form.reset();
      reload();
    } catch (err) {
      setMsg({ tone: "error", text: (err as ApiError).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader title="Transport operators" description="Companies that run MOVA trips. Operators only ever see their own company's data." />
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <LoadState loading={loading} error={error} reload={reload} label="Loading companies…" />
          {data && !data.companies.length && <div className="p-5"><EmptyState icon={<Building2 />} title="No companies yet" /></div>}
          {data && data.companies.length > 0 && (
            <table className="w-full text-left text-[15px]">
              <thead className="border-b border-border bg-ground text-xs font-semibold text-muted uppercase">
                <tr><th scope="col" className="px-4 py-3">Company</th><th scope="col" className="px-4 py-3 text-right">Buses</th><th scope="col" className="px-4 py-3 text-right">Staff</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.companies.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-semibold">{c.name} {c.isDemo && <DemoBadge className="ml-1" />}</td>
                    <td className="tabular px-4 py-3 text-right">{c.buses}</td>
                    <td className="tabular px-4 py-3 text-right">{c.staff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card as="section" className="p-5">
          <h2 className="text-lg font-bold">Add a company</h2>
          <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-4">
            {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
            <Field label="Company name" name="name" error={nameError} />
            <Button type="submit" loading={saving}>Add company</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
