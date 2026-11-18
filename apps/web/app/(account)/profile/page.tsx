"use client";

import { useSession } from "@/components/session";
import { ThemeSwitcher } from "@/components/theme";
import { Card, PageHeader } from "@/components/ui";

const roleName = { student: "Student", driver: "Driver", operator: "Operator admin", super_admin: "Super admin" } as const;

export default function ProfilePage() {
  const { user, signOut } = useSession();
  if (!user) return null;
  const rows: [string, string | null][] = [
    ["Full name", user.fullName],
    ["Email", user.email],
    ["Phone", user.phone],
    ["UCC student ID", user.studentId],
    ["Account type", roleName[user.role]],
  ];
  return (
    <div className="container-page max-w-2xl py-8 sm:py-10">
      <PageHeader title="Profile" description="Your details are visible only to you and, for trips you book, to the bus operator." />
      <Card className="divide-y divide-border">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 px-5 py-4 sm:flex-row sm:justify-between">
            <span className="text-sm text-muted">{k}</span>
            <span className="font-semibold">{v}</span>
          </div>
        ))}
      </Card>
      <Card className="mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Appearance</p>
          <p className="text-sm text-muted">Light, dark, or match your device.</p>
        </div>
        <ThemeSwitcher />
      </Card>
      <p className="mt-6 text-sm text-muted">To change your details or password, contact support. Self-service editing and password reset are coming later.</p>
      <button onClick={signOut} className="mt-6 inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-semibold text-danger hover:underline">Sign out</button>
    </div>
  );
}
