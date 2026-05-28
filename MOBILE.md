# Mobile-first standards for AnimaPro

This is a phone-first product. Most of our users (animators, sales agents, door scanners, hotel guests) are on a phone — desktop is the secondary experience. Every UI change must satisfy the checklist below.

If you can't tick every box at **360 × 640** (iPhone SE class) and **390 × 844** (iPhone 13 mini class), it ships broken — push back, don't ship.

---

## The checklist

### 1. Viewport baseline
- Design and test at **360 × 640 first**. Scale up; never the other way around.
- Verify in Chrome DevTools mobile preset before merging.

### 2. Grid rule (enforced by a smoke test)
- Every multi-column grid declares a mobile base. Bad: `lg:grid-cols-3`. Good: `grid-cols-1 lg:grid-cols-3`.
- For dense tile clusters, `grid-cols-2` is fine on phone — better than 1 if cells stay readable.
- `tests/mobile-hygiene.test.ts` fails the build if a `md:`/`lg:`/`xl:` grid lacks a mobile base on the same line.

### 3. Touch targets
- Anything tappable is **≥ 44 × 44 px**. Use `min-h-11 min-w-11` when the visible element is smaller (icon-only buttons, status dots used as toggles).
- Never use `text-mini` / `text-micro` / `text-tiny` as the *only* affordance for a tap target — pair with a 44-px hit area.

### 4. Tables → cards
- Tabular layouts collapse to stacked cards below `md:`. Never horizontal-scroll tables on phone.
- Roster, leave-requests, sales-log: card stack on phone, table on desktop. Same data; different presentation.

### 5. Recharts mobile rules
- Wrap charts in `<ResponsiveContainer>` with explicit `height` (mobile may need a smaller `height` than desktop).
- `margin.left` is mobile-hostile. Use `useIsDesktop()` from `lib/use-media-query.ts` to swap mobile vs desktop margins.
- `YAxis width ≤ 64` on mobile. Default 80 leaves ~280 px for a bar plot on a 390-px phone.
- Tick `fontSize` ≤ 10 on mobile.

### 6. Bottom-nav clearance
- Any `<main>` under the platform shell declares `pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))]` (or equivalent) to clear the 60-px mobile nav + ~34-px iPhone notch + breathing room.
- Anything `position: fixed` to the bottom uses `padding-bottom: env(safe-area-inset-bottom)`.

### 7. Dropdowns / popovers
- Cap width at `max-w-[calc(100vw-1.5rem)]` and anchor with `right-3` / `left-3` so they never overflow.
- Sheets / mobile dialogs slide from the bottom (`items-end sm:items-center`) — don't force a centered dialog on a phone.

### 8. Safe areas
- `viewport-fit=cover` (already set in `app/layout.tsx`).
- Respect `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` for fixed top/bottom elements.

### 9. Text sizes
- Body content ≥ **13 px** (`text-13`).
- `text-tiny` (9), `text-micro` (10), `text-mini` (11) are reserved for **tabular labels next to a big number** (e.g. "Today's Activities" above a 24-px count). Never for paragraphs.
- Long numbers wear `tabular-nums` to stop them dancing when they update.

### 10. PWA install prompt
- Every top-level route mounts `<PWAInstallPrompt />` as the last child of its root element.
- The component is idempotent — it self-suppresses if standalone or recently dismissed.

### 11. Service worker
- Lives at `public/sw.js` (hand-rolled, no next-pwa — see the file's header for why).
- Registration is centralized in `components/pwa-install-prompt.tsx` — don't add per-route registration.
- Bump `CACHE_VERSION` when you ship a breaking change to the shell.

### 12. Verify before merge
- Chrome DevTools mobile preset at 360 × 640 *and* 390 × 844.
- Tap-through every interactive element with the mouse-as-finger.
- If anything horizontally scrolls (`<body>` has horizontal overflow) or hides behind the bottom nav, it ships broken.

---

## Reusable helpers

- `useIsDesktop()` — `lib/use-media-query.ts`. SSR-safe `(min-width: 768px)` flag for runtime values CSS can't reach (Recharts margins, "expanded by default" attrs).
- `<ChartSection>` inside `components/modules/dashboard.tsx` — collapsible-on-mobile wrapper around a Recharts card. Reuse when adding new charts to other modules.
- `<PWAInstallPrompt />` — `components/pwa-install-prompt.tsx`. Handles iOS guide + `beforeinstallprompt` + 24-h dismiss cooldown + SW registration. Mount it; don't re-implement.

## Patterns to avoid

- Centered modals on phone — use a bottom-sheet (`items-end sm:items-center`).
- Horizontal-scrolling tables on phone — collapse to a card list at `< md`.
- Bento layouts with one `lg:col-span-2` orphan on mobile — find a grid that stacks cleanly.
- "Hover-only" affordances — touch has no hover. Show the affordance, don't reveal it on hover.
- Sticky / fixed sub-elements that pile up on small screens — every sticky element costs vertical real estate the user already needs.

---

*Every UI change in this repo must satisfy this file. The smoke test in `tests/mobile-hygiene.test.ts` catches the most common regression (grid-without-base). Everything else is on the reviewer.*
