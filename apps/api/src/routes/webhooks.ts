import express, { Router } from "express";
import { config } from "../lib/config.js";
import { query } from "../lib/db.js";
import { finalizePayment } from "../lib/payments.js";
import { isValidSignature } from "../lib/paystack.js";

export const webhooks = Router();

// Raw body is required to verify Paystack's HMAC signature (SEC-7).
webhooks.post("/paystack", express.raw({ type: "*/*", limit: "1mb" }), async (req, res) => {
  const raw = req.body as Buffer;
  const signature = req.header("x-paystack-signature");
  if (!Buffer.isBuffer(raw) || !isValidSignature(raw, signature, config.paystackSecret)) {
    console.warn("[webhook] rejected: invalid signature");
    return res.status(401).json({ error: { code: "invalid_signature", message: "Invalid signature." } });
  }
  let event: any;
  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(400).json({ error: { code: "bad_payload", message: "Invalid payload." } });
  }
  const data = event?.data ?? {};
  try {
    await query("INSERT INTO webhook_events (provider, event, reference) VALUES ('paystack', $1, $2)", [event.event ?? "unknown", data.reference ?? null]);
    if (event.event === "charge.success" && data.reference) {
      await finalizePayment(data.reference, { status: "success", amountPesewas: Number(data.amount), currency: data.currency });
    } else if (event.event === "charge.failed" && data.reference) {
      await finalizePayment(data.reference, { status: "failed", amountPesewas: Number(data.amount), currency: data.currency });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("[webhook] processing failed", (err as Error).message);
    res.status(500).json({ error: { code: "server_error", message: "Try again." } }); // Paystack retries
  }
});
