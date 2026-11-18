"use client";

import { AlertTriangle, ArrowRight, Info, Loader2, RotateCw, WifiOff, XCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HoldTimer } from "@/components/countdown";
import { TicketCard } from "@/components/ticket-card";
import { Alert, Button, RouteLoader } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { buttonClass } from "@/lib/styles";
import type { Payment, Ticket } from "@/lib/types";

interface StatusResponse { payment: Payment; seatStillHeld: boolean; lockExpiresAt: string | null }

export function PaymentStatusView({ reference }: { reference: string }) {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [slow, setSlow] = useState(false);
  const started = useRef(Date.now());

  const check = useCallback(async () => {
    try {
      const res = await api<StatusResponse>(`/payments/${reference}`);
      setData(res);
      setError(null);
      if (res.payment.bookingId) {
        const t = await api<{ ticket: Ticket }>(`/tickets/${res.payment.bookingId}`);
        setTicket(t.ticket);
      }
      return res.payment.status;
    } catch (e) {
      setError(e as ApiError);
      return null;
    }
  }, [reference]);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const loop = async () => {
      const status = await check();
      if (stop) return;
      if (status === null || status === "pending") {
        if (Date.now() - started.current > 45000) setSlow(true);
        timer = setTimeout(loop, status === null ? 5000 : 2500);
      }
    };
    loop();
    const onOnline = () => check();
    window.addEventListener("online", onOnline);
    return () => {
      stop = true;
      clearTimeout(timer);
      window.removeEventListener("online", onOnline);
    };
  }, [check]);

  if (!data && error) {
    if (error.status === 401) {
      return (
        <Shell>
          <Alert tone="info" title="Please sign in to see this payment" action={<Link href={`/auth/sign-in?next=/payments/${reference}`} className={buttonClass()}>Sign in</Link>} />
        </Shell>
      );
    }
    return (
      <Shell>
        <Outcome tone="offline" Icon={WifiOff} title="Connection interrupted.">
          Your payment status may still be processing. We'll check your booking status as soon as you reconnect — please don't pay again.
          <div className="mt-6"><Button onClick={check}><RotateCw className="size-4" />Check again</Button></div>
        </Outcome>
      </Shell>
    );
  }
  if (!data) return <RouteLoader label="Checking your payment…" />;

  const { payment } = data;
  const topup = payment.kind === "luggage_topup";
  const backToTrip = topup && payment.bookingId ? `/tickets/${payment.bookingId}` : `/trips/${payment.tripId}`;

  return (
    <Shell>
      {error && <Alert tone="offline" className="mb-6" title="Connection interrupted.">Your payment status may still be processing. We'll keep checking.</Alert>}

      {payment.status === "pending" && (
        <Outcome tone="info" Icon={Loader2} spin title="We're confirming your payment.">
          Please keep this page open and don't try to pay again. This usually takes a few seconds.
          {slow && <p className="mt-3 font-medium text-fg">This is taking longer than usual. Mobile money approvals can take a minute — check your phone for a prompt.</p>}
        </Outcome>
      )}

      {payment.status === "successful" && (
        <div className="flex flex-col items-center text-center">
          <SuccessMark />
          <h1 className="mt-5 text-3xl font-extrabold">{topup ? "Luggage added to your ticket." : "Your booking is confirmed."}</h1>
          <p className="mt-2 text-muted">{topup ? "Your new luggage allowance is on your ticket. Show it to the driver when you board." : "Your ticket is ready. You'll also find it in My tickets."}</p>
          <div className="mt-8 w-full">{ticket ? <TicketCard ticket={ticket} reveal /> : <RouteLoader label="Loading your ticket…" />}</div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/tickets" className={buttonClass("primary", "lg")}>Go to My tickets <ArrowRight className="size-4.5" /></Link>
            <Link href="/trips" className={buttonClass("outline", "lg")}>Book another trip</Link>
          </div>
        </div>
      )}

      {payment.status === "failed" && (
        <Outcome tone="error" Icon={XCircle} title="Payment wasn't completed.">
          {topup ? (
            "You haven't been charged. Your ticket keeps its current luggage allowance, and you can try adding luggage again."
          ) : (
            <>
              You haven't been charged for this booking.{" "}
              {data.seatStillHeld ? "Your seat is still held, so you can try again." : "Your seat hold has ended, so you'll need to choose a seat again."}
            </>
          )}
          {!topup && data.seatStillHeld && data.lockExpiresAt && <HoldTimer expiresAt={data.lockExpiresAt} className="mt-5 text-left" />}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={backToTrip} className={buttonClass("primary", "lg")}>{topup ? "Back to my ticket" : data.seatStillHeld ? "Try payment again" : "Choose a seat"}</Link>
            <Link href="/help#payments" className={buttonClass("outline", "lg")}>Get help</Link>
          </div>
        </Outcome>
      )}

      {payment.status === "refunded" && (
        <Outcome tone="warning" Icon={Info} title="Your payment was refunded.">
          {payment.statusReason ?? "This payment was refunded."} Refunds usually reach your mobile money wallet or card within a few working days.
          <p className="tabular mt-3 text-sm">Reference: {payment.reference}</p>
          <div className="mt-6"><Link href="/trips" className={buttonClass("primary", "lg")}>Find another seat</Link></div>
        </Outcome>
      )}

      {payment.status === "flagged" && (
        <Outcome tone="warning" Icon={AlertTriangle} title="We're reviewing this payment.">
          No ticket has been issued yet. Our team will check it and contact you. Please don't pay again.
          <p className="tabular mt-3 text-sm">Reference: {payment.reference}</p>
          <div className="mt-6"><Link href="/help#contact" className={buttonClass("primary", "lg")}>Contact support</Link></div>
        </Outcome>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="container-page max-w-2xl py-12 sm:py-16">{children}</div>;
}

const toneCls = {
  info: "bg-info-bg text-accent-fg",
  error: "bg-danger-bg text-danger",
  warning: "bg-warning-bg text-warning",
  offline: "bg-raised text-muted",
} as const;

function Outcome({ tone, Icon, spin, title, children }: { tone: keyof typeof toneCls; Icon: typeof Info; spin?: boolean; title: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center text-center">
      <span className={`grid size-16 place-items-center rounded-full ${toneCls[tone]}`}>
        <Icon aria-hidden className={`size-8 ${spin ? "animate-spin" : ""}`} />
      </span>
      <h1 className="mt-5 text-3xl font-extrabold">{title}</h1>
      <div className="mt-3 max-w-md text-[15px] text-muted">{children}</div>
    </div>
  );
}

function SuccessMark() {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className="grid size-20 place-items-center rounded-full bg-success-bg text-success"
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg viewBox="0 0 24 24" className="size-10" aria-hidden>
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </motion.span>
  );
}
