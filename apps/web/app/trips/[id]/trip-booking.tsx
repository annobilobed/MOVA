"use client";

import { ArrowLeft, ArrowRight, Bus, CalendarClock, Luggage as LuggageIcon, RotateCw, Ticket, WifiOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { HoldTimer } from "@/components/countdown";
import { SeatLegend, SeatMap } from "@/components/seat-map";
import { useSession } from "@/components/session";
import { Alert, Badge, Button, Card, DemoBadge, EmptyState, RouteLoader } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { cedis, formatDate, formatTime, tripTypeLabel } from "@/lib/format";
import { buttonClass } from "@/lib/styles";
import type { Luggage, SeatLayout, SeatState, Trip } from "@/lib/types";

interface SeatsResponse { trip: Trip; layout: SeatLayout; states: Record<string, SeatState> }
interface LuggageOption { id: Luggage; label: string; feePesewas: number }
interface Quote { farePesewas: number; luggagePesewas: number; amountPesewas: number }

export function TripBooking({ tripId }: { tripId: string }) {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const [data, setData] = useState<SeatsResponse | null>(null);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [hold, setHold] = useState<{ seat: string; expiresAt: string } | null>(null);
  const [pendingSeat, setPendingSeat] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "error" | "warning" | "info"; text: string } | null>(null);
  const [luggageOptions, setLuggageOptions] = useState<LuggageOption[]>([]);
  const [luggage, setLuggage] = useState<Luggage>("none");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [paying, setPaying] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await api<SeatsResponse>(`/trips/${tripId}/seats`);
      setData(res);
      setLoadError(null);
      // Recover our own hold after a refresh (the server is the source of truth).
      const mine = Object.entries(res.states).find(([, s]) => s === "selected")?.[0];
      setHold((h) => (mine ? (h?.seat === mine ? h : null) : null));
      return res;
    } catch (e) {
      setLoadError(e as ApiError);
      return null;
    }
  }, [tripId]);

  useEffect(() => {
    load();
    api<{ options: LuggageOption[] }>("/trips/luggage").then((r) => setLuggageOptions(r.options)).catch(() => {});
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  // If we have our own seat selected after a reload but no expiry yet, re-lock to read the expiry.
  useEffect(() => {
    if (!data || hold || !user) return;
    const mine = Object.entries(data.states).find(([, s]) => s === "selected")?.[0];
    if (mine) {
      api<{ lock: { seat: string; expiresAt: string } }>(`/trips/${tripId}/locks`, { method: "POST", json: { seat: mine } })
        .then((r) => setHold(r.lock))
        .catch(() => {});
    }
  }, [data, hold, user, tripId]);

  useEffect(() => {
    api<{ quote: Quote }>(`/trips/${tripId}/quote?luggage=${luggage}`).then((r) => setQuote(r.quote)).catch(() => setQuote(null));
  }, [tripId, luggage]);

  async function selectSeat(seat: string) {
    if (!user) {
      router.push(`/auth/sign-in?next=${encodeURIComponent(`/trips/${tripId}`)}`);
      return;
    }
    setNotice(null);
    setPendingSeat(seat);
    try {
      const { lock } = await api<{ lock: { seat: string; expiresAt: string } }>(`/trips/${tripId}/locks`, { method: "POST", json: { seat } });
      setHold(lock);
      await load();
      if (window.matchMedia("(max-width: 1023px)").matches) summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      const err = e as ApiError;
      setNotice({ tone: err.code === "already_booked" ? "info" : "error", text: err.message });
      await load();
    } finally {
      setPendingSeat(null);
    }
  }

  async function releaseSeat() {
    if (!hold) return;
    await api(`/trips/${tripId}/locks/${hold.seat}`, { method: "DELETE" }).catch(() => {});
    setHold(null);
    load();
  }

  const onExpire = useCallback(() => {
    setHold(null);
    setNotice({ tone: "warning", text: "Your seat hold has expired. The seat may have been released — please choose a seat again." });
    load();
  }, [load]);

  async function pay() {
    if (!hold) return;
    setPaying(true);
    setNotice(null);
    try {
      const res = await api<{ authorizationUrl: string }>("/payments", { method: "POST", json: { tripId, seat: hold.seat, luggage } });
      window.location.href = res.authorizationUrl;
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "lock_expired") onExpire();
      else setNotice({ tone: "error", text: err.message });
      setPaying(false);
    }
  }

  if (loadError && !data) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={loadError.offline ? <WifiOff /> : <Bus />}
          title={loadError.status === 404 ? "We couldn't find that trip" : "We couldn't load this trip"}
          action={loadError.status === 404 ? <Link href="/trips" className={buttonClass()}>Find another trip</Link> : <Button onClick={load}><RotateCw className="size-4" />Try again</Button>}
        >
          {loadError.message}
        </EmptyState>
      </div>
    );
  }
  if (!data) return <RouteLoader label="Loading seats…" />;

  const { trip } = data;
  const canBook = trip.status === "available";

  return (
    <div className="container-page py-6 sm:py-10">
      <Link href="/trips" className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-muted hover:text-fg">
        <ArrowLeft aria-hidden className="size-4" /> All trips
      </Link>

      <header className="mt-4 mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone={trip.tripType === "campus_shuttle" ? "info" : "neutral"}>{tripTypeLabel(trip.tripType)}</Badge>
            {trip.isDemo && <DemoBadge />}
          </div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            {trip.origin} <span aria-hidden className="text-route">→</span><span className="sr-only">to</span> {trip.destination}
          </h1>
          <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-muted">
            <span className="inline-flex items-center gap-1.5"><CalendarClock aria-hidden className="size-4" />{formatDate(trip.departureAt)} at <span className="tabular font-semibold text-fg">{formatTime(trip.departureAt)}</span></span>
            <span className="inline-flex items-center gap-1.5"><Bus aria-hidden className="size-4" />{trip.bus.plate} · {trip.operator}</span>
          </p>
        </div>
        <p className="sm:text-right">
          <span className="block text-sm text-muted">Fare per seat</span>
          <span className="tabular font-display text-3xl font-extrabold">{cedis(trip.farePesewas)}</span>
        </p>
      </header>

      {!canBook && (
        <Alert tone="warning" className="mb-6" title={trip.status === "departed" ? "This trip has departed" : trip.status === "cancelled" ? "This trip was cancelled" : "This trip is fully booked"}>
          It can no longer be booked. <Link href="/trips" className="font-semibold text-accent-fg underline">Find another trip</Link>
        </Alert>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Card as="section" className="p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-3">
            <h2 className="text-xl font-bold">Choose your seat</h2>
            <p className="text-[15px] text-muted">{trip.seatsLeft} of {trip.bus.capacity} seats available. Tap a seat to hold it for 10 minutes.</p>
            <SeatLegend />
          </div>
          <SeatMap layout={data.layout} states={data.states} onSelect={selectSeat} pendingSeat={pendingSeat} disabled={!canBook || paying || sessionLoading} />
        </Card>

        <div ref={summaryRef} className="scroll-mt-20 lg:sticky lg:top-24">
          <Card as="section" className="overflow-hidden">
            <div className="border-b border-border p-5 sm:p-6">
              <h2 className="text-xl font-bold">Booking summary</h2>
              {hold ? (
                <p aria-live="polite" className="mt-1 text-[15px]">
                  Seat <span className="tabular font-bold">{hold.seat}</span> selected
                </p>
              ) : (
                <p className="mt-1 text-[15px] text-muted">{user || sessionLoading ? "No seat selected yet." : "Sign in to choose a seat."}</p>
              )}
            </div>

            <div className="flex flex-col gap-5 p-5 sm:p-6">
              {notice && <Alert tone={notice.tone}>{notice.text}{notice.tone === "info" && <> <Link href="/tickets" className="font-semibold text-accent-fg underline">My tickets</Link></>}</Alert>}
              {hold && <HoldTimer expiresAt={hold.expiresAt} onExpire={onExpire} />}

              <fieldset disabled={!hold || paying}>
                <legend className="mb-2 flex items-center gap-2 text-sm font-semibold"><LuggageIcon aria-hidden className="size-4" /> Luggage</legend>
                <div className="grid gap-2">
                  {luggageOptions.map((o) => (
                    <label key={o.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors has-[:checked]:border-electric has-[:checked]:bg-info-bg has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                      <input type="radio" name="luggage" value={o.id} checked={luggage === o.id} onChange={() => setLuggage(o.id)} className="size-4 accent-[var(--accent)]" />
                      <span className="flex-1 text-[15px]">{o.label}</span>
                      <span className="tabular text-sm font-semibold text-muted">{o.feePesewas ? `+ ${cedis(o.feePesewas)}` : "Free"}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <dl className="space-y-2 text-[15px]">
                <div className="flex justify-between"><dt className="text-muted">Trip fare</dt><dd className="tabular">{cedis(quote?.farePesewas ?? trip.farePesewas)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Luggage</dt><dd className="tabular">{quote ? cedis(quote.luggagePesewas) : "—"}</dd></div>
                <div className="flex justify-between border-t border-border pt-3 text-lg font-bold"><dt>Total</dt><dd className="tabular">{quote ? cedis(quote.amountPesewas) : "—"}</dd></div>
              </dl>

              {user || sessionLoading ? (
                <Button size="lg" onClick={pay} disabled={!hold || !quote} loading={paying} loadingText="Starting payment…">
                  Continue to payment <ArrowRight aria-hidden className="size-4.5" />
                </Button>
              ) : (
                <Link href={`/auth/sign-in?next=${encodeURIComponent(`/trips/${tripId}`)}`} className={buttonClass("primary", "lg")}>Sign in to book</Link>
              )}
              {hold && !paying && (
                <button onClick={releaseSeat} className="rounded-lg text-sm font-semibold text-muted hover:text-fg hover:underline">Release this seat</button>
              )}
              <p className="flex items-start gap-2 text-xs text-muted">
                <Ticket aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                You pay with mobile money or card through Paystack. Your ticket is issued only after your payment is confirmed.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
