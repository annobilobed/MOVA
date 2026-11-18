# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Confirmed by the user: full web app built from scratch (Flutter mobile app deferred).

- Web: Next.js 15 (App Router) + Tailwind CSS, Framer Motion; React Three Fiber only for the landing hero, lazy-loaded with a static fallback.
- API: Node.js + Express + TypeScript.
- Data: PostgreSQL 16 (persistent data), Redis 7 (ten-minute seat locks).
- Payments: Paystack Ghana (test mode until live keys exist).
- Hosting target from the source spec: Render or DigitalOcean.

## Users

- **Students at the University of Cape Coast (UCC)** — find a trip home for vacation or a campus shuttle, reserve a specific seat, pay by mobile money or card, and show a QR ticket when boarding. Mostly on phones, often on slow or unreliable mobile data.
- **Drivers** — see only the trips assigned to them and validate tickets at the bus door, quickly, outdoors, often in bright light.
- **Operator admins** — transport company staff at a desk: create buses and trips, view and print passenger manifests.
- **Super admins** — manage accounts and roles through a restricted area.

## Product Purpose

MOVA (proposed brand name for the UCC Student Transit System) replaces queueing and cash for student bus travel with: discover a trip → pick a seat → pay digitally → board with a verifiable QR ticket. Success is a booking journey students trust end to end — fares, seat holds, payment status and tickets are always accurate — and operators who can run trips and manifests without paper chaos.

## Positioning

Seat-specific reservation with a server-held ten-minute lock, Paystack Ghana payment (mobile money and card in GHS), and a single-use QR ticket validated by the driver of the assigned bus — built specifically for UCC students rather than a general bus marketplace.

## Operating Context

- Trip types: inter-regional vacation travel and campus shuttles.
- Demo operating origin: Cape Coast (UCC). Development seed routes to Accra, Kumasi, Takoradi, Tamale, Ho plus campus shuttles — **all demo data, labelled as such**.
- Default bus layout: 49 seats (11 rows of 2 + aisle + 2, then a back row of 5); every bus uses its own configured capacity/layout.
- Boarding: driver scans the student's QR on a phone at the bus door.
- Manifests are printed by operators before departure.

## Capabilities and Constraints

- Registration: name, email (any domain), phone, password, UCC student ID. Roles: student, driver, operator admin, super admin.
- One active booking per trip and seat. Seat lock lasts 10 minutes, created by the server; countdown shows only after the server confirms the lock.
- Booking is created only after Paystack confirms payment; webhook signatures are verified; duplicate webhooks never create duplicate bookings. If a seat is gone when payment completes, the student is refunded.
- All amounts in Ghana cedis (GHS); Paystack receives pesewas (GHS × 100). The server calculates every amount, including luggage fees.
- Payment states: Pending, Successful, Failed, Refunded, Needs review (flagged), plus timeout/offline.
- Drivers validate only tickets for their assigned bus; a ticket is accepted once.
- Operators see only their own company's data (enforced by the API).
- Past trips cannot be created or booked; fully booked or departed trips offer no booking action.
- Auth: bcrypt passwords, signed sessions with 7-day expiry, httpOnly cookies on the web (never localStorage), role checks on every protected route, rate limits, parameterised queries, safe error messages, HTTPS in production, secrets only in environment variables.
- Out of scope for release 1: multi-operator marketplace, student-initiated refunds, non-Ghana payment methods, loyalty points, group bookings, multi-city route planning.
- Planned, not yet built — must not be presented as available: password reset, booking cancellation, SMS notifications (Arkesel), live GPS bus tracking.
- Performance target: trip lists and seat maps load in under 3 seconds on 3G.
- Themes: light and dark in the first release (user decision).

## Brand Commitments

- Name: MOVA. Tagline: "MOVE SMART. TRAVEL EASY." (Final name and UCC branding approval still to be confirmed.)
- Personality: optimistic, energetic, modern, dependable, distinctly digital — not a generic bus-company site, not a crowded student portal.
- Voice: clear, calm, encouraging; payment and security messages direct and unambiguous. Landing headline: "Your journey. Your seat. Your freedom." Search CTA: "Find available trips".
- Redesign (user decision, 18 Nov 2026): the spec's palette, fonts and the first visual direction are released; the visual world is open and chosen by Claude at its discretion. Binding: a 3D landing page with a bus moving along a road; an animated colour gradient whose background colour changes slowly over time; an interactive, beautiful UI/UX; a powerful modern frontend framework.
- 3D and motion as a signature layer on the landing page and selected moments only; booking, payment, ticket and operator workflows stay fast and readable.

## Evidence on Hand

- Source spec: `docs/MOVA-spec.md` (and the original `docs/MOVA-spec.docx`), derived from "UCC Student Transit System — Requirements Specification v1.0 (Nov 2026)".
- No logo, photography, 3D model, testimonials, operator names, real routes, fares or bus plates exist yet. Do not fabricate them in production UI; demo data must be labelled.

## Product Principles

1. Clarity before decoration — trip details, prices, seat status and the next action are always easy to read.
2. Trust at every step — show confirmation and tickets only when the server confirms them; never optimistically claim a payment or booking.
3. Mobile-first and resilient — works on small phones and bad connections, with safe retries that never double-charge.
4. Each role sees only what it needs.
5. Motion and 3D enhance; they never stand between a student and a booking.

## Accessibility & Inclusion

WCAG 2.1 AA. Seat and payment states never rely on colour alone (text labels required, NFR-6). QR ticket details also available as text. Keyboard reachable controls with visible focus, labelled inputs, reduced-motion support, readable sizes on small phones.
