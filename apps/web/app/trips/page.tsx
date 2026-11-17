import { Suspense } from "react";
import { PublicShell } from "@/components/public-shell";
import { TripResults } from "./trip-results";

export const metadata = { title: "Find a trip" };

export default function TripsPage() {
  return (
    <PublicShell>
      <Suspense>
        <TripResults />
      </Suspense>
    </PublicShell>
  );
}
