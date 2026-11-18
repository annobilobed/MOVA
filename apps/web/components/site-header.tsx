"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { roleHome } from "@/lib/format";
import { Logo } from "./logo";
import { useSession } from "./session";
import { buttonClass } from "./ui";

const links = [
  { href: "/trips", label: "Find a trip" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/help", label: "Help" },
];

export function SiteHeader({ overHero = false }: { overHero?: boolean }) {
  const { user, loading } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const light = overHero && !scrolled && !open;

  return (
    <header
      className={clsx(
        "no-print sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-200",
        light ? "border-b border-transparent bg-transparent" : "border-b border-border bg-surface/92 backdrop-blur-md",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="MOVA home" className="rounded-lg">
          <Logo tone={light ? "light" : "auto"} />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.href === pathname || (l.href !== "/" && !l.href.includes("#") && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors",
                  light ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-muted hover:bg-info-bg hover:text-fg",
                  active && (light ? "text-white" : "text-accent-fg"),
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {!loading &&
            (user ? (
              <Link href={roleHome(user.role)} className={buttonClass(light ? "light" : "primary", "sm")}>
                {user.role === "student" ? "My trips" : "Open dashboard"}
              </Link>
            ) : (
              <>
                <Link href="/auth/sign-in" className={clsx("rounded-full px-3.5 py-2 text-[15px] font-semibold", light ? "text-white hover:bg-white/10" : "text-fg hover:bg-info-bg")}>
                  Sign in
                </Link>
                <Link href="/auth/register" className={buttonClass(light ? "light" : "primary", "sm")}>
                  Create account
                </Link>
              </>
            ))}
        </div>
        <button
          className={clsx("grid size-11 place-items-center rounded-xl md:hidden", light ? "text-white" : "text-fg")}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t border-border bg-surface md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col py-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-xl px-3 py-3 text-base font-medium text-fg hover:bg-info-bg">
                {l.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
              {user ? (
                <Link href={roleHome(user.role)} className={buttonClass("primary", "md", "col-span-2")}>
                  {user.role === "student" ? "My trips" : "Open dashboard"}
                </Link>
              ) : (
                <>
                  <Link href="/auth/sign-in" className={buttonClass("outline")}>Sign in</Link>
                  <Link href="/auth/register" className={buttonClass("primary")}>Create account</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
