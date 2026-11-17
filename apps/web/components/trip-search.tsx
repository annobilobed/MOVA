"use client";

import clsx from "clsx";
import { ArrowRight, ArrowUpDown, CalendarDays, MapPin, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { api } from "@/lib/api";
import { todayInAccra } from "@/lib/format";
import { Button, inputClass } from "./ui";

interface Places { origins: string[]; destinations: string[] }

export function TripSearch({
  initial,
  variant = "panel",
  defaultOrigin,
}: {
  initial?: { origin?: string; destination?: string; date?: string };
  variant?: "panel" | "bar";
  defaultOrigin?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [origin, setOrigin] = useState(initial?.origin ?? defaultOrigin ?? "");
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [places, setPlaces] = useState<Places>({ origins: [], destinations: [] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api<Places>("/trips/places").then(setPlaces).catch(() => {});
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const q = new URLSearchParams();
    if (origin.trim()) q.set("origin", origin.trim());
    if (destination.trim()) q.set("destination", destination.trim());
    if (date) q.set("date", date);
    router.push(`/trips${q.size ? `?${q}` : ""}`);
  };

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const bar = variant === "bar";

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Find a trip"
      className={clsx(
        "relative grid gap-3",
        bar ? "md:grid-cols-[1fr_auto_1fr_200px_auto] md:items-end" : "sm:grid-cols-2",
      )}
    >
      <PlaceInput id={`${id}-from`} label="From" icon={<Navigation />} value={origin} onChange={setOrigin} options={places.origins} placeholder="Leaving from" />
      <button
        type="button"
        onClick={swap}
        aria-label="Swap origin and destination"
        className={clsx(
          "z-10 grid size-10 place-items-center rounded-full border border-border bg-surface text-muted shadow-soft transition-colors hover:border-accent hover:text-accent-fg",
          bar ? "justify-self-center md:mb-1" : "absolute top-[3.1rem] left-1/2 hidden -translate-x-1/2 sm:grid",
        )}
      >
        <ArrowUpDown aria-hidden className="size-4 md:rotate-90" />
      </button>
      <PlaceInput id={`${id}-to`} label="To" icon={<MapPin />} value={destination} onChange={setDestination} options={places.destinations} placeholder="Where to?" />
      <div className={clsx("flex flex-col gap-1.5", !bar && "sm:col-span-2")}>
        <label htmlFor={`${id}-date`} className="text-sm font-semibold">Departure date <span className="font-normal text-muted">(optional)</span></label>
        <div className="relative">
          <CalendarDays aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" />
          <input id={`${id}-date`} type="date" min={todayInAccra()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass(false, true)} />
        </div>
      </div>
      <Button type="submit" size="lg" loading={submitting} className={clsx(!bar && "sm:col-span-2", "w-full")}>
        Find available trips
        <ArrowRight aria-hidden className="size-4.5" />
      </Button>
    </form>
  );
}

function PlaceInput({ id, label, icon, value, onChange, options, placeholder }: { id: string; label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <div className="relative">
        <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted [&_svg]:size-4.5">{icon}</span>
        <input id={id} list={`${id}-list`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" className={inputClass(false, true)} />
        <datalist id={`${id}-list`}>
          {options.map((o) => <option key={o} value={o} />)}
        </datalist>
      </div>
    </div>
  );
}
