"use client";

import clsx from "clsx";
import jsQR from "jsqr";
import { AlertTriangle, Ban, Camera, CameraOff, CheckCircle2, Keyboard, WifiOff, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoadState } from "@/components/load-state";
import { Button, Card, SelectField, inputClass } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatTime } from "@/lib/format";
import type { Trip } from "@/lib/types";
import { useApi } from "@/lib/use-api";

type ResultCode = "valid" | "rechecked" | "already_used" | "wrong_bus" | "invalid" | "not_your_trip" | "network";
interface ScanResult { result: ResultCode; message: string; passenger?: { name: string; studentId?: string | null; seat: string; route: string; luggage?: string } }

const RESULT: Record<ResultCode, { title: string; cls: string; Icon: typeof CheckCircle2; vibrate: number[] }> = {
  valid: { title: "Valid ticket", cls: "bg-[#0e7c5a] text-white", Icon: CheckCircle2, vibrate: [80] },
  rechecked: { title: "Scanned before", cls: "bg-[#2f23c9] text-white", Icon: AlertTriangle, vibrate: [60, 60, 60] },
  already_used: { title: "Already used", cls: "bg-[#8a5a00] text-white", Icon: Ban, vibrate: [200, 100, 200] },
  wrong_bus: { title: "Wrong bus", cls: "bg-[#8a5a00] text-white", Icon: AlertTriangle, vibrate: [200, 100, 200] },
  invalid: { title: "Invalid ticket", cls: "bg-[#c4283b] text-white", Icon: XCircle, vibrate: [400] },
  not_your_trip: { title: "Not your trip", cls: "bg-[#c4283b] text-white", Icon: XCircle, vibrate: [400] },
  network: { title: "Network unavailable", cls: "bg-ink text-white", Icon: WifiOff, vibrate: [400] },
};

export function Scanner() {
  const params = useSearchParams();
  const trips = useApi<{ trips: Trip[] }>("/driver/trips");
  const [tripId, setTripId] = useState(params.get("trip") ?? "");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [manual, setManual] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busyRef = useRef(false);
  const lastCode = useRef<{ code: string; at: number } | null>(null);

  useEffect(() => {
    if (!tripId && trips.data?.trips[0]) setTripId(trips.data.trips[0].id);
  }, [trips.data, tripId]);

  const validate = useCallback(
    async (code: string) => {
      if (busyRef.current || !tripId) return;
      busyRef.current = true;
      setChecking(true);
      try {
        const res = await api<ScanResult>("/driver/validate", { method: "POST", json: { code, tripId } }).catch((e: ApiError) => {
          if (e.status === 403) return { result: "not_your_trip" as const, message: "This trip isn't assigned to you." };
          throw e;
        });
        setResult(res);
        navigator.vibrate?.(RESULT[res.result].vibrate);
      } catch {
        setResult({ result: "network", message: "Couldn't reach MOVA. Check your connection and scan again. The passenger has not been marked as boarded." });
      } finally {
        setChecking(false);
      }
    },
    [tripId],
  );

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (e) {
      const name = (e as DOMException)?.name;
      setCameraError(
        name === "NotAllowedError"
          ? "Camera permission was blocked. Allow camera access for this site in your browser settings, or type the ticket code below."
          : "No camera is available on this device. Type the ticket code below instead.",
      );
    }
  }

  useEffect(() => stopCamera, [stopCamera]);

  // Scan loop: read frames while the camera is on and no result is showing.
  useEffect(() => {
    if (!cameraOn) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (v && c && v.readyState >= 2 && !busyRef.current) {
        const w = 480;
        const h = Math.round((v.videoHeight / v.videoWidth) * w) || 360;
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(v, 0, 0, w, h);
          const found = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" });
          const now = Date.now();
          if (found?.data && !(lastCode.current?.code === found.data && now - lastCode.current.at < 4000)) {
            lastCode.current = { code: found.data, at: now };
            validate(found.data);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cameraOn, validate]);

  const dismiss = () => {
    setResult(null);
    busyRef.current = false;
  };

  const trip = trips.data?.trips.find((t) => t.id === tripId);

  return (
    <div className="container-page max-w-xl py-6 sm:py-10">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Scan tickets</h1>
      <LoadState loading={trips.loading} error={trips.error} reload={trips.reload} label="Loading your trips…" />
      {trips.data && !trips.data.trips.length && <p className="mt-4 text-muted">You have no assigned trips to scan for.</p>}
      {trips.data && trips.data.trips.length > 0 && (
        <>
          <SelectField label="Boarding for" className="mt-5" value={tripId} onChange={(e) => setTripId(e.target.value)}>
            {trips.data.trips.map((t) => (
              <option key={t.id} value={t.id}>{formatTime(t.departureAt)} · {t.origin} → {t.destination} · {t.bus.plate}</option>
            ))}
          </SelectField>

          <div className="relative mt-5 aspect-square w-full overflow-hidden rounded-[28px] bg-ink">
            {cameraOn ? (
              <>
                <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
                <div aria-hidden className="pointer-events-none absolute inset-[14%] rounded-3xl border-4 border-white/90 shadow-[0_0_0_999px_rgba(13,14,34,0.55)]" />
                <p className="absolute inset-x-0 bottom-5 text-center text-sm font-semibold text-white">{checking ? "Checking ticket…" : "Point the camera at the passenger's QR code"}</p>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-white">
                <Camera aria-hidden className="size-12 text-aqua" />
                <p className="max-w-xs text-white/80">Use your phone's back camera. In bright sun, tilt the passenger's screen to reduce glare.</p>
                <Button size="lg" variant="light" onClick={startCamera}>Start camera</Button>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          {cameraOn && (
            <Button variant="outline" className="mt-3 w-full" onClick={stopCamera}><CameraOff className="size-4" />Stop camera</Button>
          )}
          {cameraError && <p role="alert" className="mt-3 text-[15px] font-medium text-danger">{cameraError}</p>}

          <Card className="mt-6 p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manual.trim()) validate(manual.trim());
              }}
            >
              <label htmlFor="manual-code" className="flex items-center gap-2 text-sm font-semibold"><Keyboard aria-hidden className="size-4" /> Enter ticket code instead</label>
              <div className="mt-2 flex gap-2">
                <input id="manual-code" value={manual} onChange={(e) => setManual(e.target.value)} className={inputClass()} placeholder="MOVA1:…" autoComplete="off" autoCapitalize="off" spellCheck={false} />
                <Button type="submit" loading={checking}>Check</Button>
              </div>
            </form>
          </Card>
          {trip && <p className="mt-4 text-center text-sm text-muted">Only tickets for {trip.bus.plate} on this trip are accepted. Each ticket works once.</p>}
        </>
      )}

      {result && <ResultScreen result={result} onDismiss={() => { dismiss(); setManual(""); }} />}
    </div>
  );
}

function ResultScreen({ result, onDismiss }: { result: ScanResult; onDismiss: () => void }) {
  const r = RESULT[result.result];
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => btn.current?.focus(), []);
  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="scan-title" aria-describedby="scan-desc" className={clsx("fixed inset-0 z-50 flex flex-col items-center justify-center p-8 text-center", r.cls)}>
      <r.Icon aria-hidden className="size-28" strokeWidth={1.6} />
      <h2 id="scan-title" className="mt-6 font-display text-5xl font-extrabold">{r.title}</h2>
      <p id="scan-desc" className="mt-3 max-w-sm text-lg text-white/90">{result.message}</p>
      {result.passenger && (
        <div className="mt-8 w-full max-w-sm rounded-2xl bg-white/15 px-6 py-4 text-left break-words">
          <p className="text-sm text-white/80">Passenger</p>
          <p className="text-xl font-bold">{result.passenger.name}</p>
          {result.passenger.studentId && <p className="tabular text-sm text-white/85">Student ID {result.passenger.studentId} — check it matches their UCC ID card</p>}
          <p className="tabular mt-1 text-lg">Seat {result.passenger.seat} · {result.passenger.route}</p>
          {result.passenger.luggage && (
            <p className="mt-3 border-t border-white/25 pt-3 text-sm text-white/80">
              Luggage paid for
              <span className="mt-0.5 block text-2xl font-bold text-white">{result.passenger.luggage}</span>
              <span className="block text-white/80">Up to 3 kg over is fine. More than this? The student adds luggage in My tickets, then scan again.</span>
            </p>
          )}
        </div>
      )}
      <button ref={btn} onClick={onDismiss} className="mt-10 h-14 w-full max-w-xs rounded-2xl bg-white text-lg font-bold text-ink">
        Scan next ticket
      </button>
    </div>
  );
}
