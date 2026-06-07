#!/usr/bin/env node
// scripts/build-native.js
// Builds the static-export (Capacitor) bundle.
//
// Because Next.js requires middleware config.matcher to be a static literal
// (no ternary expressions allowed), we cannot conditionally empty the matcher
// at runtime. Instead this script:
//   1. Backs up middleware.ts → middleware.web.ts.bak
//   2. Copies middleware.native.ts → middleware.ts  (empty matcher)
//   3. Runs `next build` with NEXT_PUBLIC_NATIVE=1
//   4. Restores middleware.ts from the backup
//
// This ensures the web build always uses the full matcher and the native build
// never tries to bundle server middleware into the static export.

const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const MW = path.join(ROOT, 'middleware.ts')
const MW_BAK = path.join(ROOT, 'middleware.web.ts.bak')
const MW_NATIVE = path.join(ROOT, 'middleware.native.ts')

function restore() {
  if (fs.existsSync(MW_BAK)) {
    fs.copyFileSync(MW_BAK, MW)
    fs.unlinkSync(MW_BAK)
    console.log('[build-native] middleware.ts restored.')
  }
}

// Always restore on exit (even on error / Ctrl-C)
process.on('exit', restore)
process.on('SIGINT', () => process.exit(1))
process.on('SIGTERM', () => process.exit(1))
process.on('uncaughtException', (err) => { console.error(err); process.exit(1) })

try {
  console.log('[build-native] Swapping in empty-matcher middleware for native build…')
  fs.copyFileSync(MW, MW_BAK)
  fs.copyFileSync(MW_NATIVE, MW)

  console.log('[build-native] Running: NEXT_PUBLIC_NATIVE=1 next build')
  const result = spawnSync('npx', ['next', 'build'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, NEXT_PUBLIC_NATIVE: '1' },
  })
  if (result.status !== 0) {
    throw new Error(`next build exited with status ${result.status}`)
  }

  console.log('[build-native] Build complete. Output is in out/')
} catch (err) {
  console.error('[build-native] Build failed:', err.message)
  process.exitCode = 1
}
// restore() is called via 'exit' handler
