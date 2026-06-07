import type { CapacitorConfig } from '@capacitor/cli';

// ─── Animipro — Capacitor native shell config ────────────────────────────────
//
// Strategy: BUNDLED. The native apps ship the static-export build (`out/`) and
// run the app's own UI locally, authenticating against Supabase via the browser
// SDK. This replaces the earlier hosted-URL strategy (loading animipro.online in
// a webview). Build the bundle with `npm run build:native` before `cap sync`.
// Spec: docs/superpowers/specs/2026-06-07-native-app-shell-design.md

const config: CapacitorConfig = {
  appId: 'online.animipro.app',
  appName: 'Animipro',
  webDir: 'out',
  // ── Hosted-URL fallback (disabled) ─────────────────────────────────────────
  // To revert to loading the live site instead of the bundle, restore:
  //   server: { url: 'https://animipro.online' },
  // and build the web app instead of the native export.
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0f1729',
  },
  android: {
    backgroundColor: '#0f1729',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0f1729',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0f1729',
    },
  },
};

export default config;
