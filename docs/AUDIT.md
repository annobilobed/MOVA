# MOVA quality audit, 18 November 2026

Checks run against the night-ride redesign:
- **impeccable:** audit and design detector.
- **ui-ux-pro-max:** pre-delivery checklist and quick reference (sections 1–3, 8, 9).
- **axe-core 4:** WCAG 2.2 AA rules plus best practice. 16 screens, light and dark, 375 px and 1366 px wide.
- **design-taste-frontend:** copy lint and performance check, on a production build.
- **webapp-testing:** Python Playwright suite.

## Scores (0–4)

| Area | Score | Evidence |
|---|---|---|
| Accessibility | 4 | No serious or critical axe violations on any audited screen in light or dark. Labelled fields with required markers. Show/hide password. Focus moves to the first invalid field after a failed submit. Visible focus rings. Skip link. Landmarks and heading order. Seat and payment states shown with text and icons, not colour alone. Scrollable tables are focusable named regions. The moving hero has a Pause control (WCAG 2.2.2). Reduced motion stops decorative motion but keeps spinners turning. |
| Performance | 3 | Production first paint 0.18–0.35 s. Total blocking time 0–95 ms. Layout shift ≤ 0.002. No broken requests. The page shell is 166 KB of compressed JS. The lazy 3D scene adds three.js (about 285 KB compressed). It loads only after the page is idle and is skipped on Save-Data, 2G, 3G and low-memory devices, which get an animated SVG instead. The taste skill's JS budget flags this; it is kept because the 3D road is a stated requirement. |
| Theming | 4 | All colours come from semantic tokens. Light (morning) and dark (night) are both checked with axe. A nested `data-theme="dark"` re-resolves the tokens for the hero. The design detector reports `[]`. |
| Responsive | 4 | No horizontal scroll at 375 px portrait or 740 px landscape on public pages. Wide tables scroll inside their own region. Phone hero frames the coach between the copy and the search. Touch targets are at least 44 px except inline text links (an allowed exception). |
| Anti-patterns | 4 | Detector clean. No gradient text, eyebrow labels, emoji icons or hard offset shadows. One accent (amber) for actions. |

## What changed in this pass

- **Contrast:** light-theme route text darkened to #9a5b00, and the theme switcher's active state set to amber with ink text.
- **Structure:** home-page sections moved inside `<main>`, a results heading added on /trips, and a main landmark and heading added to the signed-in loading state.
- **Tap targets:** the menu, swap, show-password, "All trips"/"All tickets", back link and Release seat are all at least 44 px tall. Footer links are 32 px, above the 24 px WCAG minimum.
- **Signed-out session check:** `/api/auth/me` now answers 200 with `user: null`, so public pages log no failed request.
- **Slow connections:** trip links no longer prefetch, saving data on 3G.
- **3D bundle:** the drei dependency is removed and the stars are drawn in place, leaving one fewer library to maintain. The bundle is about the same size (1540 → 1538 KiB parsed).

## Not checkable here

- Real-device GPU performance of the 3D scene (measured with SwiftShader on the CPU).
- Screen readers by ear (axe and semantics only).
- Dynamic Type at OS level (browser zoom only).
