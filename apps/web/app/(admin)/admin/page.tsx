"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { LoadState } from "@/components/load-state";
import { Metric } from "@/components/metric";
import { Alert, PageHeader } from "@/components/ui";
import { useApi } from "@/lib/use-api";

interface Overview { metrics: { users: number; students: number; companies: number; flaggedPayments: number; refundedPayments: number; bookings: number } }

export default function AdminHome() {
  const { data, error, loading, reload } = useApi<Overview>("/admin/overview");
  const m = data?.metrics;
  const v = (n?: number) => (loading ? undefined : n ?? null);
  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader title="System overview" description="Restricted administration. Account and role changes are recorded in the audit log." />
      {error && <LoadState loading={false} error={error} reload={reload} label="" />}
      {m && m.flaggedPayments > 0 && (
        <Alert tone="warning" className="mb-6" title={`${m.flaggedPayments} payment${m.flaggedPayments === 1 ? "" : "s"} need review`}>
          Flagged payments have no ticket issued. Check them with Paystack before contacting the student.
        </Alert>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Metric accent label="Active bookings" value={v(m?.bookings)} />
        <Metric label="Students" value={v(m?.students)} hint={m ? `${m.users} accounts in total` : undefined} />
        <Metric label="Transport companies" value={v(m?.companies)} />
        <Metric label="Payments needing review" value={v(m?.flaggedPayments)} />
        <Metric label="Refunded payments" value={v(m?.refundedPayments)} />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 rounded-lg font-semibold text-accent-fg hover:underline">Manage users <ArrowRight className="size-4" /></Link>
        <Link href="/admin/companies" className="inline-flex items-center gap-1.5 rounded-lg font-semibold text-accent-fg hover:underline">Manage operators <ArrowRight className="size-4" /></Link>
      </div>
    </div>
  );
}
