import { PublicShell } from "@/components/public-shell";
import { PaymentStatusView } from "./payment-status";

export const metadata = { title: "Payment status" };

export default async function Page({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return (
    <PublicShell>
      <PaymentStatusView reference={reference} />
    </PublicShell>
  );
}
