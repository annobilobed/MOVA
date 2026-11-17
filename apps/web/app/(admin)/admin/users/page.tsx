"use client";

import clsx from "clsx";
import { Search, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LoadState } from "@/components/load-state";
import { useSession } from "@/components/session";
import { Alert, Badge, Button, Card, Field, PageHeader, SelectField, inputClass } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { Role } from "@/lib/types";
import { useApi } from "@/lib/use-api";

interface AdminUser { id: string; fullName: string; email: string; phone: string; studentId: string | null; role: Role; isActive: boolean; company: { id: string; name: string } | null }
interface Company { id: string; name: string }

const roleName: Record<Role, string> = { student: "Student", driver: "Driver", operator: "Operator", super_admin: "Super admin" };

export default function AdminUsers() {
  const { user: me } = useSession();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [role, setRole] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  const q = new URLSearchParams();
  if (debounced) q.set("search", debounced);
  if (role) q.set("role", role);
  const users = useApi<{ users: AdminUser[] }>(`/admin/users?${q}`);
  const companies = useApi<{ companies: Company[] }>("/admin/companies");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader title="Users" description="Change roles, link staff to a company, or deactivate accounts." actions={<Button onClick={() => setCreating(true)}><UserPlus className="size-4" />Add staff account</Button>} />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="user-search" className="sr-only">Search users</label>
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" />
            <input id="user-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or student ID" className={clsx(inputClass(false, true), "h-10")} />
          </div>
          <label htmlFor="role-filter" className="sr-only">Role</label>
          <select id="role-filter" value={role} onChange={(e) => setRole(e.target.value)} className={clsx(inputClass(), "h-10 sm:w-48")}>
            <option value="">All roles</option>
            {(Object.keys(roleName) as Role[]).map((r) => <option key={r} value={r}>{roleName[r]}</option>)}
          </select>
        </div>
        <LoadState loading={users.loading && !users.data} error={users.error} reload={users.reload} label="Loading users…" />
        {users.data && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[15px]">
              <thead className="border-b border-border bg-ground text-xs font-semibold text-muted uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">Name</th>
                  <th scope="col" className="px-4 py-3">Email</th>
                  <th scope="col" className="px-4 py-3">Role</th>
                  <th scope="col" className="px-4 py-3">Company</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.data.users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3"><span className="font-semibold">{u.fullName}</span>{u.studentId && <><br /><span className="tabular text-sm text-muted">{u.studentId}</span></>}</td>
                    <td className="px-4 py-3 text-sm">{u.email}</td>
                    <td className="px-4 py-3"><Badge tone={u.role === "super_admin" ? "info" : "neutral"}>{roleName[u.role]}</Badge></td>
                    <td className="px-4 py-3 text-sm">{u.company?.name ?? <span className="text-muted">—</span>}</td>
                    <td className="px-4 py-3">{u.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Deactivated</Badge>}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => setEditing(u)} disabled={u.id === me?.id}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!users.data.users.length && <p className="px-5 py-10 text-center text-muted">No users match your search.</p>}
          </div>
        )}
      </Card>
      {editing && <EditDialog user={editing} companies={companies.data?.companies ?? []} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); users.reload(); }} />}
      {creating && <CreateDialog companies={companies.data?.companies ?? []} onClose={() => setCreating(false)} onSaved={users.reload} />}
    </div>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="dlg-title" className="m-auto w-[min(520px,calc(100vw-2rem))] rounded-[var(--radius-card)] border border-border bg-surface p-0 text-fg shadow-float backdrop:bg-ink/50 backdrop:backdrop-blur-sm">
      <div className="p-6">
        <h2 id="dlg-title" className="text-xl font-bold">{title}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  );
}

function EditDialog({ user, companies, onClose, onSaved }: { user: AdminUser; companies: Company[]; onClose: () => void; onSaved: () => void }) {
  const [role, setRole] = useState<Role>(user.role);
  const [companyId, setCompanyId] = useState(user.company?.id ?? "");
  const [isActive, setIsActive] = useState(user.isActive);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const needsCompany = role === "driver" || role === "operator";
  const changed = role !== user.role || isActive !== user.isActive || (needsCompany && companyId !== (user.company?.id ?? ""));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await api(`/admin/users/${user.id}`, { method: "PATCH", json: { role, companyId: needsCompany ? companyId || null : null, isActive } });
      onSaved();
    } catch (e) {
      setError((e as ApiError).message);
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title={`Edit ${user.fullName}`} onClose={onClose}>
      {confirming ? (
        <div className="flex flex-col gap-4">
          <Alert tone="warning" title="Confirm this change">
            {role !== user.role && <>Change role from <strong>{roleName[user.role]}</strong> to <strong>{roleName[role]}</strong>. </>}
            {isActive !== user.isActive && (isActive ? "Reactivate this account. " : "Deactivate this account — they won't be able to sign in. ")}
            This is recorded in the audit log.
          </Alert>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirming(false)}>Back</Button>
            <Button onClick={save} loading={saving}>Confirm change</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setConfirming(true); }} className="flex flex-col gap-4">
          {error && <Alert tone="error">{error}</Alert>}
          <SelectField label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {(Object.keys(roleName) as Role[]).map((r) => <option key={r} value={r}>{roleName[r]}</option>)}
          </SelectField>
          {needsCompany && (
            <SelectField label="Company" value={companyId} onChange={(e) => setCompanyId(e.target.value)} error={!companyId ? "Drivers and operators must belong to a company" : undefined}>
              <option value="">Choose a company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </SelectField>
          )}
          <label className="flex items-center gap-3 text-[15px]">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4 accent-[var(--accent)]" />
            Account is active
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!changed || (needsCompany && !companyId)}>Review change</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

function CreateDialog({ companies, onClose, onSaved }: { companies: Company[]; onClose: () => void; onSaved: () => void }) {
  const [role, setRole] = useState<"driver" | "operator" | "super_admin">("driver");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [temp, setTemp] = useState<{ email: string; password: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setSaving(true);
    setError(null);
    try {
      const res = await api<{ tempPassword: string }>("/admin/users", { method: "POST", json: { ...d, role, companyId: role === "super_admin" ? null : d.companyId || null } });
      setTemp({ email: d.email, password: res.tempPassword });
      onSaved();
    } catch (err) {
      const e2 = err as ApiError;
      if (e2.fields) setErrors(Object.fromEntries(Object.entries(e2.fields).map(([k, v]) => [k, v?.[0]])));
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title="Add staff account" onClose={onClose}>
      {temp ? (
        <div className="flex flex-col gap-4">
          <Alert tone="success" title="Account created">Share this temporary password with {temp.email} privately. It is shown only once.</Alert>
          <p className="tabular rounded-xl bg-ground p-4 text-center font-display text-xl font-bold select-all">{temp.password}</p>
          <Button onClick={onClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          {error && <Alert tone="error">{error}</Alert>}
          <Field label="Full name" name="fullName" error={errors.fullName} />
          <Field label="Email" name="email" type="email" error={errors.email} />
          <Field label="Phone" name="phone" type="tel" error={errors.phone} />
          <SelectField label="Role" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            <option value="driver">Driver</option>
            <option value="operator">Operator</option>
            <option value="super_admin">Super admin</option>
          </SelectField>
          {role !== "super_admin" && (
            <SelectField label="Company" name="companyId" defaultValue="" error={errors.companyId}>
              <option value="" disabled>Choose a company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </SelectField>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>Create account</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
