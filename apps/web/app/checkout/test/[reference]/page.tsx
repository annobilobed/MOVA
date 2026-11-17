import { PublicShell } from "@/components/public-shell";
import { TestCheckout } from "./test-checkout";

export const metadata = { title: "Test checkout" };

export default async function Page({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return (
    <PublicShell>
      <TestCheckout reference={reference} />
    </PublicShell>
  );
}
