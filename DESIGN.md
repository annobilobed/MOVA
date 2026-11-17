---
name: MOVA
description: Seat-specific student bus booking for UCC, from search to QR ticket.
colors:
  electric: "#493bff"
  electric-600: "#3a2df0"
  electric-700: "#2f23c9"
  violet: "#8655ff"
  aqua: "#12d6c5"
  aqua-ink: "#0a7f75"
  coral: "#ff6b79"
  coral-ink: "#c4283b"
  sun: "#ffd166"
  sun-ink: "#8a5a00"
  ink: "#171936"
  slate: "#626782"
  lavender-mist: "#f5f5ff"
  line: "#e5e7f2"
  ground: "#f5f5ff"
  surface: "#ffffff"
  raised: "#ffffff"
  fg: "#171936"
  muted: "#565b78"
  border: "#e5e7f2"
  accent: "#493bff"
  accent-fg: "#3a2df0"
  route: "#0a7f75"
  success: "#0a7f75"
  success-bg: "#e3faf7"
  warning: "#8a5a00"
  warning-bg: "#fff4d9"
  danger: "#c4283b"
  danger-bg: "#ffe9ec"
  info-bg: "#ecebff"
  dark-ground: "#0d0e22"
  dark-surface: "#171936"
  dark-raised: "#1f2246"
  dark-fg: "#f1f1ff"
  dark-muted: "#a6aacb"
  dark-border: "#2c2f5a"
  dark-accent: "#6a5fff"
  dark-accent-fg: "#a49dff"
  dark-route: "#3fe6d7"
  dark-success-bg: "#0e2f33"
  dark-warning-bg: "#3a2e12"
  dark-danger: "#ff8b96"
  dark-danger-bg: "#3d1720"
  dark-info-bg: "#231f5c"
typography:
  display:
    fontFamily: "Plus Jakarta Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5.6vw, 4.25rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Plus Jakarta Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: "-0.02em"
  numeral:
    fontFamily: "Plus Jakarta Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.65rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "\"tnum\""
  body:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"cv11\", \"ss01\""
  body-lead:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  seat: "10px"
  control: "12px"
  tile: "16px"
  card: "18px"
  panel: "22px"
  ticket: "24px"
  feature: "28px"
  frame: "32px"
  pill: "9999px"
spacing:
  page-gutter: "clamp(1rem, 4vw, 2rem)"
  container: "1200px"
  card-pad: "20px"
  grid-gap: "16px"
  section: "80px"
  section-lg: "112px"
components:
  button-primary:
    backgroundColor: "{colors.electric}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.electric-600}"
  button-primary-active:
    backgroundColor: "{colors.electric-700}"
  button-secondary:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.control}"
    height: "44px"
  button-outline-hover:
    textColor: "{colors.accent-fg}"
  button-light:
    backgroundColor: "#ffffff"
    textColor: "{colors.electric}"
    rounded: "{rounded.control}"
    height: "52px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "48px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "20px"
  badge-demo:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.sun-ink}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  seat-available:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.seat}"
  seat-selected:
    backgroundColor: "{colors.electric}"
    textColor: "#ffffff"
    rounded: "{rounded.seat}"
  nav-item-active:
    backgroundColor: "{colors.info-bg}"
    textColor: "{colors.accent-fg}"
    rounded: "{rounded.control}"
---

# Design System: MOVA

## Overview

**Creative North Star: "The Route Line"**

MOVA plays the mobility category straight, at the craft level of the best ride-hailing, coach-booking and neobank apps: search first, product at work, nothing ornamental standing between a student and a seat. The world is a cool Lavender Mist ground with Ink text, an Electric-to-Violet field that owns the hero and the ticket header, and one aqua route line that runs through everything a traveller touches. Coral and Sun appear only as small, meaningful highlights: scarcity, holds about to lapse, demo data.

Density is moderate and phone-first. Cards are solid white on the lavender ground, softly lifted, with generous 18px corners; controls are 44 to 52px tall. Glass exists in exactly one place, the floating chips over the hero coach. The dark theme mirrors the light one on an Ink-navy ground rather than inverting it: same roles, brighter route and accent so they hold contrast.

The system is honest by construction. Every figure shown comes from the API, seed records wear a "Demo data" badge, illustrations say "Illustration", and features that are not built (GPS, SMS, cancellation) are never drawn.

**Key Characteristics:**
- Lavender Mist ground, white solid cards, Ink text; Electric is the single action colour.
- An aqua route line (hollow origin dot, dashed track, solid destination dot) links hero, trip cards, trip-type panels, how-it-works steps, seat-hold timer and ticket.
- Plus Jakarta Sans ExtraBold for headlines, times, fares and seat numbers; Inter for everything read.
- Tabular numerals on every time, fare, countdown, seat and count.
- Soft ink-tinted shadows; electric-tinted lift on hover; one deep float shadow for panels that sit above a field.
- Expo ease-out motion, short and purposeful, fully disabled under reduced motion.

## Colors

A cool, saturated-but-controlled palette: one electric action blue, one aqua for routes and availability, two warm highlights kept small, on a faintly lavender neutral.

### Primary
- **Electric** (`electric`): the one action colour. Primary buttons, the selected seat, active how-it-works step, focus outline, caret, skip link. Hover steps to Electric 600, press to Electric 700. In dark mode actions use the brighter Dark Accent.
- **Electric to Violet field** (`electric` to `violet`, 120deg): owns the landing hero, the ticket header and the logo mark. A field, not a fill for ordinary components. Dark mode deepens it to #2b20c4 to #5a2fd6.

### Secondary
- **Aqua** (`aqua`): routes and availability. Route dots and dashed tracks, available-seat outlines, the hold-timer progress, the hero ribbon, the QR chip. On light grounds, aqua used as text or icon steps down to **Aqua Ink** (`aqua-ink`, exposed semantically as `route` and `success`) for contrast; dark mode uses the bright `dark-route`.

### Tertiary
- **Coral** (`coral`, text form `coral-ink`): scarcity and unavailability only. Five or fewer seats left, temporarily held seats (dashed coral outline on a 15% coral tint), the hero destination pin.
- **Sun** (`sun`, text form `sun-ink`): the Demo data badge (25% tint, 60% ring) and the last two minutes of a seat hold, when the route line turns from aqua to sun.

### Neutral
- **Lavender Mist** (`ground`): page ground. Never pure white, so white cards read as solid objects.
- **Surface White** (`surface`, `raised`): cards, panels, header on scroll, inputs.
- **Ink** (`fg`, `ink`): body and heading text; secondary button fill; the dark trip-type panel; dark-mode surface.
- **Muted Slate** (`muted`): supporting text, labels, inactive nav. (`slate` is the brand raw value; text uses the slightly darker semantic `muted` for contrast.)
- **Hairline** (`border`, `line`): 1px card borders, dividers, dashed seat-map rules.
- **Tint backgrounds** (`info-bg`, `success-bg`, `warning-bg`, `danger-bg`): badges, alerts, active nav item, hold timer state.

### Named Rules
**The Semantic Name Rule.** Components use the semantic names (`ground`, `surface`, `fg`, `muted`, `border`, `accent`, `route`, status pairs) so light and dark resolve from one class. Raw brand values (`electric`, `aqua`, `coral`, `sun`) appear only where the brand role itself is meant: seats, route dots, the hero field, badges.

**The Aqua Means Route Rule.** Aqua marks where you go and what is open: routes, stops, available seats, hold remaining, ticket readiness. It is never a generic decoration or a second button colour.

**The Small Warmth Rule.** Coral and Sun are signals, never fields. They occupy a badge, a dot, a seat or a line, never a section background.

## Typography

**Display Font:** Plus Jakarta Sans Variable (with ui-sans-serif, system-ui)
**Body Font:** Inter Variable (with ui-sans-serif, system-ui), stylistic sets cv11 and ss01

**Character:** A wide, friendly geometric grotesque at ExtraBold for anything that should be scanned at a glance, set tight (-0.02em) and balanced; a neutral, highly legible Inter for anything read. Both self-hosted via Fontsource.

### Hierarchy
- **Display** (800, clamp 2.4rem to 4.25rem, 1.04): the landing hero headline only.
- **Headline** (800, 1.875rem mobile to 2.6rem, 1.1): section headings on the landing; app page titles use 1.5rem to 1.875rem at 800.
- **Title** (700, 1.125rem to 1.25rem, snug): trip destinations, step titles, FAQ questions, route stops, card headings.
- **Numeral** (800, 1.5rem to 1.65rem, leading 1, tabular): departure times, fares, seat numbers on tickets, hold countdown. Numbers are the headline of an operational card.
- **Body** (400, 15px, 1.5): app copy, descriptions, alerts. Lead paragraphs step to 1.125rem. Long answers cap at `max-w-prose`.
- **Label** (600, 14px; 12px for badges and ticket field labels): form labels, badges, nav, button text (buttons run 14 to 16px semibold).

### Named Rules
**The Tabular Rule.** Every time, fare, count, countdown, seat number and booking reference uses tabular numerals (`.tabular`). Columns of numbers must not jitter.

**The Sentence Case Rule.** Headings, buttons and labels are sentence case. Uppercase is reserved for data-table column headers in operator and admin tables.

## Layout

A single 1200px page container with a fluid gutter (clamp 1rem to 2rem). Landing sections breathe at 80px vertical padding (112px for how-it-works on wide screens) and alternate ground and surface bands, separated by hairline borders rather than shadows. The hero is a two-column grid at `lg` (copy and search left, coach right), collapsing to a single column with the search panel at full width on phones.

App screens use a 260px left sidebar from `lg` up and a fixed bottom tab bar (max five items, safe-area padded) below it, with a sticky translucent top bar on mobile. Content grids use 16px gaps; cards pad 20px; trip cards stack vertically on phones and split into body plus a fare column at `sm`, divided by a hairline. Breakpoints are Tailwind defaults (sm 640, md 768, lg 1024).

## Elevation & Depth

A hybrid: depth comes first from tone (white surfaces on Lavender Mist, hairline borders), then from soft, ink-tinted shadows. Shadows are diffuse and negative-spread so they read as lift, not outline. There are no hard offset shadows.

### Shadow Vocabulary
- **Soft** (`0 1px 2px rgb(23 25 54 / 0.06), 0 8px 24px -12px rgb(23 25 54 / 0.18)`): resting cards, primary buttons, the active how-it-works step.
- **Lift** (`0 2px 4px rgb(23 25 54 / 0.06), 0 18px 40px -18px rgb(73 59 255 / 0.35)`): hover on trip cards and available seats. Electric-tinted, so interactive lift reads as brand.
- **Float** (`0 24px 60px -24px rgb(23 25 54 / 0.45)`): panels that sit above a field or the page: hero search panel, ticket, phone frame, hero glass chips.

### Named Rules
**The Earned Lift Rule.** Rest is Soft; Lift appears only in response to hover on something you can act on; Float is reserved for objects that sit above a coloured field or carry the transaction (search, ticket).

**The One Glass Rule.** Backdrop blur appears on the floating hero chips (white 14%, white 25% border) and on sticky bars over scrolling content. Nowhere else.

## Shapes

Generously rounded, solid forms. Corners scale with object size: seats 10px, controls 12px, small tiles and alerts 16px, cards 18px, the hero search panel 22px, the ticket 24px, the seat-map bus outline and trip-type panels 28px, the CTA band and phone frame 32px. Badges and nav pills are fully round. Borders are 1px hairlines; 2px is reserved for seat outlines, the seat-map bus body and route dots. Dashed rules mean "route" or "tear line": the dashed aqua track, the dashed front/back rules of the seat map, the perforation on the ticket with ground-coloured notches.

## Components

### Buttons
Confident, compact, never shouting.
- **Shape:** gently rounded (12px), semibold, icon gap 6 to 8px, heights 36 / 44 / 52px (sm / md / lg).
- **Primary:** Electric fill, white text, Soft shadow; hover Electric 600, press Electric 700 and scale 0.98.
- **Secondary:** Ink fill (white in dark mode).
- **Outline:** surface fill, hairline border; hover turns border Accent and text Accent FG.
- **Text:** Accent FG text, Info tint on hover.
- **Danger:** Danger fill.
- **Light / Ghost-light:** for use on the Electric field only: white fill with Electric text, or a 50% white outline.
- **Loading / Disabled:** spinner plus optional loading text, `aria-busy`; disabled at 50% opacity with no pointer events.

### Chips and Badges
- **Style:** full pill, 12px semibold, 1px inset ring at 20 to 25% of the tone, tint background (neutral, info, success, warning, danger).
- **Demo:** Sun 25% tint, Sun Ink text, Sun 60% ring, label "Demo data". Mandatory on every seed record shown.
- **Status:** payment and ticket states (Pending with spinning icon, Successful, Confirmed, Failed, Refunded, Needs review, Boarded) always pair icon and word.

### Cards / Containers
- **Corner Style:** 18px.
- **Background:** Surface on Ground.
- **Shadow Strategy:** Soft at rest; Lift plus a 40% accent border and a 4px rise on hover for clickable cards.
- **Border:** 1px hairline.
- **Internal Padding:** 20px; empty states 48px vertical with a dashed border and an Info-tinted icon tile.

### Inputs / Fields
- **Style:** 48px tall, 12px radius, 1px hairline on Surface, 15px text, label above in 14px semibold, optional 18px leading icon in Muted.
- **Focus:** border turns Accent with a 4px Accent ring at 15%.
- **Error / Disabled:** Danger border with an icon-led 13px message linked by `aria-describedby`; disabled at 60% opacity.

### Navigation
- **Site header:** 64px, sticky. Transparent with white text over the hero; on scroll it becomes Surface at 92% with blur and a hairline. Links are 15px medium pills (Muted to Fg on Info tint); active link Accent FG.
- **App sidebar:** 12px-radius items with 20px icons; active is Info tint, Accent FG, semibold.
- **Mobile tab bar:** icon over 12px semibold label, active Accent FG, Surface at 95% with blur.

### Seat Map (signature)
The bus is drawn as a 28px-radius outline on Ground with dashed "Front of bus" and "Back of bus" rules. Seats are 10px-radius squares: available is a 2px Aqua outline that lifts and turns Electric on hover; selected is Electric fill with a 4px Electric ring at 25% and a one-time 1.08 pulse; held is a dashed coral outline with a clock glyph; booked is a Border fill with a ban glyph. Each state pairs colour with a glyph and an accessible label.

### Route Line (signature)
The system's recurring device: a hollow aqua origin dot, a dashed aqua track, a solid aqua destination dot. It appears as the hero ribbon (3D coach, or static SVG fallback), the origin-to-destination block of each trip card, the stop lists in the trip-type panels, the progress spine of the how-it-works steps, the seat-hold timer (the line drains toward the stop, turning Sun in the final two minutes), the dashed arrow in the ticket header, and the RouteLoader sweep that replaces generic spinners for page loads.

### Ticket
A 24px-radius Float card: Electric-to-Violet header with From and To, a details grid (seat as a large Accent FG numeral), a dashed perforation with ground-coloured notches, then the QR on white with every detail repeated as text. Reveals with a short rise and tilt, skipped under reduced motion.

### Motion
One curve, expo ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`), for seat pulses (220ms), step panels (240ms), the route spine (450ms) and the ticket reveal (550ms). Simple state colour changes run 150 to 200ms. The 3D hero loads only after idle on capable connections (not on Save-Data, 2G or 3G) and stays still under reduced motion; a global reduced-motion rule collapses every animation and transition.

## Do's and Don'ts

### Do:
- **Do** use Electric for the one primary action on a screen, and Aqua only for routes, stops, availability and hold remaining.
- **Do** draw any origin-to-destination relationship with the route line: hollow aqua origin, dashed aqua track, solid aqua destination.
- **Do** set every time, fare, seat number, count and countdown in tabular numerals; promote departure time and fare to Plus Jakarta ExtraBold.
- **Do** badge every seed record "Demo data" (Sun tint) and label illustrative mock-ups "Illustration".
- **Do** pair every status colour with an icon or word; seats pair colour with a glyph and an accessible label.
- **Do** use semantic tokens so dark mode resolves from the same class; test both themes.
- **Do** honour reduced motion and slow connections: static fallbacks first, motion as enhancement.

### Don't:
- **Don't** show invented fares, schedules, testimonials, ratings, counts or promises; when a value is unavailable show "—" or hide the block.
- **Don't** draw or imply features that are not built: live GPS tracking, SMS notifications, cancellation, password reset.
- **Don't** use Coral or Sun as section backgrounds or decoration; they are scarcity, hold-lapse and demo signals.
- **Don't** add glass or backdrop blur beyond the hero chips and sticky bars.
- **Don't** use hard offset shadows or heavy outlines; depth is tone first, then soft tinted shadow.
- **Don't** put uppercase eyebrows or kickers above headings; uppercase is for table column headers only.

## Animated gradients

Added at the user's request. Brand fields (the landing hero, the sign-in panel, the closing call-to-action band) slowly move through the palette's own shades. A faint wash drifts behind the Lavender Mist page ground. Styles live in `apps/web/app/flow.css`.

- **Hero / sign-in field (`.mova-flow`):** Electric `#493bff` → `#5a3dff` → Violet `#8655ff` → `#6c48ff` → `#3f33e6` → Electric, 120°, 260% size, 22s ease-in-out loop. Dark theme: `#2b20c4` → `#3a23b8` → `#5a2fd6` → `#4326c9` → `#241a9e`.
- **Call-to-action band (`.mova-flow-cta`):** Electric → `#3a2df0` → `#5a3dff` → `#2f8fe6` → Aqua `#12d6c5`, 26s loop.
- **Glows (`.mova-drift-a`, `.mova-drift-b`):** soft aqua and white radial glows on brand fields, translating and scaling over 28s and 34s.
- **Page wash (`body::before`):** violet (13%), aqua (11%) and electric (10%) radial tints, 60s drift. Dark theme alphas are 18%, 10% and 16%.
- **Rules:** intermediate stops are blends of Electric, Violet and Aqua only, never new hues. The motion is slow enough to read as light, not movement. Text stays white on the brand field at every frame. Everything freezes under `prefers-reduced-motion`, and the wash is hidden in print.
