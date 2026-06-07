# Animipro — Mobile App Guide

## Strategy: Capacitor bundled app

The iOS and Android apps **bundle the app's own UI** (a static export of the
`/platform` workspace + login) and run it locally, authenticating against Supabase
via the browser SDK. This is a real installed app — not a webview pointed at the
website. The marketing site stays separate on `animipro.online`.

> One codebase, two build targets. `NEXT_PUBLIC_NATIVE=1` switches the build to
> static export + client auth (no server components / middleware / server
> actions). The web build is unchanged. Spec:
> `docs/superpowers/specs/2026-06-07-native-app-shell-design.md`.

### Build the native app

```bash
npm run build:native      # native static export + cap sync
npm run cap:ios           # open Xcode → Run
npm run cap:android       # open Android Studio → Run (needs JDK 17/21)
```

Unlike the old hosted-URL model, you DO rebuild (`build:native`) to ship UI
changes — the app runs bundled assets, not the live site.

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

Because the app bundles its own UI, **you must run `npm run build:native` to ship
UI changes** — the native apps run the bundled `out/` snapshot, not the live site.
`npm run cap:sync` is only needed when `capacitor.config.ts` or plugins change
without a UI rebuild.

### Testing against a local dev server

For quick iteration on a physical device, run `npm run dev` and point the device's
browser at `http://<your-LAN-IP>:3000`. The bundled app itself does not hot-reload
from the dev server — use the browser for development, then `build:native` for a
native build.

## Offline behavior

Because the app runs bundled assets locally, the UI loads without a network
connection. API calls to Supabase still require connectivity. True offline data
access (caching query results) is **not** implemented; out of scope.

## Building for the stores

**iOS:** `npm run cap:ios` → in Xcode set Team + Bundle Identifier
(`online.animipro.app`) → Product → Archive → distribute to App Store Connect.

**Android:** `npm run cap:android` → Build → Generate Signed Bundle/APK →
upload to Google Play Console.

> **Android build note:** Gradle must run on JDK 17 or 21. If the build fails with
> "Unsupported class file major version", set the Gradle JDK to 17/21 in
> Android Studio (Settings → Build Tools → Gradle) or via `JAVA_HOME`.

### ⚠️ Apple Guideline 4.2 (Minimum Functionality)

Apple can reject apps that are "just a website in a wrapper." The bundled-app
approach significantly mitigates this risk: the app ships its own UI assets,
uses native plugins (SplashScreen, StatusBar), and authenticates directly against
Supabase via the browser SDK rather than loading a remote URL. Google Play is far
more lenient on this point.

## Cost summary

| Item | Cost |
|---|---|
| Apple Developer Account | $99/year |
| Google Play Developer Account | $25 one-time |
| Capacitor | Free (open source) |
| **First year total** | **~$124** |
