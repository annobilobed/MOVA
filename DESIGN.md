---
name: MOVA
description: The night ride home. Seat-specific student bus booking for UCC, from search to QR ticket.
colors:
  night: "#0b1026"
  midnight: "#151b3d"
  dusk: "#2a1d4f"
  plum: "#5b2e6b"
  rose: "#b4506a"
  ember: "#f0803c"
  dawn: "#ffc46b"
  morning: "#a9d8ff"
  amber: "#ffb547"
  amber-600: "#f5a62f"
  amber-700: "#e8901a"
  stud: "#ffe3a3"
  ink: "#0e1330"
  on-accent: "#1a1203"
  signal-green: "#3ddc97"
  signal-green-ink: "#0e7c5a"
  tail-red: "#ff5a67"
  tail-red-ink: "#c42b3a"
  glass: "#3b4596"
  first-light: "#6b4a8a"
  night-blue: "#1c2a5e"
  dusk-mid: "#3a2a63"
  dawn-mid: "#f2a35e"
  print-white: "#fff"
  print-black: "#000"
  ground: "#eef1f8"
  surface: "#ffffff"
  raised: "#ffffff"
  fg: "#0e1330"
  muted: "#4a5274"
  border: "#dce1ee"
  accent: "#e8901a"
  accent-fg: "#8a4b00"
  route: "#b86e00"
  success: "#0e7c5a"
  success-bg: "#ddf6eb"
  warning: "#8a5a00"
  warning-bg: "#fff1d6"
  danger: "#c42b3a"
  danger-bg: "#ffe6e9"
  info-bg: "#e8ecfa"
  dark-ground: "#0b1026"
  dark-surface: "#141a3a"
  dark-raised: "#1b2250"
  dark-fg: "#eef1ff"
  dark-muted: "#a3abd0"
  dark-border: "#262e5c"
  dark-accent: "#ffb547"
  dark-accent-fg: "#ffc978"
  dark-route: "#ffd27a"
  dark-success-bg: "#0f2f2a"
  dark-warning: "#ffc46b"
  dark-warning-bg: "#3a2c12"
  dark-danger: "#ff6b76"
  dark-danger-bg: "#3a1622"
  dark-info-bg: "#1e2650"
typography:
  display:
    fontFamily: "Overpass Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 4.6rem)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Overpass Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Overpass Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.25
  numeral:
    fontFamily: "Overpass Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.65rem"
    fontWeight: 800
    fontFeature: "tnum"
  body:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  lead:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  small:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
  micro:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
  caption:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  wordmark:
    fontFamily: "Overpass Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 900
rounded:
  focus: "6px"
  seat: "10px"
  control: "12px"
  tile: "16px"
  card: "20px"
  panel: "24px"
  feature: "28px"
  frame: "32px"
  pill: "999px"
spacing:
  unit: "4px"
  section: "80px-112px"
  card-padding: "20px-32px"
components:
  button-primary: "Headlight amber (#ffb547) fill, ink text (#1a1203), 12px radius, 44px min height; brightens on hover with an ember-tinted lift."
  seat-tile: "Available: 2px signal-green outline. Yours: amber fill with ink text and a 4px amber ring. Held by another: dashed tail-red. Booked: muted fill with an icon. Text label or icon on every state."
  hold-timer: "Countdown with an amber lane bar that drains toward an end stud; turns dawn gold in the final 2 minutes."
  ticket: "Night-sky header (dusk to night), perforation, QR with every detail also as text."
  hero-search: "Solid night panel (#0e1330 at 88%) set into the 3D highway, one amber action."
---

# MOVA design system: the night ride home

## Overview

MOVA is the overnight coach from campus, so the product is the highway at dusk turning into dawn. The landing page is a live 3D highway: a coach drives toward you, headlights lighting the road, lane dashes and road studs streaming past, street lights and palms sweeping by, and stars over a sky that cycles dusk → night → dawn about every 90 seconds. App screens are working tools in the same world. They take its type, palette, density and one signature move (lane paint and road studs), not its scenery.

Light theme = morning haze. Dark theme = night. The user picks, or it follows the device.

## Colors

- **The sky is the palette**: night `#0b1026`, midnight `#151b3d`, dusk `#2a1d4f`, plum `#5b2e6b`, rose `#b4506a`, ember `#f0803c`, dawn gold `#ffc46b`, morning `#a9d8ff`.
- **Headlight amber `#ffb547` owns every action**: primary buttons, selected seats, active steps, the hero's amber full stops. Text on amber is always ink `#1a1203`. No other hue is used for a primary action.
- **Signal green `#3ddc97`** (text form `#0e7c5a`) means available, valid or confirmed, and nothing else.
- **Tail-light red `#ff5a67`** (text form `#c42b3a`) means held by someone else or an error.
- **Road stud `#ffe3a3`** is the light of the road itself: studs, progress markers, the scroll cue.
- Semantic tokens (`ground`, `surface`, `fg`, `muted`, `accent`, `route`, …) switch between morning and night. A subtree can force night with `data-theme="dark"`, as the hero does.

## Typography

- **Overpass Variable** (an open interpretation of highway-sign lettering) for display, headings and numerals: Black/ExtraBold, -0.02em, tabular figures for times, fares and seats.
- **Inter Variable** for body and UI: 15–16px body, 14px labels, 12–13px captions, never below 11px.
- Times are 12-hour with AM/PM, Africa/Accra.

## Layout

Mobile-first. Content up to 1200px with fluid gutters. The landing hero is full-bleed (min 92svh) with the copy and search on the left. On phones an open band between the copy and the search shows the coach head-on. Signed-in areas use a side rail on desktop and a bottom bar on phones.

## Elevation & Depth

- **Soft** `0 1px 2px rgb(14 19 48 / .08), 0 10px 28px -14px rgb(14 19 48 / .28)` for resting cards and buttons.
- **Lift** `0 2px 4px rgb(14 19 48 / .08), 0 22px 44px -20px rgb(240 128 60 / .45)`: ember-tinted, on hover.
- **Float** `0 28px 64px -26px rgb(6 9 28 / .6)` for the hero search panel, the ticket and the phone frame.
- Glow is reserved for light that "flows": road studs, headlights, the active step's stud.

## Shapes

Seats 10px · controls 12px · tiles 16px · cards 20px · hero panel and ticket 24px · feature panels 28px · frames 32px · pills fully round.

## Components

- **Primary button**: amber fill, ink text. Secondary actions are outline or text buttons. Destructive actions use tail-light red.
- **Seat tile**: see frontmatter. Every state has a text label or icon.
- **Hold timer**: a countdown plus an amber lane bar draining toward an end stud.
- **Trip card**: time and date in Overpass, origin and destination on a dotted route spine, seats left, fare, "Demo data" chip when seeded.
- **Ticket**: night-sky header, perforation, QR, all details as text, cancellation reason when cancelled.
- **Luggage choice**: drawn bag icons, plain descriptions, the rules box shown before payment.
- **Driver result screens**: full-screen green / blue / amber / red verdicts with passenger name, seat, student ID and luggage.
- **Lane line**: dashed road paint as dividers and progress (how-it-works rail with a travelling glowing stud, route spines, hold bar); studs as separators in the trust strip.

## Motion

- One easing curve: expo ease-out `cubic-bezier(0.16, 1, 0.3, 1)`, 150–550ms for interactions.
- **3D highway**: the scene streams at a speed that rises with scroll; scroll swings the camera from the front of the coach to the roadside; the pointer nudges the view; wheels spin; the sky cycles every 90s; roadside objects never pass in front of the camera.
- **CSS sky (`.mova-sky`)**: a tall dusk-to-dawn gradient walked vertically over 120s. Used on the static hero fallback (3G, data saver, no WebGL), the sign-in panel and the closing band (`.mova-flow-cta`, 40s).
- **Static fallback**: the lane dashes run, the coach rolls gently toward the viewer and the headlight beam breathes.
- **Page wash**: faint ember, plum and morning radial tints drifting over 60s behind the page.
- Everything freezes under `prefers-reduced-motion`. The 3D scene is skipped on Save-Data, 2G and 3G, and on low-memory devices.

## Do's and Don'ts

- Do keep amber for actions only; green for valid only; red for problems only.
- Do label all demo data and keep every claim true: no invented fares, schedules, GPS or SMS promises.
- Do show state with text or icons as well as colour.
- Don't put text directly on the bright parts of the sky without a scrim.
- Don't add a second accent colour, gradient text, glass on forms, or eyebrow labels above headings.
- Don't animate layout properties; animate transform, opacity and background-position.

## Animated gradients

- **Sky strip (`.mova-sky`, `.mova-flow`)**: 180° gradient through dusk `#2a1d4f`, plum `#5b2e6b`, rose `#b4506a`, ember `#f0803c`, `#3a2a63`, midnight `#151b3d`, night `#0b1026`, `#1c2a5e`, first light `#6b4a8a`, dawn `#f2a35e`, sunrise `#ffc46b`. 600% height, 120s loop.
- **Closing band (`.mova-flow-cta`)**: night → dusk → plum → ember → dawn, 40s.
- **Sunrise seam**: a 176px band below the hero, night → dusk → rose → ember → dawn → page ground.
- **3D sky**: a shader dome blending zenith and horizon colours through dusk, night and dawn keyframes, with fog and stars following the phase.
