import Link from "next/link";
import { Logo } from "./logo";
import { ThemeSwitcher } from "./theme";

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-[15px] text-muted">Move smart. Travel easy. Seat booking, digital payment and QR tickets for UCC students.</p>
          <div className="mt-5"><ThemeSwitcher /></div>
        </div>
        <FooterCol title="Travel" links={[["Find a trip", "/trips"], ["How it works", "/#how-it-works"], ["My tickets", "/tickets"]]} />
        <FooterCol title="Support" links={[["Help and FAQs", "/help"], ["Contact support", "/help#contact"], ["Payment issues", "/help#payments"]]} />
        <FooterCol title="Service" links={[["Privacy notice", "/privacy"], ["Terms of travel", "/terms"], ["Operator sign in", "/auth/sign-in"]]} />
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-5 text-sm text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} MOVA · UCC Student Transit System</p>
          <p>Payments processed by Paystack in Ghana cedis.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-fg">{title}</h2>
      <ul className="mt-2 space-y-0.5">
        {links.map(([label, href]) => (
          <li key={href}><Link href={href} className="inline-flex min-h-8 items-center text-[15px] text-muted hover:text-accent-fg hover:underline">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
