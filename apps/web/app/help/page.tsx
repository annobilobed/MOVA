import { Mail } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Alert } from "@/components/ui";

export const metadata = { title: "Help" };

const sections: { id: string; title: string; items: [string, string][] }[] = [
  {
    id: "booking",
    title: "Booking a seat",
    items: [
      ["How do I book?", "Search for a trip, open it, and tap a seat on the bus map. The seat is held for you for 10 minutes. Choose your luggage, then continue to payment."],
      ["Why is a seat marked “Temporarily unavailable”?", "Another student is holding it while they pay. If they don't finish within 10 minutes, it becomes available again."],
      ["Can I book for a friend or a group?", "Not yet. Each student books their own seat with their own account."],
      ["Can I cancel or change a booking?", "Self-service cancellation isn't available yet. Contact support with your booking reference."],
    ],
  },
  {
    id: "payments",
    title: "Payments",
    items: [
      ["How can I pay?", "Through Paystack in Ghana cedis, using mobile money or card where your payment method supports it."],
      ["My payment says Pending. What should I do?", "Keep the payment page open and don't pay again. Mobile money approvals can take a minute — check your phone for the approval prompt."],
      ["What does “Needs review” mean?", "Something about the payment didn't match the booking, so no ticket has been issued. Our team will check it. Contact support with your reference."],
      ["When do I get a refund?", "If your seat was taken before your payment completed, it is refunded automatically. Refunds usually reach you within a few working days."],
    ],
  },
  {
    id: "tickets",
    title: "Tickets and boarding",
    items: [
      ["Where is my ticket?", "In My tickets, as soon as your payment is confirmed. The QR code and all trip details are on it."],
      ["Do I need to print it?", "No. Show the QR code on your phone. Turn up your screen brightness if the driver has trouble scanning."],
      ["Can I use my ticket twice?", "No. Each ticket works once, only on the bus it was booked for."],
    ],
  },
];

export default function HelpPage() {
  return (
    <PublicShell>
      <div className="container-page max-w-3xl py-12 sm:py-16">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Help and FAQs</h1>
        <p className="mt-3 text-lg text-muted">Answers about booking, payments and boarding.</p>
        <nav aria-label="Help topics" className="mt-6 flex flex-wrap gap-2">
          {[...sections, { id: "contact", title: "Contact support" }].map((s) => (
            <a key={s.id} href={`#${s.id}`} className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold hover:border-accent hover:text-accent-fg">{s.title}</a>
          ))}
        </nav>
        {sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-12 scroll-mt-24">
            <h2 id={`${s.id}-h`} className="text-2xl font-bold">{s.title}</h2>
            <dl className="mt-4 divide-y divide-border border-y border-border">
              {s.items.map(([q, a]) => (
                <div key={q} className="py-4">
                  <dt className="font-semibold">{q}</dt>
                  <dd className="mt-1 text-[15px] text-muted">{a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <section id="contact" aria-labelledby="contact-h" className="mt-12 scroll-mt-24">
          <h2 id="contact-h" className="text-2xl font-bold">Contact support</h2>
          <Alert tone="info" className="mt-4" title="Support contact details are being finalised">
            <span className="inline-flex items-center gap-1.5"><Mail aria-hidden className="size-4" />The support email and phone line will be published here before launch.</span> Have your booking reference ready when you get in touch.
          </Alert>
        </section>
      </div>
    </PublicShell>
  );
}
