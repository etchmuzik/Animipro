# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Mobile-first is non-negotiable.** Every UI change must satisfy [MOBILE.md](./MOBILE.md). Phones (animators, sales agents, guests) are the primary surface — desktop is the secondary experience. `tests/mobile-hygiene.test.ts` enforces the most common rule (`grid` declarations need a mobile base); the rest is on the reviewer.

> Note: a `~/CLAUDE.md` may appear in context describing a Swift/iOS app. That is an unrelated global template and does **not** apply here. This project is a Next.js web app.

## Project

AnimaPro — a demo SaaS platform for managing hotel animation teams at Egyptian resorts. It is a **front-end-only static-export Next.js app**: no backend, no auth, no live database. All domain data is hard-coded in memory; the app simulates a multi-tenant ERP by switching between demo users and hotels client-side.

## Commands

```bash
npm run dev            # dev server at localhost:3000 (Turbopack)
npm run build          # production build → static export into out/
npm run lint           # next lint

npm test               # run full Vitest suite once
npm run test:watch     # watch mode
npm run test:coverage  # coverage (gated on lib/task-state, media-store, reminders)

# Single file / single test:
npx vitest run lib/reminders.test.ts
npx vitest run -t "fires both the 15-min and 5-min reminders"
```

Test scripts are prefixed with `TZ=Africa/Cairo` — the timezone is load-bearing for the `gcFired` regression test (see Reminders below). Run individual `npx vitest` invocations with that prefix too if a TZ-sensitive test is involved.

The app entry point lives at `/platform` (`app/platform/page.tsx`), not `/`. When testing features in the browser, navigate there.

## Architecture

### Static export, no server
`next.config.js` sets `output: 'export'` with `images.unoptimized`. There are no API routes, no server components doing data fetching, no middleware. The build emits `out/`, which Netlify serves (`netlify.toml`, SPA redirect to `/index.html`). Anything requiring a server (real auth, a database, server push) is out of scope by design.

### Single client shell switch-renders modules
`app/platform/page.tsx` is the whole application shell. It is one large `'use client'` component that owns all top-level state (`currentUser`, `selectedHotelId`, `activeSection`, search) and **switch-renders** one of ~11 module components from `components/modules/*` based on `activeSection`. There is no client router for in-app navigation — section changes are state changes. Sidebar, Topbar, MobileNav, and the reminder banner wrap the active module.

### Demo identity: user + hotel switching, no login
There is no authentication. The Topbar user picker swaps `currentUser` between the entries in `DEMO_USERS` (`lib/roles.ts`) — one user per role. Switching a user resets the company/hotel selection and the active section. This is the mechanism for exercising role-specific behavior: to see an animator's view, switch to an ANIMATOR/ENTERTAINER/LIFEGUARD/KIDS_CLUB user.

### Role & permission system (level-based)
`lib/roles.ts` is the authority model. Each role has a numeric `level` where **1 = highest authority (SUPER_ADMIN), 5 = lowest (ANIMATOR/ENTERTAINER/LIFEGUARD/KIDS_CLUB)**. Access checks use `<=` against a section's minimum level: `canAccess(role, section)` returns true when `userLevel <= SECTION_MIN_LEVEL[section]`. `getAllowedSections()` drives which nav items render; `getPermissions()` returns boolean capability flags. When adding a section or gating a feature, wire it through these functions rather than checking roles inline.

### Two data layers — read carefully before changing state
1. **Immutable in-memory mock data** (`lib/mock-data.ts`, ~700 lines): the entire domain (companies, hotels, teams, animators, schedule entries, assignments, events, announcements, leave, performance) as exported `const` arrays plus `getHotelX(hotelId)` selector helpers. Treat this as a read-only fixture — modules filter it by `hotelId`. It resets on every reload.
2. **Runtime overlay persistence** (`lib/task-state.ts` + `lib/media-store.ts`): per-task runtime state (started/completed timestamps, proof references) layered *on top of* the immutable mock data, keyed by `${kind}:${id}`. `task-state` persists JSON to **localStorage**; proof blobs (photo/video) go to **IndexedDB** via `media-store` (localStorage can't hold video). `effectiveStatus(kind, id, originalStatus)` merges the two: a local COMPLETED/IN_PROGRESS overlay wins over the mock data's status. This split is the key non-obvious thing — a card's displayed status is mock-data status *unless* the user has acted on it locally.

`task-state` exposes a `subscribe()`/`emit()` pub-sub so multiple cards (and the reminder scheduler) re-read after a mutation; cross-tab sync rides the `storage` event. Components consume it via `useState(() => getTaskState(...))` + a `subscribe` effect — see `components/task-card-actions.tsx`, the reusable Start/Complete + proof-upload widget dropped into schedule, assignment, and event cards.

### Reminders (client-side timers only)
`lib/reminders.ts` schedules browser notifications at 15 and 5 minutes before each activity using `setTimeout`. Because there is no server, reminders fire **only while the tab/PWA is alive** — this is an accepted architectural limit, not a bug. `components/upcoming-banner.tsx` shows a live in-app countdown for items within the window. The scheduler skips already-started/completed tasks and uses a localStorage "fired" map to avoid double-firing across reloads.

Timezone caveat: the fired-map keys embed each item's **local** date (from `parseDateTime`, which builds local-time Dates). `gcFired`'s cutoff must therefore also be computed in local time (`localDateStr`), not UTC — a UTC cutoff drifts a day near midnight in Egypt (UTC+2/+3) and re-fires reminders. The `tests/timezone-gcfired.test.ts` regression test runs under `TZ=Africa/Cairo` to lock this in.

## Conventions

- **Path alias:** `@/*` maps to the repo root (`tsconfig.json`). Import as `@/lib/...`, `@/components/...`.
- **Modules** live in `components/modules/<section>.tsx`, one per section, each taking `hotelId`/`searchQuery` props and filtering mock data. **UI primitives** are in `components/ui/` (shadcn-style: button, card, badge, input, progress). **Layout** chrome is in `components/layout/`.
- **Testing:** Vitest + jsdom + `fake-indexeddb` (`vitest.setup.ts` resets IndexedDB and localStorage per test). Note that fake-indexeddb under jsdom does **not** preserve `Blob` instances through structured clone — assert the store contract (record persists / retrievable by id), not byte fidelity, in unit tests. Coverage focuses on the three `lib/` logic files; the React components and mock data are not unit-tested.
- **Mobile/PWA:** the shell uses `height: 100dvh` (dynamic viewport) and a bottom `MobileNav`; `manifest.json` + icons make it installable. `next-pwa` is listed as a dependency but is **not** wired into `next.config.js`, and no service worker is registered — installability comes from the manifest alone, and reminders use in-page timers (above), not push. `MOBILE_APP.md` documents Capacitor App Store/Play Store packaging, but it is forward-looking/unbuilt (no `@capacitor/*` deps or native dirs exist) and its "offline caching / service worker" claims do **not** reflect the current build.
