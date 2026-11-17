import { PublicShell } from "@/components/public-shell";
import { Alert } from "@/components/ui";

export const metadata = { title: "Privacy notice" };

export default function Page() {
  return (
    <PublicShell>
      <div className="container-page max-w-3xl py-12 sm:py-16">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Privacy notice</h1>
        <Alert tone="warning" className="mt-6" title="Draft — pending approval">
          The final privacy notice will be published here once it has been approved by the service owner.
        </Alert>
        <p className="mt-6 text-[15px] text-muted">MOVA collects your name, email, phone number and UCC student ID to manage your account and bookings. Your phone number and student ID are shared only with the operator of trips you book, for the passenger manifest. Personal data is handled in line with Ghana's Data Protection Act, 2012 (Act 843).</p>
      </div>
    </PublicShell>
  );
}
