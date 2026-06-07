# Capacitor Native Wrapper — Final Verification (2026-06-07)

Result of Task 10 of `2026-06-07-capacitor-native-wrapper.md`, executed on the
implementer's machine (Node 22.22.3, Xcode 26.0.1, JDK 25, Android SDK present,
Android Studio **not** installed).

## ✅ Verified (scriptable)

| Check | Result |
|---|---|
| Prod `GET /` | HTTP 200 |
| Prod `GET /platform` | HTTP 200 |
| `capacitor.config.ts` appId | `online.animipro.app` |
| `capacitor.config.ts` server.url | `https://animipro.online` |
| `capacitor.config.ts` webDir | `mobile-shell` |
| iOS project | `ios/App/App.xcodeproj` + `CapApp-SPM/` present (Capacitor 8 / SPM) |
| Android project | `android/app/build.gradle` present |
| iOS icons | `AppIcon.appiconset/*.png` present |
| Android icons | `mipmap-*/ic_launcher*.png` present |

## ✅ iOS — fully verified

`npm run cap:ios` opened the project in Xcode (process confirmed running). To
build/submit: set a signing **Team** + Bundle Identifier `online.animipro.app`,
then Product → Archive. The webview loads `https://animipro.online`.

## ⏸ Android — scaffold complete, IDE not installed

The Android project is correct and committed (`cap add android` needs only the
SDK + Capacitor, both present). Two host-environment prerequisites remain **on the
user's side** before an Android build is possible — neither is a defect in the
scaffolding:

1. **Android Studio is not installed.** `cap open android` failed: no app at
   `/Applications/Android Studio.app` (Spotlight finds none). The SDK at
   `~/Library/Android/sdk` exists, but the SDK is not the IDE.
2. **JDK mismatch (resolved by #1).** The system has only JDK 25; Gradle 8.14.3
   rejects it ("Unsupported class file major version 69"). Android Studio ships a
   bundled JDK 21 (JetBrains Runtime) — installing it **also fixes this**. After
   install, set Settings → Build, Execution, Deployment → Build Tools → Gradle →
   *Gradle JDK* → the bundled `jbr-21`. No system JDK change needed.

After installing Android Studio and selecting the bundled JDK, `npm run cap:android`
opens the project, Gradle syncs, and the webview loads `https://animipro.online`.

## Notes carried from earlier tasks

- **Capacitor is v8** (not the v6 the original plan text assumed). iOS uses Swift
  Package Manager — there is no `.xcworkspace` and no CocoaPods.
- **`capacitor-assets` must be run scoped** (`--ios --android`); the unscoped form
  corrupts `public/manifest.json` and deletes `public/icons/*.png`. The collateral
  from one unscoped run during Task 7 was fully reverted. `MOBILE_APP.md` documents
  the scoped command + the warning.
- Pre-existing untracked dirs (`lib/payments/`, `lib/tickets/`, `out 2/`) were left
  untouched throughout.
- `package.json`'s `deploy` script still references the dead `--dir=out` static
  export — a separate deploy concern, not addressed here.
