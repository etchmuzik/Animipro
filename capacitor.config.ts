import type { CapacitorConfig } from '@capacitor/cli';

// ─── Animipro — Capacitor native shell config ────────────────────────────────
//
// Strategy: hosted URL. The native apps load the live deployed site so that
// server components, middleware, and Supabase SSR auth keep working unchanged.
// Spec: docs/superpowers/specs/2026-06-07-capacitor-native-wrapper-design.md

const PROD_URL = 'https://animipro.online';

const config: CapacitorConfig = {
  appId: 'online.animipro.app',
  appName: 'Animipro',
  webDir: 'mobile-shell',
  server: {
    // Production: load the live site in the native webview.
    url: PROD_URL,
    // ── Dev override (opt-in) ──────────────────────────────────────────────
    // To test against `npm run dev` on a physical device, set CAP_DEV=1 and
    // replace the url above with your machine's LAN IP, e.g.:
    //   url: 'http://192.168.1.50:3000',
    //   cleartext: true,
    // Leave production as the default; never ship cleartext.
  },
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
