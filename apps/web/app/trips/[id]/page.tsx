import { PublicShell } from "@/components/public-shell";
import { TripBooking } from "./trip-booking";

export const metadata = { title: "Choose your seat" };

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PublicShell>
      <TripBooking tripId={id} />
    </PublicShell>
  );
}
