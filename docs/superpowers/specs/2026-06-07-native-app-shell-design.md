# AnimaPro Native App Shell (True-Hybrid) — Design

**Date:** 2026-06-07
**Status:** Approved (design); pending implementation plan
**Supersedes (strategically):** the hosted-URL approach in
`2026-06-07-capacitor-native-wrapper-design.md`. The Capacitor native projects
from that work are **kept and reused**; only the *loading strategy* changes
(bundled UI instead of remote website).

---

## 1. Problem & goal

PR #1 shipped Capacitor apps that load the live website (`server.url =
https://animipro.online`) in a webview — a "website in a wrapper." The product
owner wants a **real, installed app clients use**, not a mirror of the marketing
site.

**Goal of this round:** turn the iOS/Android apps into a genuine bundled
application that opens to a native **login**, then into the existing **`/platform`
workspace** (the 13 client-facing modules), authenticating against Supabase
client-side. Marketing pages (`/`, `/careers`, `/partners`) and the guest surface
are excluded.

**Explicitly deferred to later, separate efforts:** wiring the 13 modules to live
Supabase data (they stay on mock data for now), the guest surface, push
notifications, offline data sync, and App Store / Play submission.

## 2. Key facts from the codebase (what makes this tractable)

- The **13 platform modules are already client components** (`'use client'`) and
  read **mock data** (`lib/mock-data.ts`) — none query Supabase directly. They
  need **no changes** for this work.
- A **Supabase browser SDK already exists**: `lib/supabase/client.ts` (anon key +
  RLS). A bundled app can authenticate and (later) query data directly with it.
- `lib/auth.ts` `getCurrentUser()` already maps Supabase → the app's `AppUser`
  shape (`lib/roles.ts`); "the shell barely changes — we just feed it a real
  user." This mapping ports to the client almost verbatim.
- What blocks static export today, all in the **auth seam** (not the modules):
  1. `middleware.ts` gates `/platform` server-side — middleware cannot exist in a
     static export.
  2. `lib/auth.ts` is server-only (`cookies()` via `lib/supabase/server.ts`).
  3. `app/platform/page.tsx` and `app/login/page.tsx` are server components.

## 3. Approach: one codebase, two build targets (env-flagged)

A single Next.js app with a build-time flag `NEXT_PUBLIC_NATIVE`:

- **Web build (default — `NEXT_PUBLIC_NATIVE` unset):** unchanged. Server
  components, middleware, marketing pages, deployed on `animipro.online`. This is
  the safety guarantee: the live web app's behavior does not change.
- **Native build (`NEXT_PUBLIC_NATIVE=1`):** `next.config.js` sets
  `output: 'export'` (+ `images.unoptimized`); middleware is excluded;
  `/platform` and `/login` render client-side with a client auth guard. The
  exported static bundle (`out/`) is what Capacitor ships as `webDir`.

Capacitor config for native drops `server.url` and uses the bundled `webDir`, so
the app runs **its own code locally** and reaches Supabase only for auth (and,
later, data) — a true hybrid app, not a web wrapper.

Single source of truth for the flag: `lib/native.ts` exporting
`IS_NATIVE = process.env.NEXT_PUBLIC_NATIVE === '1'`.

## 4. The auth seam (the only real refactor)

Each server-side concern gets a client path, gated so the web build is untouched.

| Concern | Web (today, unchanged) | Native (new) |
|---|---|---|
| Route gate | `middleware.ts` (`updateSession`) | Middleware excluded from export; a client `<AuthGuard>` redirects to `/login` when there is no session |
| User resolution | `lib/auth.ts` `getCurrentUser()` (server, `cookies()`) | `getCurrentUserClient()` in `lib/auth-client.ts` — same Supabase→`AppUser` mapping via `lib/supabase/client.ts` |
| Platform entry | `app/platform/page.tsx` (server component) | Under native: a client path that calls `getCurrentUserClient()` and renders the same `PlatformShell` |
| Login | `app/login/page.tsx` (server shell) + client `login-form.tsx` | The form authenticates via the browser SDK `signInWithPassword` and routes to `/platform` |

The 13 modules and `PlatformShell`'s rendering contract do not change — they still
receive an `AppUser`; native simply resolves it client-side.

## 5. Files

### New

| Path | Responsibility |
|---|---|
| `lib/native.ts` | `IS_NATIVE` flag (single source of truth) |
| `lib/auth-client.ts` | `getCurrentUserClient(): Promise<AuthedUser \| null>` — browser-SDK twin of `getCurrentUser`, identical `AppUser` mapping |
| `components/auth/auth-guard.tsx` | Client component: resolves session; redirects to `/login` if absent; renders children when authed; shows a loading state while resolving |
| `lib/auth-client.test.ts` | Unit tests: mapping parity with `getCurrentUser`; null when unauthenticated |

### Modified (native path guarded by `IS_NATIVE`; web path preserved)

| Path | Change |
|---|---|
| `next.config.js` | When native: `output: 'export'`, `images.unoptimized: true`, `trailingSlash` as needed for static hosting in the webview |
| `app/platform/page.tsx` | Under native, delegate to a new client entry `app/platform/platform-native.tsx` (`'use client'`, wraps `PlatformShell` in `<AuthGuard>` + `getCurrentUserClient()`). The server page returns `<PlatformNative />` when `IS_NATIVE`, else its current server-rendered path. A server component *can* render a client child, so the flag-branch is a clean early return — no server code runs in the native branch because the export build tree-shakes the unused server path and the page itself does no `cookies()` work before the branch |
| `app/login/login-form.tsx` | Ensure it signs in via the browser SDK and redirects to `/platform` (works in both builds) |
| `capacitor.config.ts` | Native: bundled `webDir` (drop `server.url`). Keep the hosted-URL block documented/commented for fallback |
| `package.json` | Add `build:native` (sets `NEXT_PUBLIC_NATIVE=1` + `next build` + `cap sync`); keep existing scripts |
| `MOBILE_APP.md` | Document the hybrid (bundled) model, the env flag, and the build:native flow |

### Middleware note

`output: 'export'` fails if `middleware.ts` is active. The native build must
exclude it (handled in the build flow / config). `<AuthGuard>` performs the gate
client-side instead.

### Server-import-leak note

`app/platform/page.tsx` imports `getCurrentUser` (server-only: `cookies()` /
`next/headers`). Even if the native branch returns early, a module-level
server-only import can break `output: 'export'`. The plan must keep the
server-only import out of the native code path — e.g. the native client entry
(`platform-native.tsx`) imports only `getCurrentUserClient`, and the server
page's server-only import is acceptable only if Next's export tolerates it for an
unrendered branch. If the export build rejects it, fall back to a dedicated
native route (e.g. a separate client page) so no server-only module is reachable
from the exported tree. The implementation plan will verify the export build
actually succeeds and adjust if this import leak surfaces.

## 6. Data flow

Native boot → `<AuthGuard>` checks the Supabase session via the browser SDK →
no session → render `/login` → user submits → `signInWithPassword` → session
persisted locally by the SDK → redirect `/platform` → `getCurrentUserClient()`
hydrates the `AppUser` → `PlatformShell` renders the modules (mock data for now).

## 7. Error handling

- **Failed login:** inline form error (existing `login-form` pattern).
- **No session:** `<AuthGuard>` redirects to `/login`.
- **Session resolving:** `<AuthGuard>` shows a brief loading state (avoids a
  flash of the login screen for already-authed users).
- **Offline:** modules still render (mock data is bundled); real auth needs
  network — documented as a known limit (offline data sync is out of scope).

## 8. Testing & verification

- `getCurrentUserClient()` unit-tested by mocking the Supabase browser client and
  asserting the returned `AppUser` matches `getCurrentUser`'s mapping (initials
  derivation, role/hotel/company/team fields, null-when-unauthed).
- `<AuthGuard>` redirect-when-no-session logic unit-tested.
- **Regression guard:** the existing 110 tests must stay green — the web build
  path is unchanged; native changes sit behind `IS_NATIVE`.
- **Native build verification:** `npm run build:native` produces `out/`;
  `cap sync` copies it; the app opens to `/login` in the iOS simulator; a valid
  sign-in reaches `/platform` and renders modules. The web build
  (`npm run build`) still succeeds unchanged.

## 9. Out of scope (YAGNI)

Wiring modules to live Supabase data (modules stay on mock data); the guest
surface; marketing pages in the app; push notifications; offline data sync;
App Store / Play submission, signing, provisioning. Each is a separate effort.

## 10. Relationship to PR #1

PR #1's Capacitor projects, icons, splash, scripts, and the hosted-URL config are
**reused**. This work changes the loading strategy (bundled `webDir` instead of
`server.url`) and adds the client-auth seam. If PR #1 has not merged, this builds
on its branch; if merged, this branches from the updated `main`.
