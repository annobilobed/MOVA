import { ArrowRight, Bus, CreditCard, Lock, Plus, QrCode } from "lucide-react";
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
import { cedis, formatDateTime, formatTime } from "@/lib/format";
import type { Trip } from "@/lib/types";

export const revalidate = 30;

export default async function Home() {
  const [data, places, regional, shuttles] = await Promise.all([
    serverApi<{ trips: Trip[] }>("/trips?limit=4"),
    serverApi<{ origins: string[] }>("/trips/places"),
    serverApi<{ trips: Trip[] }>("/trips?type=inter_regional&limit=100"),
    serverApi<{ trips: Trip[] }>("/trips?type=campus_shuttle&limit=100"),
  ]);
  const uniq = (xs: string[]) => [...new Set(xs)];
  const regionalStops = uniq((regional?.trips ?? []).map((t) => t.destination));
  const shuttleStops = uniq((shuttles?.trips ?? []).flatMap((t) => [t.origin, t.destination]));
  const facts = (ts: Trip[] = []) =>
    ts.length ? { fromFare: Math.min(...ts.map((t) => t.farePesewas)), next: ts[0].departureAt, count: ts.length } : null;
  const regionalFacts = facts(regional?.trips);
  const shuttleFacts = facts(shuttles?.trips);
  const anyDemo = [...(regional?.trips ?? []), ...(shuttles?.trips ?? [])].some((t) => t.isDemo);
  const trips = data?.trips ?? [];
  // Suggest an origin only when every live trip leaves from the same place.
  const defaultOrigin = places?.origins.length === 1 ? places.origins[0] : undefined;

  return (
    <>
      {/* Hero: the night highway. The 3D scene (or its static picture) fills the frame; the search works on top of it. */}
      <div className="relative isolate overflow-hidden bg-night text-white" data-theme="dark">
        <HeroVisual />
        {/* legibility scrim: night on the left where the words sit, open road on the right */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5] bg-[linear-gradient(90deg,rgba(11,16,38,0.92)_0%,rgba(11,16,38,0.72)_34%,rgba(11,16,38,0.15)_62%,transparent_80%)] max-lg:bg-[linear-gradient(180deg,rgba(11,16,38,0.88)_0%,rgba(11,16,38,0.6)_55%,rgba(11,16,38,0.2)_100%)]" />
        <SiteHeader overHero />
        <main id="main">
          <section className="container-page flex min-h-[min(92svh,860px)] flex-col justify-center pt-6 pb-10 lg:pb-16">
            <div className="max-w-[560px]">
              <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.98] font-black tracking-[-0.02em] text-balance">
                Your journey<span className="text-amber">.</span> Your seat<span className="text-amber">.</span> Your freedom<span className="text-amber">.</span>
              </h1>
              <p className="mt-5 max-w-md text-lg text-white/80">
                The bus home from UCC, booked in minutes. Pick your exact seat, pay with mobile money or card, and board with a QR ticket on your phone.
              </p>
              <div className="mt-8 rounded-[24px] border border-white/10 bg-[#0e1330]/88 p-5 shadow-float backdrop-blur-sm sm:p-6">
                <TripSearch defaultOrigin={defaultOrigin} />
              </div>
              {trips.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-white/70">Leaving soon</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {trips.slice(0, 3).map((t) => (
                      <li key={t.id}>
                        <Link href={`/trips/${t.id}`} className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 py-1.5 pr-3.5 pl-1.5 text-sm transition-colors hover:border-amber/60 hover:bg-white/10">
                          <span className="tabular rounded-full bg-amber px-2 py-0.5 text-xs font-bold text-on-accent">{formatTime(t.departureAt)}</span>
                          <span className="font-semibold">{t.destination}</span>
                          <span className="tabular text-white/60">{cedis(t.farePesewas)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <a href="#how-it-works" className="mt-10 inline-flex items-center gap-2 self-start rounded-lg text-sm font-semibold text-white/70 hover:text-white">
              <span aria-hidden className="flex h-8 w-5 justify-center rounded-full border-2 border-white/40 pt-1.5"><span className="mova-cue h-2 w-0.5 rounded-full bg-amber" /></span>
              Scroll to ride along
            </a>
          </section>
        </main>
      </div>

      {/* Sunrise: the night hero gives way to the morning page below. */}
      <div aria-hidden className="h-20 bg-[linear-gradient(180deg,#0b1026_0%,#2a1d4f_30%,#b4506a_58%,#f0803c_78%,var(--ground)_100%)] dark:bg-[linear-gradient(180deg,#0b1026_0%,#2a1d4f_45%,#5b2e6b_70%,var(--ground)_100%)]" />

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
        <div className="container-page grid gap-4 lg:grid-cols-2">
          <Link href="/trips?type=inter_regional" className="group relative isolate flex flex-col overflow-hidden rounded-[28px] bg-ink p-8 text-white sm:p-10">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(134,85,255,0.55),transparent_60%),radial-gradient(80%_70%_at_0%_100%,rgba(18,214,197,0.25),transparent_60%)]" />
            <h2 className="text-3xl font-extrabold">Going home for vacation</h2>
            <p className="mt-2 max-w-md text-white/75">Inter-regional coaches from campus to cities across Ghana. Book early to get the seat you want.</p>
            <RouteLine stops={regionalStops} from={regional?.trips[0]?.origin} tone="dark" />
            <TripFacts facts={regionalFacts} tone="dark" />
            <span className="inline-flex items-center gap-1.5 pt-6 font-semibold text-aqua">Find inter-regional trips <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-1" /></span>
          </Link>
          <Link href="/trips?type=campus_shuttle" className="group relative isolate flex flex-col overflow-hidden rounded-[28px] border border-border bg-surface p-8 sm:p-10">
            <h2 className="text-3xl font-extrabold">Getting around campus</h2>
            <p className="mt-2 text-muted">Campus shuttles between halls, faculties and town, with the same seat booking and QR tickets.</p>
            <RouteLine stops={shuttleStops} tone="light" />
            <TripFacts facts={shuttleFacts} tone="light" />
            <span className="inline-flex items-center gap-1.5 pt-6 font-semibold text-accent-fg">Find campus shuttles <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-1" /></span>
          </Link>
        </div>
        {anyDemo && <p className="container-page mt-3 text-sm text-muted">Routes shown are from current demo data.</p>}
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
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted transition-transform duration-200 group-open:rotate-45"><Plus className="size-4" /></span>
                </summary>
                <p className="mt-3 max-w-prose text-[15px] text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-page">
          <div className="relative isolate overflow-hidden rounded-[32px] mova-flow-cta px-8 py-14 text-white sm:px-14">
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

/** Real stops from live trips, drawn on the route line. Hidden when there are none. */
function RouteLine({ stops, from, tone }: { stops: string[]; from?: string; tone: "dark" | "light" }) {
  if (!stops.length) return null;
  const shown = stops.slice(0, 4);
  return (
    <ol aria-label={from ? `Destinations from ${from}` : "Stops"} className="relative mt-8 mb-8 flex flex-col gap-3">
      <span aria-hidden className={`absolute top-2 bottom-2 left-[5px] w-0.5 bg-[repeating-linear-gradient(180deg,var(--color-aqua)_0_5px,transparent_5px_9px)]`} />
      {from && (
        <li className={`relative flex items-center gap-3 text-sm ${tone === "dark" ? "text-white/70" : "text-muted"}`}>
          <span aria-hidden className="size-3 rounded-full border-2 border-aqua bg-transparent" /> From {from}
        </li>
      )}
      {shown.map((s) => (
        <li key={s} className="relative flex items-center gap-3 font-display text-xl font-bold">
          <span aria-hidden className="size-3 rounded-full bg-aqua" /> {s}
        </li>
      ))}
      {stops.length > shown.length && <li className={`pl-6 text-sm ${tone === "dark" ? "text-white/70" : "text-muted"}`}>and {stops.length - shown.length} more</li>}
    </ol>
  );
}

/** Real figures from live trips: lowest fare, next departure, number of departures. */
function TripFacts({ facts, tone }: { facts: { fromFare: number; next: string; count: number } | null; tone: "dark" | "light" }) {
  if (!facts) return null;
  const label = tone === "dark" ? "text-white/70" : "text-muted";
  return (
    <dl className={`mt-auto grid grid-cols-3 gap-4 border-t pt-5 ${tone === "dark" ? "border-white/15" : "border-border"}`}>
      <div><dt className={`text-sm ${label}`}>Fares from</dt><dd className="tabular font-display text-lg font-bold">{cedis(facts.fromFare)}</dd></div>
      <div><dt className={`text-sm ${label}`}>Next departure</dt><dd className="tabular font-display text-lg font-bold">{formatDateTime(facts.next)}</dd></div>
      <div><dt className={`text-sm ${label}`}>Departures</dt><dd className="tabular font-display text-lg font-bold">{facts.count}</dd></div>
    </dl>
  );
}
