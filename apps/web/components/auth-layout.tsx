import Link from "next/link";
import { Logo } from "./logo";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,560px)]">
      <aside aria-hidden className="relative hidden overflow-hidden bg-[linear-gradient(120deg,#493BFF_0%,#8655FF_100%)] lg:block">
        <div className="absolute -right-24 -bottom-24 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(18,214,197,0.35),transparent_62%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo tone="light" />
          <div>
            <p className="max-w-md font-display text-5xl leading-[1.05] font-extrabold tracking-[-0.03em]">Your journey. Your seat. Your freedom.</p>
            <svg viewBox="0 0 400 60" className="mt-10 w-80 text-aqua">
              <path d="M8 40 C 90 10, 150 50, 230 28 S 360 12, 392 22" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="12 10" strokeLinecap="round" />
              <circle cx="8" cy="40" r="7" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle cx="392" cy="22" r="8" fill="currentColor" />
            </svg>
          </div>
          <p className="text-sm text-white/70">MOVA · UCC Student Transit System</p>
        </div>
      </aside>
      <main id="main" className="flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" className="self-start rounded-lg lg:hidden"><Logo /></Link>
        <div className="mx-auto my-auto w-full max-w-md py-10">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
