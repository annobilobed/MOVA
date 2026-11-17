"use client";

import clsx from "clsx";
import { RotateCw, SearchX, WifiOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TripCard, TripCardSkeleton } from "@/components/trip-card";
import { TripSearch } from "@/components/trip-search";
import { Button, EmptyState } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Trip } from "@/lib/types";

const filters = [
  { id: "", label: "All trips" },
  { id: "inter_regional", label: "Inter-regional" },
  { id: "campus_shuttle", label: "Campus shuttle" },
] as const;

export function TripResults() {
  const params = useSearchParams();
  const router = useRouter();
  const origin = params.get("origin") ?? "";
  const destination = params.get("destination") ?? "";
  const date = params.get("date") ?? "";
  const type = params.get("type") ?? "";
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const load = useCallback(() => {
    setTrips(null);
    setError(null);
    const q = new URLSearchParams();
    if (origin) q.set("origin", origin);
    if (destination) q.set("destination", destination);
    if (date) q.set("date", date);
    if (type) q.set("type", type);
    api<{ trips: Trip[] }>(`/trips?${q}`)
      .then((r) => setTrips(r.trips))
      .catch((e) => setError(e instanceof ApiError ? e : new ApiError(0, "error", "Something went wrong.")));
  }, [origin, destination, date, type]);

  useEffect(load, [load]);

  const setType = (t: string) => {
    const q = new URLSearchParams(params);
    if (t) q.set("type", t);
    else q.delete("type");
    router.replace(`/trips?${q}`, { scroll: false });
  };

  const summary = [origin && `from ${origin}`, destination && `to ${destination}`, date && `on ${formatDate(`${date}T12:00:00Z`)}`].filter(Boolean).join(" ");

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-8">
          <h1 className="text-2xl font-extrabold sm:text-3xl">Find a trip</h1>
          <div className="mt-5">
            <TripSearch key={`${origin}|${destination}|${date}`} variant="bar" initial={{ origin, destination, date }} />
          </div>
        </div>
      </section>
      <section className="container-page py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className="text-[15px] text-muted">
            {trips ? (
              <>
                <span className="font-semibold text-fg">{trips.length} {trips.length === 1 ? "trip" : "trips"}</span> {summary || "departing soon"}
              </>
            ) : error ? "" : "Finding available trips…"}
          </p>
          <div role="group" aria-label="Trip type" className="flex gap-2 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setType(f.id)}
                aria-pressed={type === f.id}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
                  type === f.id ? "border-electric bg-electric text-white dark:border-accent dark:bg-accent" : "border-border bg-surface text-muted hover:border-accent hover:text-fg",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <EmptyState
            icon={error.offline ? <WifiOff /> : <RotateCw />}
            title={error.offline ? "Connection interrupted" : "We couldn't load trips"}
            action={<Button onClick={load}><RotateCw aria-hidden className="size-4" />Try again</Button>}
          >
            {error.message}
          </EmptyState>
        ) : !trips ? (
          <div className="grid gap-4" aria-hidden>
            {[0, 1, 2].map((i) => <TripCardSkeleton key={i} />)}
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title="No trips match those details."
            action={<Button variant="outline" onClick={() => router.push("/trips")}>Clear search</Button>}
          >
            Try another date or destination, or clear the search to see every upcoming trip.
          </EmptyState>
        ) : (
          <div className="grid gap-4">
            {trips.map((t) => <TripCard key={t.id} trip={t} />)}
          </div>
        )}
      </section>
    </>
  );
}
