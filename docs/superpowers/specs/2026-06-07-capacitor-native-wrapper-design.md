# Capacitor Native Wrapper for AnimaPro — Design

**Date:** 2026-06-07
**Status:** Approved (design); pending implementation plan
**Strategy:** Capacitor → hosted URL (native shell loads the live deployed site)

---

## 1. Problem & context

AnimaPro began as a front-end-only static-export Next.js demo. `MOBILE_APP.md`
documented an App Store / Play Store path that wrapped the static `out/` export in
a Capacitor shell (`webDir: 'out'`).

That plan is now **architecturally stale**. The app has moved past static export:

- `next.config.js` no longer sets `output: 'export'` (only a stale *comment*
  referencing it remains). The build is now a standard Next.js **server build**.
- `app/platform/page.tsx` is a **server component**; the app uses **server-side
  Supabase** (`lib/supabase/server.ts` via `@supabase/ssr`, `cookies()`,
  `next/headers`) and **middleware** (`lib/supabase/middleware.ts`).
- The `out/` directory still present in the repo is **leftover/stale** from the
  pre-backend era and must not be used as the Capacitor web root.

Server components, middleware, and cookie-based Supabase auth cannot be statically
exported — they render per-request on a Node server. Therefore the original
`webDir: 'out'` approach would wrap a broken app.

**Goal of this work:** produce buildable native iOS and Android projects that open
in Xcode / Android Studio and load the live production site, without refactoring
the app's server-rendered architecture.

## 2. Chosen approach: hosted-URL Capacitor shell

The native apps are thin Capacitor shells. Each loads `https://animipro.online/`
in a native webview (WKWebView on iOS, WebView on Android). The Next.js server
(server components, middleware, Supabase SSR auth) runs unchanged on its existing
Hostinger deployment. The native layer contributes only native capabilities
(splash screen, status bar styling) — no app logic.

```
┌─ iOS (.xcworkspace) ─┐   ┌─ Android (gradle) ─┐
│   WKWebView          │   │   WebView          │
│      ↓ loads         │   │      ↓ loads       │
└──── https://animipro.online/ ◄───────────────┘
              ↓ (existing prod, verified live)
   Next.js server-rendered + Supabase auth
```

### Why this approach (vs. alternatives considered)

- **Hosted URL (chosen):** zero refactor; server components + auth keep working;
  fastest viable path. Cost: requires a live HTTPS deployment (already satisfied)
  and carries higher Apple Guideline 4.2 "wrapper" risk (documented, mitigated).
- **Static-export a client-only mobile subset (rejected for now):** most
  app-like / most Apple-friendly, but requires refactoring every server component
  to a client component and moving Supabase to the browser SDK. Largest code
  change — out of scope for "get native projects building."
- **Hybrid bundled shell + remote data (rejected for now):** middle ground, still
  a moderate refactor. Deferred.

### Production URL — verified

`https://animipro.online/` was verified live during design:
- DNS resolves (Hostinger range, e.g. `77.37.50.73`).
- `GET /` → HTTP 200, valid TLS (`ssl_verify_result: 0`).
- `GET /platform` → HTTP 200.

### Dev vs. prod configuration

`capacitor.config.ts` defaults `server.url` to the production URL. A commented dev
block (gated by an env flag) lets a developer point `server.url` at
`http://<LAN-IP>:3000` with `cleartext: true` to test against `npm run dev` on a
physical device. Default behavior is always production; dev is explicit opt-in.

### `webDir` fallback

Capacitor requires a local `webDir`. Because `out/` is stale/broken, we create a
minimal `mobile-shell/` directory containing a single branded `index.html`
("Connecting to Animipro…" splash). This is the local bundle Capacitor copies; in
the hosted-URL model the webview immediately navigates to `server.url`, so this
file is only seen transiently or when the live URL is unreachable (e.g. offline).

## 3. App identity (permanent — baked at `cap init`)

| Field | Value |
|---|---|
| App ID (bundle identifier) | `online.animipro.app` |
| App name | `Animipro` |
| Background color | `#0f1729` (from `public/manifest.json`) |
| Theme color | `#0e7490` (from `public/manifest.json`) |

App ID rationale: matches the owned domain `animipro.online` reversed; permanent
once published to the stores.

## 4. Components & files

### Created

| Path | Purpose |
|---|---|
| `capacitor.config.ts` | App ID, name, `server.url` → prod, commented dev block, plugin config (SplashScreen + StatusBar using bg `#0f1729` / theme `#0e7490`) |
| `mobile-shell/index.html` | Minimal offline/splash fallback used as `webDir` |
| `assets/icon-only.png` | 1024×1024 PNG **rasterized from `public/icons/icon-512x512.svg`** (SVG is vector → crisp at 1024, no upscaling artifacts) |
| `assets/splash.png` | 2732×2732 splash on `#0f1729` (generated; no source splash exists) |
| `ios/` | Generated native iOS project (`npx cap add ios`) |
| `android/` | Generated native Android project (`npx cap add android`) |

### Modified

| Path | Change |
|---|---|
| `package.json` | Add Capacitor deps + convenience scripts (`cap:sync`, `cap:ios`, `cap:android`) |
| `.gitignore` | Ignore native build artifacts (`ios/App/Pods`, `android/.gradle`, `android/app/build`, `android/build`, `ios/App/build`, `.DS_Store`) |
| `MOBILE_APP.md` | Rewrite to the hosted-URL reality: correct the stale `output:'export'` and offline-caching claims; document the Apple Guideline 4.2 risk + mitigation |

### Dependencies added

Runtime: `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`,
`@capacitor/splash-screen`, `@capacitor/status-bar`.
Dev: `@capacitor/assets`.

Deferred (YAGNI): `@capacitor/push-notifications`, `@capacitor/haptics`,
`@capacitor/badge`.

## 5. Build sequence

1. `npm install` the Capacitor dependencies.
2. `npx cap init Animipro online.animipro.app --web-dir=mobile-shell`.
3. Write `capacitor.config.ts` (hosted-URL + dev block + plugins).
4. Create `mobile-shell/index.html`.
5. Rasterize `public/icons/icon-512x512.svg` → `assets/icon-only.png` (1024×1024);
   generate `assets/splash.png` (2732×2732 on `#0f1729`). Tooling note: `sips`
   cannot read SVG. The implementation plan must pick a working rasterizer
   (candidates, in preference order: macOS `qlmanage`/`rsvg-convert` if present,
   else a one-off `npx sharp`/`@resvg/resvg-js` invocation, else fall back to
   upscaling `public/icons/icon-512x512.png` with `sips`). The plan must verify
   the produced PNG is genuinely 1024×1024 before running `capacitor-assets`.
6. `npx cap add ios` and `npx cap add android`.
7. `npx capacitor-assets generate` (writes icons/splash into both platforms).
8. `npx cap sync`.
9. Update `.gitignore`, add npm scripts, rewrite `MOBILE_APP.md`.
10. Verify: `npx cap open ios` opens a buildable Xcode workspace pointed at prod;
    confirm `capacitor.config.ts` values and that Android Gradle sync succeeds.

## 6. Error handling

- **Offline / unreachable URL:** the webview falls back to `mobile-shell/index.html`
  (branded splash). True offline app behavior would require wiring the existing
  `public/sw.js` service worker — explicitly **out of scope** here.
- **Apple Guideline 4.2 ("Minimum Functionality") risk:** loading a website in a
  wrapper can be rejected. Mitigation, documented in `MOBILE_APP.md`: ship native
  plugins (SplashScreen + StatusBar already qualify minimally) and a real backend
  (already live). This is **flagged, not solved** — submission is out of scope.

## 7. Testing & verification

- Native projects are not unit-testable via the existing Vitest suite (which
  covers `lib/` logic only). No new Vitest tests are added; existing tests are
  untouched.
- Verification = the native projects **compile and launch**, loading the live
  site:
  - iOS: `npx cap open ios` → Xcode workspace opens, builds, launches in simulator,
    webview loads `https://animipro.online/`.
  - Android: Gradle sync succeeds; project builds; webview loads the live site.
- `capacitor.config.ts` is asserted to contain the correct App ID, name, and
  `server.url`.

## 8. Toolchain (verified present)

Node v22.22.3, npm 10.9.8, Xcode 26.0.1, CocoaPods 1.16.2, Android SDK present.
No environment blockers.

## 9. Out of scope (YAGNI guardrail)

Explicitly **not** part of this work:

- Push notifications, haptics, app badge plugins.
- App Store / Play Store submission, code signing, provisioning profiles.
- Refactoring server components → client components.
- Static-export or client-only mobile build variants.
- Fixing / wiring the `public/sw.js` service worker for offline.

This work delivers **buildable native iOS + Android projects pointed at the live
production site — nothing more.**
