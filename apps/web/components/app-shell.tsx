"use client";

import clsx from "clsx";
import { Building2, Bus, ClipboardList, Gauge, Home, LogOut, Route, ScanLine, Search, ShieldCheck, Ticket, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Role } from "@/lib/types";
import { Logo } from "./logo";
import { useSession } from "./session";
import { ThemeSwitcher } from "./theme";
import { EmptyState, RouteLoader } from "./ui";
import { buttonClass } from "@/lib/styles";

type NavItem = { href: string; label: string; Icon: typeof Home; exact?: boolean };

const NAV: Record<Role, NavItem[]> = {
  student: [
    { href: "/dashboard", label: "Home", Icon: Home, exact: true },
    { href: "/trips", label: "Find trips", Icon: Search },
    { href: "/tickets", label: "My tickets", Icon: Ticket },
    { href: "/profile", label: "Profile", Icon: User },
  ],
  driver: [
    { href: "/driver", label: "My trips", Icon: Route, exact: true },
    { href: "/driver/scan", label: "Scan tickets", Icon: ScanLine },
    { href: "/profile", label: "Profile", Icon: User },
  ],
  operator: [
    { href: "/operator", label: "Overview", Icon: Gauge, exact: true },
    { href: "/operator/trips", label: "Trips", Icon: ClipboardList },
    { href: "/operator/buses", label: "Buses", Icon: Bus },
    { href: "/profile", label: "Profile", Icon: User },
  ],
  super_admin: [
    { href: "/admin", label: "System", Icon: ShieldCheck, exact: true },
    { href: "/admin/users", label: "Users", Icon: Users },
    { href: "/admin/companies", label: "Operators", Icon: Building2 },
    { href: "/operator", label: "Operations", Icon: Gauge },
    { href: "/profile", label: "Profile", Icon: User },
  ],
};

const roleName: Record<Role, string> = { student: "Student", driver: "Driver", operator: "Operator", super_admin: "Super admin" };

export function AppShell({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user, loading, signOut } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace(`/auth/sign-in?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, pathname, router]);

  if (loading || !user) return <div className="grid min-h-dvh place-items-center"><RouteLoader label="Loading your account…" /></div>;

  const items = NAV[user.role];
  const isActive = (i: NavItem) => (i.exact ? pathname === i.href : pathname.startsWith(i.href));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr] print:block">
      <aside className="no-print sticky top-0 hidden h-dvh flex-col border-r border-border bg-surface px-4 py-5 lg:flex">
        <Link href="/" aria-label="MOVA home" className="rounded-lg px-2"><Logo /></Link>
        <nav aria-label="App" className="mt-8 flex flex-col gap-1">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              aria-current={isActive(i) ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
                isActive(i) ? "bg-info-bg font-semibold text-accent-fg" : "text-muted hover:bg-ground hover:text-fg",
              )}
            >
              <i.Icon aria-hidden className="size-5" />
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-4 border-t border-border pt-4">
          <div className="px-2">
            <p className="truncate font-semibold">{user.fullName}</p>
            <p className="text-sm text-muted">{roleName[user.role]}</p>
          </div>
          <ThemeSwitcher compact />
          <button onClick={signOut} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-muted hover:bg-ground hover:text-fg">
            <LogOut aria-hidden className="size-5" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col pb-20 lg:pb-0 print:pb-0">
        <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/92 px-4 backdrop-blur-md lg:hidden">
          <Link href="/" aria-label="MOVA home" className="rounded-lg"><Logo /></Link>
          <button onClick={signOut} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-muted">
            <LogOut aria-hidden className="size-4" /> Sign out
          </button>
        </header>
        <main id="main" className="flex-1">
          {roles.includes(user.role) ? (
            children
          ) : (
            <div className="container-page py-12">
              <EmptyState icon={<ShieldCheck />} title="This area isn't available for your account" action={<Link href={NAV[user.role][0].href} className={buttonClass()}>Go to your home</Link>}>
                You're signed in as {roleName[user.role].toLowerCase()}. Ask an administrator if you need different access.
              </EmptyState>
            </div>
          )}
        </main>
      </div>

      <nav aria-label="App" className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <ul className="mx-auto grid max-w-lg" style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 5)}, 1fr)` }}>
          {items.slice(0, 5).map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={isActive(i) ? "page" : undefined}
                className={clsx("flex flex-col items-center gap-1 py-2.5 text-xs font-semibold", isActive(i) ? "text-accent-fg" : "text-muted")}
              >
                <i.Icon aria-hidden className="size-5.5" />
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
