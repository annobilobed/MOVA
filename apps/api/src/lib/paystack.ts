import crypto from "node:crypto";
import { config } from "./config.js";

const BASE = "https://api.paystack.co";

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${config.paystackSecret}`, "Content-Type": "application/json", ...init.headers },
  });
  const body = (await res.json().catch(() => ({}))) as any;
  if (!res.ok || body.status === false) {
    throw new Error(`Paystack ${path} failed: ${res.status} ${body?.message ?? ""}`);
  }
  return body.data as T;
}

export function initializeTransaction(input: { email: string; amountPesewas: number; reference: string; callbackUrl: string }) {
  return call<{ authorization_url: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amountPesewas,
      currency: "GHS",
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: ["mobile_money", "card"],
    }),
  });
}

export function verifyTransaction(reference: string) {
  return call<{ status: string; amount: number; currency: string; reference: string; paid_at: string | null }>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

export function refundTransaction(reference: string) {
  return call<unknown>("/refund", { method: "POST", body: JSON.stringify({ transaction: reference }) });
}

/** Paystack signs the raw request body with HMAC-SHA512 using the secret key (SEC-7). */
export function signPayload(raw: Buffer | string, secret: string) {
  return crypto.createHmac("sha512", secret).update(raw).digest("hex");
}

export function isValidSignature(raw: Buffer, signature: string | undefined, secret: string) {
  if (!signature || !secret) return false;
  const expected = Buffer.from(signPayload(raw, secret), "hex");
  const given = Buffer.from(signature, "hex");
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}
