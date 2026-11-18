# MOVA — Move smart. Travel easy.

Student bus booking for the University of Cape Coast: find a trip, pick an exact seat (held for 10 minutes by the server), pay in cedis with Paystack, and board with a single-use QR ticket. Drivers scan tickets; operators manage buses, trips and printable passenger manifests; super admins manage accounts.

Built from `docs/MOVA-spec.md` (the design and implementation specification).

## What's in the repo

| Path | What |
|---|---|
| `apps/api` | Node.js + Express + TypeScript API, PostgreSQL 16, Redis 7 (seat locks), Paystack |
| `apps/web` | Next.js 15 + Tailwind CSS 4 web app: public site, student, driver, operator and admin areas |
| `docs/` | The source specification |
| `PRODUCT.md` | Product record (users, rules, constraints) |
| `.impeccable/` | Design direction and surface brief used to build the UI |

## Run it locally

Requirements: Node 22+, pnpm 10, PostgreSQL 16 and Redis 7 (or Docker).

```bash
pnpm install
docker compose up -d            # or use local Postgres + Redis
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm db:migrate
pnpm db:seed                    # demo data, clearly labelled "Demo data"
pnpm dev                        # API on :4000, web on :3000
```

The web app proxies `/api/*` to the API, so the session cookie stays httpOnly and same-origin.

### Demo accounts (seed data only)

Password for all: `MovaDemo2026!`

| Role | Email |
|---|---|
| Student | `student@demo.mova` |
| Driver (Accra/Takoradi/Ho bus + campus shuttle) | `driver@demo.mova` |
| Driver (Kumasi/Tamale bus) | `driver2@demo.mova` |
| Operator — MOVA Demo Transport | `operator@demo.mova` |
| Operator — Coastal Demo Coaches | `operator2@demo.mova` |
| Super admin | `admin@demo.mova` |

All seed companies, trips, fares and plates are illustrative and flagged `is_demo`; the UI labels them. Luggage: every ticket includes 25 kg (3 kg margin). Extra bags are GH₵ 15 each (placeholder in `apps/api/src/lib/money.ts`; confirm with the operator). Students can add luggage after booking, until two hours after departure, from My tickets, paying only the difference. Drivers see the luggage allowance when they scan.

## Deploy a working demo (Render, free)

`render.yaml` sets up everything: one web service (website + API), a PostgreSQL database and a Redis store.

1. Create a free account at https://render.com and connect your GitHub.
2. Open https://render.com/deploy?repo=https://github.com/annobilobed/MOVA and click **Apply**.
3. Leave `PAYSTACK_SECRET_KEY` empty for test-mode payments, or paste a Paystack test key.

The first deploy takes about 5–10 minutes. Free services sleep after 15 minutes idle (first visit then takes ~1 minute) and Render's free database expires after 30 days.

## Payments

- **Test mode** (no `PAYSTACK_SECRET_KEY`): checkout opens a clearly labelled MOVA test page where you choose success, failure or a wrong amount. No money moves. The API refuses to start in production without a key.
- **Paystack mode**: set `PAYSTACK_SECRET_KEY` (test or live). Point the Paystack webhook at `https://<api-host>/api/webhooks/paystack`. Signatures are verified against the raw body; duplicate webhooks never create duplicate bookings.

Business rules enforced on the server: amounts calculated server-side (GHS, sent to Paystack in pesewas); one active booking per trip and seat (unique index); a booking only after confirmed payment; if the seat is gone when payment completes, the payment is refunded; mismatched amounts are flagged for review; drivers validate only tickets for their assigned bus, and each ticket only once; operators see only their own company's data.

## Tests

```bash
pnpm --filter @mova/api test     # 18 API tests against a real Postgres + Redis (mova_test DB)
```

They cover the spec's acceptance criteria: registration/login/duplicate email, trip discovery and filters, seat layout vs capacity, 10-minute locks, server-side amounts and tampering, double booking → refund, webhook signature and idempotency, ticket validation (valid / repeat / wrong bus), operator scoping, role security and audited role changes.

## Not built yet (shown honestly in the UI)

Planned in the source spec and not presented as available: password reset, booking cancellation, SMS notifications (Arkesel), live GPS tracking, and the Flutter mobile app. Support contact details, privacy notice and terms are placeholders awaiting approval.
