**MOVA**

**MOVE SMART. TRAVEL EASY.**

**Complete Website Design & Implementation Specification**

*A premium, vibrant, motion-rich digital transport experience for UCC
students, drivers and operators*

  ----------------- ----------------- ----------------- -----------------

  ----------------- ----------------- ----------------- -----------------

Prepared from: UCC Student Transit System --- Requirements
Specification, Version 1.0 (November 2026)

Design direction: vibrant mobility technology • 3D accents • smooth
purposeful motion • accessible, reliable booking

# Document control

  -----------------------------------------------------------------------
  **Field**                           **Details**
  ----------------------------------- -----------------------------------
  Product name                        MOVA (proposed brand name for the
                                      UCC Student Transit System)

  Product type                        Student transport booking, seat
                                      reservation, payment, digital
                                      ticketing and operator management
                                      platform

  Primary audience                    UCC students, assigned drivers,
                                      transport operator staff and system
                                      administrators

  Reference baseline                  UCC Student Transit System:
                                      Requirements Specification, Version
                                      1.0, November 2026

  Document purpose                    Define the product experience,
                                      visual system, page structure,
                                      interactions, motion language,
                                      technical implementation guidance
                                      and delivery checks

  Status note                         This is a design/build blueprint.
                                      It does not certify that any
                                      planned feature is already
                                      implemented.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  **Important distinction** The source requirements document marks
  individual capabilities as Done or Planned. This specification
  preserves those distinctions and does not treat planned functionality
  as already delivered.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## How to use this document

Use Sections 1--7 as the product and design brief, Sections 8--11 as
implementation guidance, and Sections 12--14 as the testing and delivery
checklist. The source document remains the authority for business rules,
security requirements, technology choices and acceptance criteria.

# Contents

-   1\. Product vision and principles

-   2\. Scope, roles and source requirements

-   3\. Brand identity and visual design system

-   4\. Website information architecture

-   5\. Page-by-page experience specification

-   6\. Core booking journey and interaction states

-   7\. 3D, motion and micro-interaction direction

-   8\. Responsive design and accessibility

-   9\. Technical architecture and integration guidance

-   10\. Security, privacy and reliability

-   11\. Content and component system

-   12\. Testing and acceptance criteria

-   13\. Delivery roadmap

-   14\. Design handoff and final quality checklist

-   Appendix A. Source reference map

# 1. Product vision and principles

MOVA is the proposed public-facing identity for the UCC Student Transit
System described in the supplied requirements specification. It should
make it easier for students to discover trips, reserve a specific seat,
pay digitally and present a verifiable QR ticket when boarding. It
should also give operators reliable trip and passenger-manifest tools
and give drivers a clear way to validate tickets.

## 1.1 Product promise

  -----------------------------------------------------------------------
  **Brand promise** A simpler, clearer and more dependable way for UCC
  students to plan and complete their journeys.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## 1.2 Experience goals

-   Make the main task obvious: find a trip, choose a seat, pay and
    access the ticket.

-   Build confidence through clear fares, seat availability, payment
    states and ticket details.

-   Keep the interface vibrant and memorable without sacrificing
    readability or trust.

-   Make the experience usable on small phones and on unreliable mobile
    connections.

-   Give each role only the tools and information needed for that role.

-   Use motion and 3D as visual enhancement, never as an obstacle to
    completing a booking.

## 1.3 Design principles

  -----------------------------------------------------------------------
  **Principle**                       **What it means in MOVA**
  ----------------------------------- -----------------------------------
  Clarity before decoration           Trip details, prices, seat status
                                      and next actions must remain easy
                                      to understand.

  Trust at every step                 Show payment status, booking
                                      confirmation and QR ticket only
                                      when the server confirms the
                                      booking.

  Mobile-first                        The student flow must work
                                      comfortably on narrow screens and
                                      touch devices.

  Purposeful motion                   Animation guides attention,
                                      confirms actions and explains state
                                      changes.

  Accessible by design                Never communicate seat or payment
                                      status using colour alone; include
                                      labels and text.

  Resilient experience                Explain network or server delays
                                      and provide safe retry paths
                                      without creating duplicate
                                      payments.
  -----------------------------------------------------------------------

# 2. Scope, roles and source requirements

## 2.1 Product scope from the source

The requirements specification describes three connected product
surfaces: a Flutter mobile app for students and drivers, a Next.js web
portal for operators, and a Node.js API backed by PostgreSQL and Redis.
The trip scope includes inter-regional vacation travel and campus
shuttles. The first release excludes multi-operator marketplaces,
student-initiated refunds, non-Ghana payment methods, loyalty points,
group bookings and multi-city route planning.

## 2.2 User roles

  -----------------------------------------------------------------------
  **Role**                **Primary needs**       **MOVA experience**
  ----------------------- ----------------------- -----------------------
  Student                 Register, browse trips, Mobile-first student
                          filter destinations,    experience; a
                          select a seat, pay,     responsive web entry
                          view QR tickets         point may be provided
                                                  if desired, without
                                                  replacing the Flutter
                                                  app requirement.

  Driver                  See assigned trips and  Driver-focused mobile
                          validate tickets for    interface with clear
                          the assigned bus        scan/validation
                                                  outcomes.

  Operator admin          Create buses and trips, Desktop-first
                          view and print          operations portal with
                          passenger manifests     forms, tables, filters
                                                  and printable
                                                  manifests.

  Super admin             Manage accounts and     Restricted
                          perform operator-level  administration area
                          functions               with role-aware
                                                  controls and
                                                  audit-conscious
                                                  workflows.
  -----------------------------------------------------------------------

## 2.3 Source capability status

The source document explicitly labels features Done, Partial or Planned.
The following are key design implications; the source status should be
checked against the actual codebase during implementation.

  ----------------------------------------------------------------------------------------
  **Area**                **Source status in      **Design implication**
                          specification**         
  ----------------------- ----------------------- ----------------------------------------
  Registration, login,    Done                    Design clear account flows and
  role assignment                                 role-specific routing; test against the
                                                  existing implementation.

  Trip discovery and trip Done                    Design searchable/filterable trip cards
  creation by API                                 and operator trip data views.

  Seat map and seat       Done                    Design seat states and a visible
  locking                                         ten-minute lock/countdown.

  Paystack payment and    Done; live test keys    Design
  webhook handling        still needed            pending/success/failure/refund/flagged
                                                  states and validate the full payment
                                                  flow.

  QR ticket display and   Done                    Design digital ticket and
  ticket validation logic                         validation-result screens.

  Operator manifest       Done                    Design polished manifest table and print
  viewing/printing                                stylesheet.

  Operator portal login,  Planned                 Treat as implementation work, not as
  forms for bus/trip                              completed capability.
  creation, company                               
  scoping                                         

  Driver in-app QR        Planned                 Design the scanner experience, then
  scanner                                         implement and test it.

  Password reset, booking Planned                 Show as future scope unless the
  cancellation, SMS and                           implementation team confirms delivery.
  GPS tracking                                    
  ----------------------------------------------------------------------------------------

# 3. Brand identity and visual design system

## 3.1 Brand personality

MOVA should feel optimistic, energetic, modern, dependable and
distinctly digital. The visual language should borrow the polish of
leading mobility and travel products while retaining its own identity.
Avoid looking like a generic bus company website or a crowded student
portal.

## 3.2 Recommended colour palette

  -----------------------------------------------------------------------
  **Token**               **Hex**                 **Purpose and usage**
  ----------------------- ----------------------- -----------------------
  MOVA Electric           #493BFF                 Primary brand colour;
                                                  main CTA, active
                                                  navigation, links and
                                                  selected states.

  MOVA Violet             #8655FF                 Gradient partner, hero
                                                  accents, decorative
                                                  highlights and selected
                                                  feature cards.

  MOVA Aqua               #12D6C5                 Positive action
                                                  accents, route
                                                  indicators,
                                                  available-seat accent
                                                  and success details
                                                  (with text/icon).

  MOVA Coral              #FF6B79                 Secondary CTA, special
                                                  notices and friendly
                                                  emphasis; use
                                                  sparingly.

  MOVA Sun                #FFD166                 Small highlights,
                                                  badges and attention
                                                  cues; avoid using for
                                                  small text on white.

  MOVA Lavender Mist      #F5F5FF                 Main light background
                                                  and soft section
                                                  surfaces.

  MOVA Ink                #171936                 Primary text, headings
                                                  and high-contrast dark
                                                  surfaces.

  MOVA Slate              #626782                 Secondary text, helper
                                                  copy and metadata.

  MOVA Border             #E5E7F2                 Dividers, input borders
                                                  and card outlines.

  MOVA White              #FFFFFF                 Cards, forms and
                                                  content surfaces.
  -----------------------------------------------------------------------

Colour balance recommendation: approximately 50% light neutral surfaces,
25% Electric/Violet brand surfaces, 15% Aqua accents and 10% Coral/Sun
highlights. Treat these proportions as a starting point, not a rigid
rule.

## 3.3 Gradient recipes

  -------------------------------------------------------------------------
  **Gradient**            **Suggested use**       **CSS direction**
  ----------------------- ----------------------- -------------------------
  Electric → Violet       Hero backdrop, major    linear-gradient(120deg,
                          feature panel           #493BFF 0%, #8655FF 100%)

  Aqua → Electric         Route/booking progress  linear-gradient(120deg,
                          accents                 #12D6C5 0%, #493BFF 100%)

  Violet → Coral          Campaign/feature        linear-gradient(120deg,
                          highlight, sparingly    #8655FF 0%, #FF6B79 100%)

  Lavender glow           Soft background         radial-gradient(circle,
                          atmosphere              rgba(134,85,255,.16),
                                                  transparent 65%)
  -------------------------------------------------------------------------

## 3.4 Colour accessibility rules

-   Use dark ink text on light backgrounds and white text only on
    sufficiently dark brand surfaces.

-   Do not place small white text directly on Aqua or Sun; use dark ink
    text instead.

-   Seat states must include a visible label or icon as well as colour.

-   Payment states must include a written status such as Pending,
    Successful, Failed, Refunded or Needs review.

-   Check contrast for all text, icons, button labels, focus rings and
    disabled states before release.

## 3.5 Typography

  -----------------------------------------------------------------------
  **Use**                 **Recommended font**    **Guidance**
  ----------------------- ----------------------- -----------------------
  Headlines and brand     Poppins or Plus Jakarta Bold, confident, short
  moments                 Sans                    headlines; avoid overly
                                                  large text on mobile.

  Body, forms and         Inter or DM Sans        Highly readable,
  dashboards                                      consistent numerals and
                                                  clear form labels.

  Numbers and prices      Inter with tabular      Keep fares, seat
                          numerals                numbers and dashboard
                                                  figures aligned and
                                                  easy to compare.
  -----------------------------------------------------------------------

## 3.6 Shape, depth and surfaces

-   Use a consistent 12--20 px radius for cards and 10--14 px for
    inputs/buttons.

-   Use soft shadows rather than heavy black drop shadows.

-   Reserve glass-like translucent panels for hero overlays or
    decorative floating cards; keep forms and tables solid and legible.

-   Use a consistent spacing scale based on 4 px increments.

-   Use a restrained icon family with consistent stroke weight; pair
    icons with labels where meaning could be unclear.

# 4. Website information architecture

## 4.1 Public website navigation

  -----------------------------------------------------------------------
  **Navigation item**                 **Purpose**
  ----------------------------------- -----------------------------------
  Home                                Explain the service and guide users
                                      to search trips.

  Find a Trip                         Open trip search and available
                                      departures.

  How It Works                        Explain select seat → pay → receive
                                      QR ticket → board.

  Help / Contact                      Provide support information and
                                      common questions.

  Sign in                             Route the user to the correct
                                      role-aware sign-in experience.
  -----------------------------------------------------------------------

## 4.2 Authenticated areas

  -----------------------------------------------------------------------
  **Student area**  **Driver area**   **Operator area** **Super admin
                                                        area**
  ----------------- ----------------- ----------------- -----------------
  Dashboard; Find   Assigned trips;   Overview; Buses;  System overview;
  trips; Seat       Ticket scanner;   Trips; Manifests; Users; Operators;
  selection;        Scan result;      Print manifest    Account
  Checkout; My      Boarding status                     administration
  tickets; Profile                                      

  -----------------------------------------------------------------------

## 4.3 Navigation behaviour

-   On desktop, use a clean top navigation for the public site and a
    persistent side navigation for authenticated dashboards.

-   On mobile, use a compact top bar and a bottom navigation for the
    most-used student destinations.

-   Show the current section clearly with an active colour and text
    label.

-   Hide or disable links the current role is not authorised to use; do
    not rely on hiding controls as the only security measure.

-   Keep the primary action visible without forcing users to scroll
    excessively.

# 5. Page-by-page experience specification

## 5.1 Home / landing page

Purpose: quickly explain MOVA and move visitors into trip search.

-   Top navigation: MOVA wordmark, Find a Trip, How It Works, Help and
    Sign in.

-   Hero: bold headline such as "Your journey. Your seat. Your freedom."
    with one sentence explaining student travel booking.

-   Hero visual: high-quality 3D bus or stylised route scene, with a
    clear search panel. The visual must not cover the search controls.

-   Trip search: origin, destination and departure date. Use Cape Coast
    as a suggested origin only if it is the actual configured operating
    origin; do not hard-code it for every user.

-   Trust strip: secure payment, seat selection and QR ticketing, using
    claims that match the implemented service.

-   How it works: three or four steps with simple illustrations.

-   Upcoming/popular trips: show only live trips returned by the API; do
    not invent schedules or prices.

-   Footer: support, service information, privacy and terms.

  -----------------------------------------------------------------------
  **Hero CTA** Primary: "Find available trips". Secondary: "How MOVA
  works". Avoid multiple competing primary buttons.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## 5.2 Find trips / search results

-   Search summary at the top with editable origin, destination and
    date.

-   Filters for destination and trip type (inter-regional or campus
    shuttle), based on available API data.

-   Trip cards show origin, destination, departure date/time, fare in
    GHS, seats remaining and a clear action.

-   Show a helpful empty state when no matching trips are available,
    with an option to change filters.

-   Fully booked or departed trips must not offer a booking action, in
    accordance with FR-8.

-   Use skeleton loading placeholders and a retry state for slow or
    failed connections.

## 5.3 Trip details

-   Show route, departure time, fare, bus information where available,
    trip type and seat availability.

-   Explain any additional luggage charges before checkout.

-   Make the fare and the next action visually prominent.

-   Do not show a seat as available based only on stale client-side
    information; refresh availability before locking/payment.

## 5.4 Seat selection

This is one of MOVA\'s signature interactions. The source specifies a
default 49-seat bus layout (11 rows of 2 + aisle + 2, followed by a back
row of 5). The implementation must use the actual bus capacity/layout
returned or configured for that bus; do not force every bus to have 49
seats.

  -----------------------------------------------------------------------
  **Seat state**          **Visual treatment**    **Required
                                                  text/accessibility
                                                  cue**
  ----------------------- ----------------------- -----------------------
  Available               Light surface with aqua "Available"
                          outline or accent       

  Selected by current     Electric blue filled    "Selected"
  user                    tile with strong focus  
                          ring                    

  Booked                  Muted grey surface,     "Booked"
                          disabled interaction    

  Temporarily locked by   Muted coral/amber       "Temporarily
  another student         treatment, disabled     unavailable"
                          interaction             

  Unavailable / outside   Not rendered as a       Not applicable
  capacity                selectable seat         
  -----------------------------------------------------------------------

-   Display a small legend above or beside the seat map.

-   Show the bus front/driver position and aisle clearly.

-   On selection, animate the seat tile subtly (scale/colour transition)
    and update the booking summary.

-   Before payment, the server creates a ten-minute seat lock. Show a
    countdown only after the server confirms the lock.

-   If the lock expires, explain that the seat is no longer held and
    refresh the map.

-   Do not use colour alone to indicate state; include text labels and
    accessible names.

## 5.5 Checkout and payment

-   Show a clear fare breakdown: trip fare, luggage category/fee and
    total amount in GHS.

-   Explain the available payment methods supported through Paystack
    Ghana, including mobile money and card where enabled.

-   Show the payment status as Pending while waiting for confirmation;
    do not prematurely show a confirmed ticket.

-   Prevent accidental repeated submission with an in-progress state and
    idempotent server-side handling.

-   Use clear outcome screens for success, failure, refund,
    flagged/manual review and timeout.

-   Never trust a total supplied by the browser/app; the server
    calculates the amount as required by FR-17.

## 5.6 Booking confirmation and digital ticket

-   Show a clear confirmation heading only after server-side payment
    verification and booking creation.

-   Display QR code, passenger name, trip, route, departure, bus plate,
    seat number and payment/booking reference as appropriate.

-   Provide a clear "My tickets" destination and a restrained share/save
    affordance if supported.

-   Explain that the QR ticket is checked at boarding and should be
    available on the passenger\'s phone.

-   Do not expose internal tokens or implementation secrets in visible
    URLs or page source.

## 5.7 Student dashboard and My Tickets

-   Dashboard greeting and next upcoming trip, if one exists.

-   Quick action to find a trip.

-   Ticket cards with route, departure, seat, bus and ticket status.

-   Past/completed tickets separated from upcoming tickets.

-   Profile details and account actions; keep sensitive personal
    information limited to the signed-in student.

## 5.8 Driver experience

-   Show only trips assigned to the authenticated driver.

-   Provide a high-contrast scanner screen with a large scan target and
    torch/permission guidance if supported by the device.

-   On scan, show a full-screen result: Valid / Already used / Wrong bus
    / Invalid ticket / Network unavailable.

-   On valid scan, confirm boarding and prevent the same ticket being
    accepted twice.

-   Do not rely on a green/red flash alone; include clear text, icon and
    optional vibration/audio feedback.

Source status: the driver scanner screen is marked Planned in the
requirements specification (FR-29). Treat this as a design target until
implementation is verified.

## 5.9 Operator portal

-   Desktop-first operations dashboard with summary metrics such as
    upcoming trips, active buses and passenger counts only when backed
    by real data.

-   Bus management form: plate number, seat capacity and optional
    assigned driver.

-   Trip management form: bus, destination, fare, future departure time,
    trip type and origin.

-   Trip list with search/filter and clear status labels.

-   Manifest view with seat, passenger name, student ID, phone, luggage
    and boarding status, following the source requirements.

-   Print-friendly manifest layout that hides navigation, decorative
    backgrounds and non-essential controls.

-   Role/company scoping must be enforced by the API; operators must not
    access another company\'s manifests.

Source status: manifest viewing and printing are marked Done; operator
login, trip/bus forms and company-level manifest scoping are marked
Planned in FR-32 to FR-34.

## 5.10 Super admin

-   Provide a separate restricted route, not a public navigation
    destination.

-   Support account and role administration as authorised by the system.

-   Show clear confirmation before sensitive account/role changes.

-   Keep administrative actions auditable in the backend where logging
    is implemented.

# 6. Core booking journey and interaction states

## 6.1 Main student flow

  -----------------------------------------------------------------------
  **Step**                **User action**         **System response /
                                                  interface state**
  ----------------------- ----------------------- -----------------------
  1\. Discover            Open MOVA and enter     Validate required
                          trip search details     fields and retrieve
                                                  matching trips.

  2\. Compare             Review departure,       Show accurate trip
                          destination, fare and   data, loading and empty
                          seats left              states.

  3\. Select              Choose a trip and a     Render the correct bus
                          seat                    layout and current seat
                                                  states.

  4\. Hold                Continue to payment     Server locks the
                                                  selected seat for ten
                                                  minutes; show countdown
                                                  after confirmation.

  5\. Pay                 Choose payment method   Create/track payment;
                          and authorise payment   display Pending while
                                                  awaiting verified
                                                  result.

  6\. Confirm             Payment is verified by  Create booking once and
                          the server              issue unique QR token;
                                                  show ticket.

  7\. Board               Present ticket to       Validate QR; accept
                          assigned driver         once and mark boarded.
  -----------------------------------------------------------------------

## 6.2 Required states

  -----------------------------------------------------------------------
  **State**               **User-facing message   **Action**
                          direction**             
  ----------------------- ----------------------- -----------------------
  Loading                 "Finding available      Show skeletons; avoid
                          trips..."               layout jump.

  No results              "No trips match those   Allow search
                          details."               adjustment.

  Seat locked             "This seat is held for  Show server-based
                          10 minutes while you    countdown.
                          complete payment."      

  Lock expired            "Your seat hold has     Refresh seats; do not
                          expired."               continue as if held.

  Payment pending         "We're confirming your  Poll/subscribe safely;
                          payment. Please keep    do not create duplicate
                          this page open."        payment.

  Payment successful      "Your booking is        Show ticket only after
                          confirmed."             confirmed booking.

  Payment failed          "Payment wasn't         Offer safe retry;
                          completed."             explain whether the
                                                  seat is still held.

  Refunded                "Your payment was       Show status and
                          refunded."              reference where
                                                  appropriate.

  Flagged                 "We're reviewing this   Provide support path;
                          payment. No ticket has  do not imply confirmed
                          been issued yet."       booking.

  Offline/timeout         "Connection             Retry status check
                          interrupted. Your       safely; never assume
                          payment status may      failure or success.
                          still be processing."   
  -----------------------------------------------------------------------

## 6.3 Critical business rules to preserve

-   One active booking per trip and seat.

-   A seat lock lasts ten minutes; when it expires, another student may
    reserve the seat.

-   A booking is created only after Paystack confirms payment.

-   All amounts are in Ghana cedis; Paystack amount is sent in pesewas
    (GHS × 100).

-   A driver may validate tickets only for the bus assigned to them.

-   Repeated webhook messages must not create duplicate bookings.

-   If a seat is no longer available when payment completes, the student
    is refunded according to the source business rule.

-   Past trips cannot be created or booked.

# 7. 3D, motion and micro-interaction direction

## 7.1 Creative direction

The visual style should be vibrant and dimensional, but not visually
noisy. Use 3D as a signature layer in the landing page and selected
feature moments. Keep booking, payment, ticket and operator workflows
fast, flat enough to read, and easy to operate.

## 7.2 Recommended 3D moments

  -----------------------------------------------------------------------
  **Moment**              **Design treatment**    **Implementation
                                                  guidance**
  ----------------------- ----------------------- -----------------------
  Landing hero            Stylised 3D coach bus   Use a compressed
                          on a floating route     GLB/GLTF model or a
                          ribbon, with soft       pre-rendered
                          shadows and a few       transparent/WebP
                          floating location pins  visual. Add WebGL only
                                                  if performance is
                                                  acceptable.

  How it works            Small 3D-style seat,    Prefer lightweight
                          phone/ticket and route  Lottie, SVG or
                          illustrations           pre-rendered assets for
                                                  small screens.

  Trip feature panels     Layered route map,      Use CSS transforms and
                          destination cards and   depth; avoid a heavy 3D
                          floating fare/ticket    scene on every page.
                          chips                   

  Booking success         Ticket card rises into  Use CSS/Framer Motion;
                          view with a subtle 3D   respect reduced-motion
                          tilt; checkmark draws   preference.
                          in                      

  Seat selection          Seat tile lifts         Use transform and
                          slightly on hover/focus shadow only; avoid
                          and settles when        perspective that makes
                          selected                seat labels hard to
                                                  read.
  -----------------------------------------------------------------------

## 7.3 Motion system

  -----------------------------------------------------------------------
  **Interaction**         **Recommended motion**  **Timing guidance**
  ----------------------- ----------------------- -----------------------
  Page/route transition   Fade + 8--16 px         180--260 ms
                          vertical movement       

  Card hover              TranslateY(-3 to -5     140--200 ms
                          px), soft shadow        

  Button press            Scale to 0.98 then      90--140 ms
                          return                  

  Seat selection          Colour/border           160--220 ms
                          transition + tiny scale 
                          pulse                   

  Success confirmation    Checkmark draw + ticket 350--550 ms
                          fade/slide              

  Dropdown/modal          Fade + slight scale     160--220 ms
                          from 0.98               

  Hero decorative         Slow floating/parallax  6--12 seconds, subtle
  movement                movement                loop

  Loading indicator       Short route-line sweep  Continuous only while
                          or skeleton shimmer     loading
  -----------------------------------------------------------------------

## 7.4 Motion rules

-   Use motion to communicate cause and effect: a selected seat changes
    state; a confirmed payment reveals the ticket.

-   Keep essential content visible even if animation fails or is
    disabled.

-   Do not animate every card, every line of text and every background
    simultaneously.

-   Do not use flashing, rapid zooming or strong parallax that can cause
    discomfort.

-   Support prefers-reduced-motion: replace complex movement with
    instant state changes or short fades.

-   On low-powered phones, disable or simplify WebGL, parallax and
    continuous decorative loops.

-   Never delay a critical action because an animation has not finished.

## 7.5 Suggested motion/3D tools

  -----------------------------------------------------------------------
  **Tool**                **Best use**            **Caution**
  ----------------------- ----------------------- -----------------------
  Framer Motion           React/Next.js page      Keep variants reusable;
                          transitions, card       avoid excessive
                          entrance, hover/press   animation wrappers.
                          and layout animation    

  Three.js / React Three  Interactive 3D bus or   Lazy-load, provide a
  Fiber                   route scene on the      static fallback and
                          landing page            monitor GPU/memory use.

  Spline                  Fast authoring of a     Embed only when payload
                          polished interactive 3D and mobile performance
                          hero scene              are acceptable.

  Lottie                  Small illustrations,    Use lightweight
                          success marks and       animations; avoid giant
                          loading animations      JSON files.

  CSS transforms          Seat interaction, card  Prefer
                          depth, button feedback  transform/opacity;
                          and simple floating     avoid animating
                          effects                 expensive layout
                                                  properties.
  -----------------------------------------------------------------------

# 8. Responsive design and accessibility

## 8.1 Responsive breakpoints

  -----------------------------------------------------------------------
  **Viewport**                        **Layout direction**
  ----------------------------------- -----------------------------------
  Small mobile (≤ 390 px)             Single-column flow, compact header,
                                      full-width CTAs, stacked trip
                                      details, horizontally scrollable
                                      only where necessary.

  Large mobile (391--767 px)          Single-column booking journey; seat
                                      map scales to fit without clipping;
                                      bottom navigation where
                                      appropriate.

  Tablet (768--1023 px)               Two-column layouts where useful;
                                      dashboard navigation can collapse.

  Desktop (≥ 1024 px)                 Wider hero composition, side
                                      navigation for portals,
                                      multi-column dashboards and full
                                      manifest tables.
  -----------------------------------------------------------------------

## 8.2 Accessibility requirements

-   All controls must be keyboard reachable and have visible focus
    indicators.

-   Provide labels for inputs; do not use placeholder text as the only
    label.

-   Use semantic headings, landmarks, buttons and form elements.

-   Provide text labels for seat states, as required by NFR-6.

-   Ensure QR ticket details are also available as readable text; do not
    make the QR image the only ticket information.

-   Provide useful alt text for meaningful images; mark decorative 3D
    assets as decorative.

-   Respect reduced-motion settings.

-   Maintain readable type sizes and sufficient contrast in bright
    colour combinations.

-   Provide clear error messages next to fields and in a form-level
    summary when appropriate.

# 9. Technical architecture and integration guidance

The technology choices below are taken from the supplied requirements
specification and should remain the baseline unless the project owner
formally approves a change.

  -------------------------------------------------------------------------
  **Layer**               **Source technology**   **Design/implementation
                                                  responsibility**
  ----------------------- ----------------------- -------------------------
  Student and driver      Flutter (Dart)          Student booking/ticket
  mobile app                                      flows and driver scanner
                                                  experience.

  Operator portal         Next.js 15 + Tailwind   Responsive operator web
                          CSS                     interface and role-aware
                                                  pages.

  API                     Node.js, Express,       Authentication, trip
                          TypeScript              data, seat locking,
                                                  booking, payment
                                                  verification and ticket
                                                  validation.

  Database                PostgreSQL 16           Persistent users, buses,
                                                  trips, payments and
                                                  bookings.

  Cache/seat locks        Redis 7 or newer        Ten-minute temporary seat
                                                  locks with expiry.

  Payments                Paystack Ghana          Mobile money/card
                                                  payments in GHS and
                                                  signed webhooks.

  SMS                     Arkesel (planned)       Booking/trip
                                                  notifications when
                                                  implemented.

  Hosting                 Render or DigitalOcean  Deployment target
                                                  identified by the source
                                                  specification.
  -------------------------------------------------------------------------

## 9.1 Suggested web application structure

A practical Next.js portal structure may separate public pages,
authenticated operator pages and super-admin pages. The exact route
names should follow the existing repository conventions.

-   / --- public landing page

-   /trips --- trip search and results

-   /auth/sign-in --- sign-in entry

-   /operator --- operator overview

-   /operator/buses --- bus management

-   /operator/trips --- trip management

-   /operator/manifests/\[tripId\] --- trip passenger manifest

-   /admin --- restricted system administration

## 9.2 API and data principles

-   Use the existing API contracts and database schema as the source of
    truth; do not create a parallel frontend-only booking database.

-   Calculate fares and luggage fees on the server, not in client code.

-   Treat seat availability as derived from bookings and active locks,
    consistent with the source data rules.

-   Use server-side transactions and uniqueness constraints to prevent
    double booking.

-   Verify Paystack webhook signatures against the raw request body.

-   Make webhook processing idempotent so duplicate webhook delivery
    cannot create duplicate bookings.

-   Expose only role-authorised data; operator scoping must be enforced
    by the backend.

-   Keep all secrets in environment variables and never expose secret
    keys in browser bundles.

## 9.3 Performance strategy

-   Lazy-load the 3D hero and non-critical animations after the primary
    page content is usable.

-   Provide a static hero image fallback for devices that cannot run the
    3D scene.

-   Compress images, use responsive image sizes and avoid large autoplay
    videos.

-   Split portal bundles by route and load heavy charts or 3D scenes
    only where needed.

-   Use skeletons and optimistic visual feedback carefully; never
    optimistically claim a payment or booking succeeded.

-   Target the source requirement that trip lists and seat maps load in
    under three seconds on a 3G connection (NFR-3).

# 10. Security, privacy and reliability

This section translates the source security and non-functional
requirements into interface and implementation checks. It is not a
substitute for a security review.

  -------------------------------------------------------------------------
  **Source requirement**              **MOVA implementation expectation**
  ----------------------------------- -------------------------------------
  SEC-1: password minimum and bcrypt  Show password guidance; backend
  hashing                             stores bcrypt hashes, never
                                      plaintext.

  SEC-2: signed sessions, seven-day   Handle expired sessions cleanly;
  expiry and strong secret            protect signing secrets server-side.

  SEC-3: secure mobile storage and    Do not store auth tokens in
  httpOnly web cookie                 localStorage for the operator portal.

  SEC-4: role checks on protected     Enforce
  endpoints                           student/driver/operator/super-admin
                                      permissions on every protected API
                                      route.

  SEC-5: rate limits                  Show a helpful retry message when
                                      rate limits apply; do not reveal
                                      internal implementation detail.

  SEC-6: validation and parameterised Validate all form inputs on client
  queries                             and server; parameterise database
                                      queries.

  SEC-7: signed Paystack webhook      Reject invalid webhook signatures and
                                      log safely.

  SEC-8: secrets in environment       Never commit secrets or expose them
  variables                           in frontend configuration.

  SEC-9: HTTPS only                   Use HTTPS in production and only load
                                      payment pages over HTTPS.

  SEC-10: student data access and     Limit phone/student ID visibility to
  Ghana Data Protection Act, 2012     authorised operators and protect
  (Act 843)                           personal data.

  SEC-11: safe error messages         Show useful user-facing messages
                                      without stack traces, SQL details or
                                      secret values.
  -------------------------------------------------------------------------

## 10.1 Reliability and recovery

-   Handle unreliable mobile networks with explicit loading, timeout,
    offline and retry states.

-   After a payment interruption, retrieve the authoritative payment
    status before offering a new payment attempt.

-   Never tell a student that payment failed solely because the browser
    timed out.

-   Ensure each successful payment ends in a booking or a refund, as
    stated in NFR-2.

-   Monitor failed refunds and flagged payments, and take daily database
    backups as specified in the deployment section.

-   Do not make live GPS tracking or SMS a launch promise until the
    planned integrations are actually implemented.

# 11. Content and component system

## 11.1 Voice and microcopy

Use clear, calm and encouraging language. The brand can be energetic,
but payment and security messages must be direct and unambiguous.

  -----------------------------------------------------------------------
  **Situation**                       **Recommended copy**
  ----------------------------------- -----------------------------------
  Landing headline                    Your journey. Your seat. Your
                                      freedom.

  Search CTA                          Find available trips

  Seat selected                       Seat {number} selected

  Seat lock                           Your seat is held for 10 minutes
                                      while you complete payment.

  Payment pending                     We're confirming your payment.
                                      Please wait before trying again.

  Success                             Your booking is confirmed. Your
                                      ticket is ready.

  No trips                            No trips match those details. Try
                                      another date or destination.

  Network issue                       Connection interrupted. We'll check
                                      your booking status when you
                                      reconnect.
  -----------------------------------------------------------------------

## 11.2 Reusable components

  -----------------------------------------------------------------------
  **Component**                       **Required states/variants**
  ----------------------------------- -----------------------------------
  Button                              Primary, secondary, outline, text,
                                      loading, disabled, focus.

  Trip card                           Available, fully booked, departed,
                                      loading/skeleton.

  Seat tile                           Available, selected, booked,
                                      locked, disabled, focus.

  Status badge                        Pending, confirmed, failed,
                                      refunded, flagged, boarded.

  Form field                          Default, focus, filled, error,
                                      disabled, helper text.

  Ticket card                         Upcoming, boarded/completed,
                                      cancelled if supported.

  Alert/banner                        Info, success, warning, error,
                                      offline.

  Empty state                         No trips, no tickets, no manifests,
                                      no search results.

  Dashboard metric                    Loading, value, unavailable; only
                                      real backend values.

  Manifest table                      Loading, populated, empty, error,
                                      print view.
  -----------------------------------------------------------------------

## 11.3 Data honesty

-   Do not create sample trips, fares, operator names, bus plates or
    passenger counts in production UI.

-   Clearly label demo/test data when used during development or
    presentations.

-   Do not show a "live bus location" feature until GPS tracking is
    implemented and operating.

-   Do not show an SMS confirmation promise until the Arkesel
    integration is enabled.

-   Do not display a QR ticket until the server has created a confirmed
    booking.

# 12. Testing and acceptance criteria

Use the acceptance criteria in Section 11 of the source specification as
the baseline. Add the visual and interaction checks below so the
finished product is both functionally correct and polished.

  -----------------------------------------------------------------------
  **Test area**                       **Pass condition**
  ----------------------------------- -----------------------------------
  Registration/login                  A new student can register, log out
                                      and log back in; duplicate email is
                                      rejected.

  Trip discovery                      Upcoming trips show origin,
                                      destination, departure, fare and
                                      seats left; filters work.

  Seat selection                      Seat layout matches bus capacity;
                                      booked/locked seats cannot be
                                      selected.

  Seat locking                        A selected seat is held for ten
                                      minutes by the server; expiry
                                      releases it correctly.

  Payment                             Paystack test payment produces the
                                      correct verified outcome; amount
                                      tampering is rejected.

  Double booking                      Two simultaneous attempts for one
                                      seat result in one booking and the
                                      other payment is handled/refunded
                                      according to the business rule.

  Webhook safety                      Duplicate webhook creates one
                                      booking; invalid signature is
                                      rejected.

  Ticket validation                   Valid ticket is accepted once;
                                      repeat scan and wrong-bus ticket
                                      are rejected.

  Manifest                            Operator sees correct passenger
                                      details and can print the manifest.

  Role security                       Student cannot access
                                      driver/operator endpoints; operator
                                      sees only authorised company data.

  Responsive layout                   Core booking journey works on small
                                      phones, tablets and desktop.

  Motion/accessibility                Reduced-motion mode works; keyboard
                                      focus is visible; seat states are
                                      labelled.

  Performance                         Trip lists and seat maps meet the
                                      source target of under three
                                      seconds on a 3G connection where
                                      practical to test.
  -----------------------------------------------------------------------

## 12.1 Visual QA checklist

-   All pages use the same colour tokens, typography, spacing and corner
    radii.

-   Primary actions are visually consistent and easy to identify.

-   Gradients do not reduce text contrast.

-   3D assets have a static fallback and do not block the booking
    journey.

-   Transitions feel smooth but do not slow down navigation.

-   Seat labels remain readable at phone widths.

-   Operator tables remain usable and printable.

-   Empty, loading, error and success states are designed---not left as
    browser defaults.

# 13. Delivery roadmap

The source specification already outlines Sprints 0--6. Keep that
implementation history visible and align the design rollout with the
existing work rather than restarting the project.

  ----------------------------------------------------------------------------------------------
  **Phase**         **Scope**         **Design/build focus**                   **Exit check**
  ----------------- ----------------- ---------------------------------------- -----------------
  Foundation        Repository,       Establish tokens, typography, shared     Build runs
  (existing Sprint  Docker, database  components and app shell                 locally; schema
  0)                schema                                                     and environment
                                                                               setup documented.

  Core accounts &   Authentication,   Sign-in, role routing, trip cards, forms Role access and
  trip data (Sprint roles, buses and  and empty/loading states                 trip data
  1)                trips                                                      verified.

  Seat experience   Seat map and seat Responsive bus layout, seat legend, lock No double
  (Sprint 2)        locking           countdown and expiry state               selection; lock
                                                                               behaviour
                                                                               verified.

  Payments &        Paystack,         Checkout,                                Test payment and
  tickets (Sprint   webhook, refunds, pending/success/failure/refund/flagged   webhook scenarios
  3)                QR tokens         screens and digital ticket               pass.

  Operator portal   Manifest; login   Dashboard, operator login, bus/trip      Operator scope
  (Sprint 4)        and trip forms    forms, manifest and print view           and print output
                    are                                                        verified.
                    partly/planned                                             
                    per source                                                 

  Mobile            Student screens   Polish Flutter student screens; build    Student flow
  student/driver    done; driver      scanner UX and validation states         works on device;
  (Sprint 5)        scanner planned                                            scanner tested
                                                                               when implemented.

  Completion &      SMS, GPS,         Implement only confirmed scope; add      Deployment
  operations        automated tests   monitoring, backups and release QA       checklist, tests
  (Sprint 6)        and deployment                                             and operational
                    planned                                                    handover
                                                                               complete.
  ----------------------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  **Suggested build order** First make the full booking journey reliable
  and clear. Then add the 3D hero, decorative motion and advanced polish.
  The visual experience should never hide unfinished payment, security or
  role logic.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 14. Design handoff and final quality checklist

## 14.1 What the design/development team should produce

-   Brand assets: MOVA wordmark, app icon, colour tokens and icon style.

-   Responsive page designs: mobile, tablet and desktop for public pages
    and operator portal.

-   Student journey designs: trip search, trip details, seat selection,
    checkout, ticket and profile.

-   Driver journey designs: assigned trips, scanner,
    valid/invalid/already-used/wrong-bus results.

-   Operator journey designs: dashboard, bus form, trip form, trip list,
    manifest and print layout.

-   Motion prototypes: hero movement, page transitions, seat selection,
    payment result and ticket reveal.

-   3D asset package: optimised model or pre-rendered asset, static
    fallback and licensing/source details.

-   Component library: buttons, inputs, cards, badges, tables, alerts,
    modals, seat tiles and navigation.

-   Implementation notes: responsive breakpoints, motion timings,
    reduced-motion behaviour, accessibility and API data dependencies.

## 14.2 Final release checklist

-   [ ] Brand name and visual identity approved.

-   [ ] All core screens implemented against real API data.

-   [ ] All four roles tested with correct permissions.

-   [ ] Ten-minute seat lock and payment flow verified end to end.

-   [ ] QR ticket issued only after confirmed booking.

-   [ ] Driver validation rejects repeat scans and wrong-bus tickets.

-   [ ] Operator manifest displays correct data and prints cleanly.

-   [ ] Mobile and 3G performance checked.

-   [ ] Reduced-motion and keyboard accessibility checked.

-   [ ] 3D scene is optimised and has a fallback.

-   [ ] Security, privacy, logging, backup and deployment checks
    completed.

-   [ ] Planned features are clearly distinguished from released
    features.

# Appendix A. Source reference map

The following references identify where the product requirements used in
this design blueprint appear in the supplied UCC Student Transit System:
Requirements Specification (12 pages, Version 1.0, November 2026).

  -----------------------------------------------------------------------
  **Source location**     **What it establishes** **How this document
                                                  uses it**
  ----------------------- ----------------------- -----------------------
  Page 1, Sections        Problem statement,      Product vision, booking
  1.2--1.4                goals and scope         promise and platform
                                                  boundaries.

  Page 2, Section 2.1     Student, driver,        Role-specific
                          operator admin and      information
                          super admin roles       architecture and
                                                  dashboards.

  Pages 3--5, Sections    Accounts, trips, seat   Student booking
  3.1--3.5                selection, payments,    journey, seat states,
                          tickets and boarding    checkout and digital
                          requirements            ticket screens.

  Page 4, FR-12--FR-18    Bus seat layout, seat   Seat-map design and
                          status, ten-minute      payment interface
                          lock, server-side fare  rules.
                          calculation and         
                          Paystack                

  Page 5, FR-19--FR-29    Payment verification,   Payment outcomes,
                          idempotency,            ticket design and
                          refund/flagged states,  driver scanner target.
                          QR tickets and driver   
                          scanner status          

  Page 6, FR-30--FR-36    Operator manifest,      Operator dashboard and
                          printing, operator      future integrations.
                          portal, SMS and GPS     
                          tracking status         

  Pages 6--7,             Reliability,            Responsive design,
  NFR-1--NFR-10           performance,            motion restraint,
                          resilience, usability,  accessibility and
                          accessibility,          performance targets.
                          scalability and         
                          portability             

  Pages 7--8,             Authentication, roles,  Security and privacy
  SEC-1--SEC-11           rate limits,            implementation checks.
                          validation, webhook     
                          security, HTTPS and     
                          privacy                 

  Page 8, Section 6       Seat uniqueness, lock   Critical business rules
                          expiry, GHS/pesewas,    and state handling.
                          booking confirmation    
                          and ticket rules        

  Page 9, Sections 7--8   Data entities and       Data honesty and
                          external interfaces     API/integration
                                                  guidance.

  Page 10, Sections 9--10 Technology stack and    Architecture baseline
                          deployment requirements and performance
                                                  guidance.

  Page 11, Section 11     Acceptance criteria and Release test matrix.
                          testing                 

  Pages 11--12, Sections  Risks, out-of-scope     Roadmap, operational
  12--13                  items and sprint        caution and scope
                          delivery plan           boundaries.
  -----------------------------------------------------------------------

# Appendix B. Decisions to confirm before implementation

-   Confirm whether MOVA is the final product name and whether UCC
    branding approval is required.

-   Confirm whether the website is strictly the operator portal plus
    public landing/search pages, while students and drivers use Flutter,
    as specified---or whether a student web experience is also desired.

-   Confirm the actual operator identity, supported routes, origin
    rules, fares, bus configurations and trip data source.

-   Confirm whether the design should include a dark-mode theme in the
    first release.

-   Confirm the actual status of each Planned feature against the
    current repository before presenting it as available.

-   Confirm the final hosting/domain, payment account configuration,
    privacy notice and support contact.
