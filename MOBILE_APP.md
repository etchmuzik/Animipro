# Animipro — Mobile App Guide

## Strategy: Capacitor hosted-URL shell

The iOS and Android apps are thin [Capacitor](https://capacitorjs.com/) shells
that load the **live deployed site** (`https://animipro.online/`) in a native
webview. The Next.js server (server components, middleware, Supabase SSR auth)
runs unchanged on its existing deployment — the native layer only adds plugins
(SplashScreen, StatusBar).

> This replaces the earlier static-export plan (where Capacitor bundled the compiled
> `out/` directory), which became incompatible once the app gained server components
> + server-side Supabase auth.
> Design rationale: `docs/superpowers/specs/2026-06-07-capacitor-native-wrapper-design.md`.

## App identity

| Field | Value |
|---|---|
| App ID | `online.animipro.app` |
| App name | `Animipro` |
| Production URL | `https://animipro.online` |
| Background / theme | `#0f1729` / `#0e7490` |

## Prerequisites

- macOS with Xcode 15+ (iOS), Android Studio (Android), Node 18+.
- Capacitor 8: iOS uses Swift Package Manager (no CocoaPods). The iOS project is
  `ios/App/App.xcodeproj` — there is no `.xcworkspace`.

## Day-to-day workflow

```bash
# Regenerate icons/splash from the brand SVG (only when art changes).
# The --ios --android flags scope generation to NATIVE platforms only.
# Do NOT omit them: the unscoped command also runs PWA generation, which
# rewrites public/manifest.json and deletes public/icons/*.png.
node scripts/make-app-icon.mjs
npx capacitor-assets generate --ios --android --iconBackgroundColor '#0f1729' --splashBackgroundColor '#0f1729'

# Sync config + plugins into the native projects
npm run cap:sync

# Open the native IDEs
npm run cap:ios       # Xcode
npm run cap:android   # Android Studio
```

Because the app loads a hosted URL, **you do not rebuild the web app to see
changes** — deploy to `animipro.online` and the native apps pick it up on next
launch. `npm run cap:sync` is only needed when `capacitor.config.ts`, plugins, or
the `mobile-shell` fallback change.

### Testing against a local dev server

To run against `npm run dev` on a physical device, edit `capacitor.config.ts`:
set `server.url` to `http://<your-LAN-IP>:3000` and add `cleartext: true`, then
`npm run cap:sync`. Revert before shipping — never ship cleartext.

## Offline behavior

If the live URL is unreachable, the webview shows `mobile-shell/index.html`
(a branded "Connecting…" splash). True offline app behavior (caching pages for
use without a network) is **not** implemented here; it would require wiring the
existing `public/sw.js` service worker into the bundled shell. Out of scope.

## Building for the stores

**iOS:** `npm run cap:ios` → in Xcode set Team + Bundle Identifier
(`online.animipro.app`) → Product → Archive → distribute to App Store Connect.

**Android:** `npm run cap:android` → Build → Generate Signed Bundle/APK →
upload to Google Play Console.

> **Android build note:** Gradle must run on JDK 17 or 21. If the build fails with
> "Unsupported class file major version", set the Gradle JDK to 17/21 in
> Android Studio (Settings → Build Tools → Gradle) or via `JAVA_HOME`.

### ⚠️ Apple Guideline 4.2 (Minimum Functionality)

Apple can reject apps that are "just a website in a wrapper." Mitigations already
in place: native plugins (SplashScreen, StatusBar) and a real backend (Supabase
auth/DB live on the hosted site). If rejected, the durable fix is the
static-export / client-data mobile variant (see the design doc's rejected
alternatives) — more native behavior, less wrapper. Google Play is far more
lenient on this point.

## Cost summary

| Item | Cost |
|---|---|
| Apple Developer Account | $99/year |
| Google Play Developer Account | $25 one-time |
| Capacitor | Free (open source) |
| **First year total** | **~$124** |
