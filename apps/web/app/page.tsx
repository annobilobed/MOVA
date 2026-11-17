import { ArrowRight, Bus, CreditCard, GraduationCap, Lock, QrCode, School } from "lucide-react";
import Link from "next/link";
import { HeroVisual } from "@/components/hero/hero-visual";
import { HowItWorks } from "@/components/how-it-works";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TripCard } from "@/components/trip-card";
import { TripSearch } from "@/components/trip-search";
import { EmptyState } from "@/components/ui";
import { buttonClass } from "@/lib/styles";
import { serverApi } from "@/lib/api";
import type { Trip } from "@/lib/types";

export const revalidate = 30;

export default async function Home() {
  const [data, places] = await Promise.all([
    serverApi<{ trips: Trip[] }>("/trips?limit=4"),
    serverApi<{ origins: string[] }>("/trips/places"),
  ]);
  const trips = data?.trips ?? [];
  // Suggest an origin only when every live trip leaves from the same place.
  const defaultOrigin = places?.origins.length === 1 ? places.origins[0] : undefined;

  return (
    <>
      <div className="relative isolate overflow-hidden bg-[linear-gradient(120deg,#493BFF_0%,#8655FF_100%)] text-white dark:bg-[linear-gradient(120deg,#2b20c4_0%,#5a2fd6_100%)]">
        <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] -z-10 size-[720px] rounded-full bg-[radial-gradient(circle,rgba(18,214,197,0.28),transparent_62%)]" />
        <div aria-hidden className="pointer-events-none absolute bottom-[-30%] left-[-15%] -z-10 size-[640px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.14),transparent_65%)]" />
        <SiteHeader overHero />
        <main id="main">
          <section className="container-page grid items-center gap-8 pt-8 pb-16 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6 lg:pt-14 lg:pb-24">
            <div className="max-w-xl">
              <h1 className="text-[clamp(2.4rem,5.6vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.035em]">
                Your journey. Your seat. Your freedom.
              </h1>
              <p className="mt-5 max-w-md text-lg text-white/85">
                Book student travel from UCC in minutes: pick your exact seat, pay with mobile money or card, and board with a QR ticket on your phone.
              </p>
              <div className="mt-8 rounded-[22px] bg-surface p-5 text-fg shadow-float sm:p-6">
                <TripSearch defaultOrigin={defaultOrigin} />
              </div>
              <Link href="#how-it-works" className="mt-5 inline-flex items-center gap-1.5 rounded-lg font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline">
                How MOVA works <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
            <div className="relative -mx-4 sm:mx-0 lg:-mr-16 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
              <HeroVisual />
              <div aria-hidden className="absolute top-[10%] left-[14%] hidden items-center gap-2.5 rounded-2xl border border-white/25 bg-white/14 px-3.5 py-2.5 shadow-float backdrop-blur-md sm:flex">
                <span className="tabular grid size-8 place-items-center rounded-lg bg-electric text-sm font-bold">14</span>
                <span className="text-sm leading-tight"><span className="block font-semibold">Seat selected</span><span className="text-white/75">Held for 10 minutes</span></span>
              </div>
              <div aria-hidden className="absolute right-[14%] bottom-[8%] hidden items-center gap-2.5 rounded-2xl border border-white/25 bg-white/14 px-3.5 py-2.5 shadow-float backdrop-blur-md sm:flex">
                <span className="grid size-8 place-items-center rounded-lg bg-aqua text-ink"><QrCode className="size-4.5" /></span>
                <span className="text-sm leading-tight"><span className="block font-semibold">Ticket ready</span><span className="text-white/75">Show it when you board</span></span>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Trust strip: only claims the service actually delivers. */}
      <section aria-label="Why students book with MOVA" className="border-b border-border bg-surface">
        <ul className="container-page grid divide-border py-2 sm:grid-cols-3 sm:divide-x">
          {[
            { Icon: Lock, title: "Your exact seat", body: "Held for you while you pay" },
            { Icon: CreditCard, title: "Secure payment", body: "Mobile money or card via Paystack" },
            { Icon: QrCode, title: "QR ticket", body: "On your phone, checked at boarding" },
          ].map(({ Icon, title, body }) => (
            <li key={title} className="flex items-center gap-3.5 px-1 py-4 sm:px-6 first:sm:pl-0">
              <Icon aria-hidden className="size-6 shrink-0 text-route" />
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-28">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-extrabold sm:text-[2.6rem] sm:leading-[1.1]">From seat to bus door in four steps</h2>
            <p className="mt-3 text-lg text-muted">No queues at the station and no cash. Everything you need to travel is on your phone.</p>
          </div>
          <HowItWorks />
        </div>
      </section>

      <section aria-labelledby="upcoming" className="bg-surface py-20 sm:py-24">
        <div className="container-page">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="upcoming" className="text-3xl font-extrabold sm:text-[2.6rem] sm:leading-[1.1]">Upcoming trips</h2>
              <p className="mt-2 text-lg text-muted">Live departures you can book right now.</p>
            </div>
            <Link href="/trips" className={buttonClass("outline")}>
              See all trips <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          {trips.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {trips.map((t) => <TripCard key={t.id} trip={t} />)}
            </div>
          ) : (
            <EmptyState icon={<Bus />} title={data ? "No upcoming trips yet" : "Trips are taking a moment to load"} action={<Link href="/trips" className={buttonClass("primary")}>Search trips</Link>}>
              {data ? "New departures appear here as soon as the operator publishes them." : "We couldn't load departures just now. Try the trip search."}
            </EmptyState>
          )}
        </div>
      </section>

      <section aria-label="Trip types" className="py-20 sm:py-24">
        <div className="container-page grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <Link href="/trips?type=inter_regional" className="group relative isolate flex min-h-72 flex-col justify-end overflow-hidden rounded-[28px] bg-ink p-8 text-white">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(134,85,255,0.55),transparent_60%),radial-gradient(80%_70%_at_0%_100%,rgba(18,214,197,0.25),transparent_60%)]" />
            <GraduationCap aria-hidden className="mb-auto size-9 text-aqua" />
            <h2 className="mt-10 text-3xl font-extrabold">Going home for vacation</h2>
            <p className="mt-2 max-w-md text-white/75">Inter-regional coaches from campus to cities across Ghana. Book early to get the seat you want.</p>
            <span className="mt-6 inline-flex items-center gap-1.5 font-semibold text-aqua">Find inter-regional trips <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-1" /></span>
          </Link>
          <Link href="/trips?type=campus_shuttle" className="group relative isolate flex min-h-72 flex-col justify-end overflow-hidden rounded-[28px] border border-border bg-surface p-8">
            <School aria-hidden className="mb-auto size-9 text-accent-fg" />
            <h2 className="mt-10 text-3xl font-extrabold">Getting around campus</h2>
            <p className="mt-2 text-muted">Campus shuttles between halls, faculties and town, with the same seat booking and QR tickets.</p>
            <span className="mt-6 inline-flex items-center gap-1.5 font-semibold text-accent-fg">Find campus shuttles <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="faq" className="border-t border-border bg-surface py-20 sm:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="faq" className="text-3xl font-extrabold sm:text-[2.6rem] sm:leading-[1.1]">Good to know</h2>
            <p className="mt-3 text-lg text-muted">Straight answers about holds, payments and tickets.</p>
            <Link href="/help" className={buttonClass("outline", "md", "mt-6")}>Visit Help</Link>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {[
              ["How long is my seat held?", "Ten minutes from when you choose it. A countdown shows how much time is left. If it runs out, the seat is released and you can choose again."],
              ["What if my payment is still pending?", "Keep the page open. We check with Paystack and update automatically. Don't pay a second time — if the connection drops, we'll check your booking status when you're back."],
              ["What if someone else gets my seat while I'm paying?", "You won't be charged for a seat you can't have. If the seat is gone when your payment completes, your payment is refunded."],
              ["Do I need to print my ticket?", "No. Show the QR ticket on your phone. The ticket details are also shown as text, in case your screen is hard to scan."],
            ].map(([q, a]) => (
              <details key={q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-display text-lg font-bold">
                  {q}
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-xl leading-none text-muted transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-prose text-[15px] text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-page">
          <div className="relative isolate overflow-hidden rounded-[32px] bg-[linear-gradient(120deg,#493BFF_0%,#3a2df0_45%,#12D6C5_130%)] px-8 py-14 text-white sm:px-14">
            <div className="max-w-xl">
              <h2 className="text-3xl font-extrabold sm:text-[2.6rem] sm:leading-[1.1]">Your next trip starts with a seat.</h2>
              <p className="mt-3 text-lg text-white/90">Create a free account with your UCC student ID and book in minutes.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/trips" className={buttonClass("light", "lg")}>Find available trips</Link>
                <Link href="/auth/register" className={buttonClass("ghost-light", "lg")}>Create account</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
