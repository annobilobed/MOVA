import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { loadUser } from "./lib/auth.js";
import { config, paymentsInTestMode } from "./lib/config.js";
import { errorHandler } from "./lib/errors.js";
import { admin } from "./routes/admin.js";
import { auth } from "./routes/auth.js";
import { driver } from "./routes/driver.js";
import { operator } from "./routes/operator.js";
import { payments } from "./routes/payments.js";
import { tickets } from "./routes/tickets.js";
import { trips } from "./routes/trips.js";
import { webhooks } from "./routes/webhooks.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet());

  // Webhooks need the raw body, so they mount before the JSON parser.
  app.use("/api/webhooks", webhooks);

  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: config.isTest ? 10000 : 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: { code: "rate_limited", message: "You're going a bit fast. Please wait a moment and try again." } },
    }),
  );
  app.use(loadUser);

  app.get("/api/health", (_req, res) => res.json({ ok: true, paymentsTestMode: paymentsInTestMode() }));
  app.use("/api/auth", auth);
  app.use("/api/trips", trips);
  app.use("/api/payments", payments);
  app.use("/api/tickets", tickets);
  app.use("/api/driver", driver);
  app.use("/api/operator", operator);
  app.use("/api/admin", admin);
  app.use("/api", (_req, res) => res.status(404).json({ error: { code: "not_found", message: "Not found." } }));
  app.use(errorHandler);
  return app;
}
