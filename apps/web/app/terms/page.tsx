import { PublicShell } from "@/components/public-shell";
import { Alert } from "@/components/ui";

export const metadata = { title: "Terms of travel" };

export default function Page() {
  return (
    <PublicShell>
      <div className="container-page max-w-3xl py-12 sm:py-16">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Terms of travel</h1>
        <Alert tone="warning" className="mt-6" title="Draft — pending approval">
          The final terms of travel will be published here once it has been approved by the service owner.
        </Alert>
        <p className="mt-6 text-[15px] text-muted">Tickets are valid only for the trip, bus and seat shown. Each ticket can be used once. Seats are held for 10 minutes while you pay; a booking exists only after payment is confirmed.</p>
      </div>
    </PublicShell>
  );
}
