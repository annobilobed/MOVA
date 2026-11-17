import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const jwtSecret = required("JWT_SECRET", nodeEnv === "production" ? undefined : "dev-only-secret-change-me");
if (nodeEnv === "production" && jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
}

export const config = {
  nodeEnv,
  isProd: nodeEnv === "production",
  isTest: nodeEnv === "test",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL", "postgres://mova:mova@localhost:5432/mova"),
  redisUrl: required("REDIS_URL", "redis://localhost:6379"),
  jwtSecret,
  webOrigin: process.env.WEB_ORIGIN ?? process.env.RENDER_EXTERNAL_URL ?? "http://localhost:3000",
  paystackSecret: process.env.PAYSTACK_SECRET_KEY ?? "",
  seatLockSeconds: Number(process.env.SEAT_LOCK_SECONDS ?? 600),
  sessionDays: 7,
};

/** Test-mode payments are used whenever no Paystack key is configured. Never in production. */
export const paymentsInTestMode = () => !config.paystackSecret;
// A public demo may run test-mode payments only when explicitly allowed; real launches must set a Paystack key.
export const testPaymentsAllowedInProd = process.env.ALLOW_TEST_PAYMENTS === "true";
if (config.isProd && paymentsInTestMode() && !testPaymentsAllowedInProd) {
  throw new Error("PAYSTACK_SECRET_KEY is required in production (or set ALLOW_TEST_PAYMENTS=true for a demo deployment)");
}
