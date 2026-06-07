# Native App Shell (True-Hybrid) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Capacitor iOS/Android apps into a real bundled app that opens to a native login and into the existing `/platform` workspace, authenticating against Supabase client-side — without changing the live web app.

**Architecture:** One Next.js codebase, two build targets switched by `NEXT_PUBLIC_NATIVE=1`. The native build statically exports (`output: 'export'`), excludes middleware, and uses a client-side auth path (browser SDK + `<AuthGuard>`) instead of server components / server actions / middleware. Capacitor ships the exported static bundle as `webDir` (no `server.url`). The 13 platform modules are unchanged (already client-side, mock data).

**Tech Stack:** Next.js 16 (static export), Capacitor 8, `@supabase/ssr` browser client (`getSupabaseBrowserClient`), React 19, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-07-native-app-shell-design.md`

**Branch context:** Builds on `feat/capacitor-native-wrapper` (PR #1). The hosted-URL `capacitor.config.ts` from PR #1 is modified here to use a bundled `webDir`.

**TDD note:** Tasks with real logic (`getCurrentUserClient`, `<AuthGuard>`, client sign-in/out) are TDD (test first). Config/build-flag tasks are verify-after (build succeeds / flag resolves). The existing 110 tests must stay green throughout — they guard the unchanged web path.

---

## File Structure

**New:**
- `lib/native.ts` — `IS_NATIVE` flag, single source of truth.
- `lib/auth-client.ts` — `getCurrentUserClient()`: browser-SDK twin of `lib/auth.ts`'s `getCurrentUser`.
- `lib/auth-client.test.ts` — unit tests for the mapping.
- `app/login/sign-in-client.ts` — `signInClient()` + `signOutClient()` using the browser SDK.
- `components/auth/auth-guard.tsx` — client route gate.
- `components/auth/auth-guard.test.tsx` — guard logic test.
- `app/platform/platform-native.tsx` — `'use client'` native entry: `<AuthGuard>` + `getCurrentUserClient()` → `PlatformShell`.

**Modified (native path behind `IS_NATIVE`; web path preserved):**
- `next.config.js` — conditional `output: 'export'` + `images.unoptimized`.
- `app/platform/page.tsx` — early-return `<PlatformNative/>` when native.
- `app/login/login-form.tsx` — native uses `signInClient`; web keeps the server action.
- `components/layout/topbar.tsx` — native uses `signOutClient`; web keeps the server action.
- `capacitor.config.ts` — native uses bundled `webDir`; hosted-URL block commented for fallback.
- `package.json` — add `build:native`.
- `MOBILE_APP.md` — document the hybrid model.

---

## Task 1: Add the IS_NATIVE flag

**Files:**
- Create: `lib/native.ts`
- Test: `lib/native.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/native.test.ts`:
```typescript
import { describe, it, expect, afterEach, vi } from 'vitest'

describe('IS_NATIVE', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('is true when NEXT_PUBLIC_NATIVE is "1"', async () => {
    vi.stubEnv('NEXT_PUBLIC_NATIVE', '1')
    const { IS_NATIVE } = await import('./native')
    expect(IS_NATIVE).toBe(true)
  })

  it('is false when NEXT_PUBLIC_NATIVE is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_NATIVE', '')
    const { IS_NATIVE } = await import('./native')
    expect(IS_NATIVE).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/native.test.ts`
Expected: FAIL — cannot find module `./native`.

- [ ] **Step 3: Write the implementation**

Create `lib/native.ts`:
```typescript
// ─── Animipro — Native build flag ────────────────────────────────────────────
//
// Single source of truth for "are we building the bundled native (Capacitor)
// app?" Set NEXT_PUBLIC_NATIVE=1 at build time (see `npm run build:native`).
// The web build leaves it unset, so IS_NATIVE is false and all native branches
// are skipped — the live web app is unchanged.

export const IS_NATIVE = process.env.NEXT_PUBLIC_NATIVE === '1'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/native.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/native.ts lib/native.test.ts
git commit -m "feat(native): add IS_NATIVE build flag"
```

---

## Task 2: Client-side current-user resolver

Port `lib/auth.ts`'s `getCurrentUser()` to the browser SDK. Same `AppUser` mapping; reads the session the browser already holds.

**Files:**
- Create: `lib/auth-client.ts`
- Test: `lib/auth-client.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/auth-client.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the browser client module before importing the SUT.
const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('./supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

import { getCurrentUserClient } from './auth-client'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCurrentUserClient', () => {
  it('returns null when there is no authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await getCurrentUserClient()
    expect(result).toBeNull()
  })

  it('returns null when the profile row is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } } })
    mockSingle.mockResolvedValue({ data: null })
    const result = await getCurrentUserClient()
    expect(result).toBeNull()
  })

  it('maps the profile to an AppUser with stored initials', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'sam@hotel.com' } } })
    mockSingle.mockResolvedValue({
      data: {
        id: 'u1', full_name: 'Sam Doe', initials: 'SD',
        role: 'ANIMATION_CHIEF', hotel_id: 'h1', company_id: 'c1', team_id: 't1',
      },
    })
    const result = await getCurrentUserClient()
    expect(result).toEqual({
      id: 'u1', name: 'Sam Doe', initials: 'SD', role: 'ANIMATION_CHIEF',
      hotelId: 'h1', companyId: 'c1', teamId: 't1', email: 'sam@hotel.com',
    })
  })

  it('derives initials from the full name when not stored', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u2', email: 'lee@hotel.com' } } })
    mockSingle.mockResolvedValue({
      data: {
        id: 'u2', full_name: 'Lee Park', initials: null,
        role: 'ANIMATOR', hotel_id: 'h2', company_id: 'c2', team_id: null,
      },
    })
    const result = await getCurrentUserClient()
    expect(result?.initials).toBe('LP')
    expect(result?.teamId).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/auth-client.test.ts`
Expected: FAIL — cannot find module `./auth-client`.

- [ ] **Step 3: Write the implementation**

Create `lib/auth-client.ts`:
```typescript
// ─── Animipro — Auth resolution (client-side) ────────────────────────────────
//
// Browser-SDK twin of lib/auth.ts's getCurrentUser(). Used by the native
// (bundled) build, which has no server to read cookies. Reads the session the
// browser already holds and maps the Supabase profile → AppUser, identically to
// the server resolver so PlatformShell behaves the same in both builds.

'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AppUser } from '@/lib/roles'
import type { UserRole } from '@/lib/mock-data'

export interface AuthedUser extends AppUser {
  email: string
}

export async function getCurrentUserClient(): Promise<AuthedUser | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, initials, role, hotel_id, company_id, team_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const initials =
    profile.initials ||
    profile.full_name
      .split(' ')
      .map((p: string) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ||
    (user.email?.[0]?.toUpperCase() ?? '?')

  return {
    id: profile.id,
    name: profile.full_name || (user.email ?? 'User'),
    initials,
    role: profile.role as UserRole,
    hotelId: profile.hotel_id ?? '',
    companyId: profile.company_id ?? '',
    teamId: profile.team_id ?? undefined,
    email: user.email ?? '',
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/auth-client.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/auth-client.ts lib/auth-client.test.ts
git commit -m "feat(native): client-side getCurrentUserClient (browser SDK)"
```

---

## Task 3: Client sign-in / sign-out

Mirror `app/login/actions.ts` (server action) with a client version using the browser SDK. No `redirect()` (server-only) — callers navigate.

**Files:**
- Create: `app/login/sign-in-client.ts`
- Test: `app/login/sign-in-client.test.ts`

- [ ] **Step 1: Write the failing test**

Create `app/login/sign-in-client.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSignInWithPassword = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
  }),
}))

import { signInClient, signOutClient } from './sign-in-client'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('signInClient', () => {
  it('rejects an invalid email before calling Supabase', async () => {
    const result = await signInClient('not-an-email', 'secret123')
    expect(result.error).toBeTruthy()
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('rejects a too-short password before calling Supabase', async () => {
    const result = await signInClient('a@b.com', '123')
    expect(result.error).toBeTruthy()
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('returns a generic error when credentials are wrong', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    const result = await signInClient('a@b.com', 'secret123')
    expect(result.error).toBe('Wrong email or password.')
  })

  it('returns success (no error) on valid sign-in', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    const result = await signInClient('a@b.com', 'secret123')
    expect(result.error).toBeUndefined()
    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret123' })
  })
})

describe('signOutClient', () => {
  it('calls supabase signOut', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    await signOutClient()
    expect(mockSignOut).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/login/sign-in-client.test.ts`
Expected: FAIL — cannot find module `./sign-in-client`.

- [ ] **Step 3: Write the implementation**

Create `app/login/sign-in-client.ts`:
```typescript
// ─── Animipro — Client auth (native build) ───────────────────────────────────
//
// Browser-SDK twin of app/login/actions.ts. The native (static-export) build has
// no server, so it can't use server actions. Same Zod validation and generic
// error as the server action; navigation is left to the caller (no server-only
// redirect()).

'use client'

import { z } from 'zod'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const credsSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export interface ClientAuthResult {
  error?: string
}

export async function signInClient(email: string, password: string): Promise<ClientAuthResult> {
  const parsed = credsSchema.safeParse({ email, password })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    // Don't leak whether the email exists — generic message.
    return { error: 'Wrong email or password.' }
  }

  return {}
}

export async function signOutClient(): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  await supabase.auth.signOut()
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/login/sign-in-client.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add app/login/sign-in-client.ts app/login/sign-in-client.test.ts
git commit -m "feat(native): client sign-in/sign-out via browser SDK"
```

---

## Task 4: AuthGuard client route gate

Replaces middleware for the native build: resolves the session, redirects to `/login` when absent, renders children when authed.

**Files:**
- Create: `components/auth/auth-guard.tsx`
- Test: `components/auth/auth-guard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/auth/auth-guard.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockGetSession = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: { getSession: mockGetSession },
  }),
}))

import { AuthGuard } from './auth-guard'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthGuard', () => {
  it('redirects to /login when there is no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    render(<AuthGuard><div>secret</div></AuthGuard>)
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'))
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('renders children when a session exists', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    render(<AuthGuard><div>secret</div></AuthGuard>)
    await waitFor(() => expect(screen.getByText('secret')).toBeInTheDocument())
    expect(mockPush).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/auth/auth-guard.test.tsx`
Expected: FAIL — cannot find module `./auth-guard`.

- [ ] **Step 3: Write the implementation**

Create `components/auth/auth-guard.tsx`:
```typescript
// ─── Animipro — Client auth guard (native build) ─────────────────────────────
//
// The native (static-export) build has no middleware to gate /platform. This
// component resolves the Supabase session in the browser, redirects to /login
// when absent, and renders its children once authenticated. A brief loading
// state avoids flashing the login screen for already-authed users.

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type GuardState = 'checking' | 'authed' | 'redirecting'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<GuardState>('checking')

  useEffect(() => {
    let active = true
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (session) {
        setState('authed')
      } else {
        setState('redirecting')
        router.push('/login')
      }
    })
    return () => { active = false }
  }, [router])

  if (state === 'authed') return <>{children}</>

  return (
    <div className="min-h-[100dvh] grid place-items-center bg-background text-foreground">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/auth/auth-guard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/auth/auth-guard.tsx components/auth/auth-guard.test.tsx
git commit -m "feat(native): AuthGuard client route gate"
```

---

## Task 5: Native platform entry

A client entry that wraps `PlatformShell` in `<AuthGuard>` and resolves the user client-side. Keeps server-only imports out of the native path.

**Files:**
- Create: `app/platform/platform-native.tsx`

- [ ] **Step 1: Write the implementation**

Create `app/platform/platform-native.tsx`:
```typescript
// ─── Animipro — Platform entry (native build) ────────────────────────────────
//
// Client twin of page.tsx's server path. Used only in the native (static-export)
// build. <AuthGuard> ensures a session exists; then we resolve the AppUser
// client-side and render the same PlatformShell the web build uses.

'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { PlatformShell } from './platform-shell'
import { getCurrentUserClient, type AuthedUser } from '@/lib/auth-client'

function PlatformNativeInner() {
  const [user, setUser] = useState<AuthedUser | null>(null)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    let active = true
    getCurrentUserClient().then((u) => {
      if (!active) return
      setUser(u)
      setResolved(true)
    })
    return () => { active = false }
  }, [])

  if (!resolved) {
    return (
      <div className="min-h-[100dvh] grid place-items-center bg-background text-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // AuthGuard guarantees a session, but the profile row could be missing.
  if (!user) {
    return (
      <div className="min-h-[100dvh] grid place-items-center bg-background text-foreground p-6 text-center">
        <p className="text-13 text-muted-foreground">
          Your account has no profile yet. Contact your administrator.
        </p>
      </div>
    )
  }

  return (
    <PlatformShell
      initialUser={user}
      canSwitchUser={user.role === 'SUPER_ADMIN'}
    />
  )
}

export function PlatformNative() {
  return (
    <AuthGuard>
      <PlatformNativeInner />
    </AuthGuard>
  )
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit 2>&1 | grep -E "platform-native|auth-guard|auth-client" || echo "no type errors in native files"`
Expected: `no type errors in native files`.

- [ ] **Step 3: Commit**

```bash
git add app/platform/platform-native.tsx
git commit -m "feat(native): native platform entry (AuthGuard + client user)"
```

---

## Task 6: Branch the platform page for native

`page.tsx` returns `<PlatformNative/>` when native, else its current server path. Critical: confirm the static export build tolerates the server-only `getCurrentUser` import; if not, this task documents the fallback.

**Files:**
- Modify: `app/platform/page.tsx`

- [ ] **Step 1: Add the native branch**

In `app/platform/page.tsx`, add these imports after the existing imports:
```typescript
import { IS_NATIVE } from '@/lib/native'
import { PlatformNative } from './platform-native'
```

Then make `PlatformPage` return the native entry first. Replace the function signature line `export default async function PlatformPage() {` and add, as the very first statement inside the function body:
```typescript
export default async function PlatformPage() {
  // Native (bundled) build: resolve the user client-side. No server work runs.
  if (IS_NATIVE) {
    return <PlatformNative />
  }

  // Real path: authenticated user from Supabase.
```
(Leave the rest of the existing function body — the `SUPABASE_CONFIGURED` block and demo fallback — unchanged.)

- [ ] **Step 2: Verify the web build still compiles (regression)**

Run: `npm run build 2>&1 | tail -15`
Expected: build succeeds (web target, no `output: export`). No errors.

- [ ] **Step 3: Verify the export build tolerates this file (the key risk)**

Run: `NEXT_PUBLIC_NATIVE=1 npx next build 2>&1 | tail -30`
Expected: EITHER the export succeeds, OR it errors. If it errors specifically about `cookies`/`next/headers`/server-only usage reachable from `app/platform/page.tsx`, that is the documented "server-import-leak" risk. In that case, report DONE_WITH_CONCERNS and STOP — the controller will decide between (a) moving the server path into a separate server-only module imported lazily, or (b) a dedicated native route. Do NOT force a workaround unprompted.

Note: this step may also surface OTHER files that block export (e.g. other server components, the guest route). Capture the full error list — Task 7 (next.config) and Task 8 may need it. It's expected that the export does not fully succeed until Task 7 sets `output: 'export'` and middleware is handled; the goal of THIS step is specifically to see whether `page.tsx`'s native branch is the blocker or whether it's other files.

- [ ] **Step 4: Commit**

```bash
git add app/platform/page.tsx
git commit -m "feat(native): branch platform page to native entry when IS_NATIVE"
```

---

## Task 7: Conditional static export in next.config.js

**Files:**
- Modify: `next.config.js`

- [ ] **Step 1: Rewrite next.config.js with the native branch**

Replace the entire contents of `next.config.js` with:
```javascript
/** @type {import('next').NextConfig} */
const IS_NATIVE = process.env.NEXT_PUBLIC_NATIVE === '1'

const nextConfig = {
  reactStrictMode: true,
  // Native (Capacitor) build: static export bundled into the app. The web build
  // leaves this undefined and renders server components / middleware as before.
  ...(IS_NATIVE ? { output: 'export' } : {}),
  images: IS_NATIVE
    ? { unoptimized: true }
    : {
        // Guest + dashboard surfaces hot-link Unsplash via the Next optimizer.
        remotePatterns: [
          { protocol: 'https', hostname: 'images.unsplash.com' },
        ],
      },
}

module.exports = nextConfig
```

- [ ] **Step 2: Verify the web build is unchanged (regression)**

Run: `npm run build 2>&1 | tail -8`
Expected: web build succeeds; output is the normal server build (no `out/` export).

- [ ] **Step 3: Verify the native export now produces out/ (or surfaces the next blocker)**

Run: `NEXT_PUBLIC_NATIVE=1 npx next build 2>&1 | tail -30`
Expected: EITHER `out/` is produced, OR an error about `middleware` being incompatible with `output: export` (handled in Task 8), OR a server-only import error (the Task 6 risk). Report exactly which. If it's the middleware error, proceed to Task 8 — that's expected ordering.

- [ ] **Step 4: Commit**

```bash
git add next.config.js
git commit -m "feat(native): conditional static export via NEXT_PUBLIC_NATIVE"
```

---

## Task 8: Exclude middleware from the native build

`output: 'export'` errors if `middleware.ts` is active. Make middleware a no-op under native so export succeeds while the web build keeps full gating.

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Guard the middleware for native**

Replace the entire contents of `middleware.ts` with:
```typescript
// ─── Animipro — Next.js middleware ───────────────────────────────────────────
// Refreshes the Supabase session on every matched request and gates /platform
// behind auth. Delegates to lib/supabase/middleware.ts.
//
// The native (static-export) build has no server, so middleware cannot run —
// the client <AuthGuard> performs the gate instead. We export an empty matcher
// under NEXT_PUBLIC_NATIVE so Next does not attempt to bundle middleware into
// the export.

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const IS_NATIVE = process.env.NEXT_PUBLIC_NATIVE === '1'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: IS_NATIVE
    ? []
    : [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
      ],
}
```

- [ ] **Step 2: Verify the web build still gates (regression)**

Run: `npm run build 2>&1 | tail -8`
Expected: web build succeeds; middleware present (non-empty matcher).

- [ ] **Step 3: Verify the native export now succeeds end-to-end**

Run: `NEXT_PUBLIC_NATIVE=1 npx next build 2>&1 | tail -20 && test -d out && echo "EXPORT OK: out/ produced"`
Expected: `EXPORT OK: out/ produced`. If export still fails with a middleware error, an empty matcher may be insufficient for this Next version — report DONE_WITH_CONCERNS with the error; the fallback is to make the build script move/rename `middleware.ts` during the native build (controller decides).

- [ ] **Step 4: Verify the exported app contains login + platform**

Run: `ls out/login* out/platform* 2>/dev/null && echo "ROUTES EXPORTED"`
Expected: login + platform HTML present + `ROUTES EXPORTED`.

- [ ] **Step 5: Commit**

```bash
git add middleware.ts
git commit -m "feat(native): disable middleware in static-export build"
```

---

## Task 9: Native sign-in in the login form

When native, the form uses `signInClient` + client navigation instead of the server action.

**Files:**
- Modify: `app/login/login-form.tsx`

- [ ] **Step 1: Replace login-form.tsx with a build-aware version**

Replace the entire contents of `app/login/login-form.tsx` with:
```typescript
// ─── Animipro — Login form (client) ──────────────────────────────────────────
'use client'

import { useActionState, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IS_NATIVE } from '@/lib/native'
import { signIn, type AuthActionState } from './actions'
import { signInClient } from './sign-in-client'

export function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/platform'

  // Web build: server action via useActionState (unchanged behavior).
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signIn, {})

  // Native build: client sign-in + client navigation.
  const router = useRouter()
  const [nativeError, setNativeError] = useState<string | undefined>()
  const [nativePending, setNativePending] = useState(false)

  async function handleNativeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNativeError(undefined)
    setNativePending(true)
    const form = new FormData(e.currentTarget)
    const result = await signInClient(
      String(form.get('email') ?? ''),
      String(form.get('password') ?? ''),
    )
    setNativePending(false)
    if (result.error) {
      setNativeError(result.error)
      return
    }
    router.push(next)
  }

  const error = IS_NATIVE ? nativeError : state.error
  const busy = IS_NATIVE ? nativePending : pending

  return (
    <form
      {...(IS_NATIVE ? { onSubmit: handleNativeSubmit } : { action: formAction })}
      className="space-y-4"
    >
      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-mini font-semibold uppercase tracking-wide text-muted-foreground">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@hotel.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-mini font-semibold uppercase tracking-wide text-muted-foreground">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-13 text-destructive font-medium" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={busy} className="w-full h-11 font-semibold">
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in…
          </span>
        ) : 'Sign in'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Verify web build + existing tests unchanged (regression)**

Run: `npm run build 2>&1 | tail -6 && npm test 2>&1 | tail -6`
Expected: web build succeeds; all existing tests pass (still 110+ from earlier tasks).

- [ ] **Step 3: Verify native export still succeeds**

Run: `NEXT_PUBLIC_NATIVE=1 npx next build 2>&1 | tail -8 && test -d out && echo "EXPORT OK"`
Expected: `EXPORT OK`.

- [ ] **Step 4: Commit**

```bash
git add app/login/login-form.tsx
git commit -m "feat(native): client sign-in path in login form"
```

---

## Task 10: Native sign-out in the topbar

`topbar.tsx` uses the `signOut` server action via `<form action={signOut}>`. Native needs a client sign-out.

**Files:**
- Modify: `components/layout/topbar.tsx`

- [ ] **Step 1: Inspect the current sign-out usage**

Run: `grep -n "signOut\|'use client'" components/layout/topbar.tsx`
Expected: shows the `import { signOut } from '@/app/login/actions'`, the `<form action={signOut}>` block (~line 190), and whether the file is `'use client'`.

- [ ] **Step 2: Add the native sign-out branch**

In `components/layout/topbar.tsx`:

(a) Add these imports near the existing imports:
```typescript
import { useRouter } from 'next/navigation'
import { IS_NATIVE } from '@/lib/native'
import { signOutClient } from '@/app/login/sign-in-client'
```

(b) Inside the component body (with the other hooks), add:
```typescript
  const router = useRouter()
  async function handleNativeSignOut() {
    await signOutClient()
    router.push('/login')
  }
```

(c) First read the current sign-out block to capture its exact button markup:
```bash
grep -n -A8 "action={signOut}" components/layout/topbar.tsx
```
Note the existing `<button>`'s exact `className` and inner markup (call it `BTN_MARKUP`). Then replace the existing `<form action={signOut}>…</form>` block with a build-aware version: the web path keeps the server-action form; the native path is a plain button calling `handleNativeSignOut`. Reuse the **exact** className and inner markup you just captured in BOTH branches so styling is byte-identical — do not invent classes:
```tsx
{IS_NATIVE ? (
  <button type="button" onClick={handleNativeSignOut} /* paste BTN_MARKUP className + children here */>
    {t('topbar.signOut')}
  </button>
) : (
  <form action={signOut}>
    {/* the original button, verbatim */}
  </form>
)}
```
The file already uses React hooks, so it is already `'use client'` — confirm with `head -3 components/layout/topbar.tsx`; do not add a duplicate directive.

- [ ] **Step 3: Verify web build + tests (regression)**

Run: `npm run build 2>&1 | tail -6 && npm test 2>&1 | tail -6`
Expected: web build succeeds; tests pass.

- [ ] **Step 4: Verify native export succeeds**

Run: `NEXT_PUBLIC_NATIVE=1 npx next build 2>&1 | tail -8 && test -d out && echo "EXPORT OK"`
Expected: `EXPORT OK`.

- [ ] **Step 5: Commit**

```bash
git add components/layout/topbar.tsx
git commit -m "feat(native): client sign-out path in topbar"
```

---

## Task 11: Point Capacitor at the bundled webDir

Switch `capacitor.config.ts` from hosted-URL to the bundled static export.

**Files:**
- Modify: `capacitor.config.ts`

- [ ] **Step 1: Replace capacitor.config.ts**

Replace the entire contents of `capacitor.config.ts` with:
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

// ─── Animipro — Capacitor native shell config ────────────────────────────────
//
// Strategy: BUNDLED. The native apps ship the static-export build (`out/`) and
// run the app's own UI locally, authenticating against Supabase via the browser
// SDK. This replaces the earlier hosted-URL strategy (loading animipro.online in
// a webview). Build the bundle with `npm run build:native` (sets
// NEXT_PUBLIC_NATIVE=1) before `cap sync`.
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
```

- [ ] **Step 2: Verify config is valid + points at the bundle**

Run: `npx tsc --noEmit --skipLibCheck capacitor.config.ts 2>&1 | head -5; grep -E "webDir: 'out'" capacitor.config.ts && grep -E "server" capacitor.config.ts | grep -v "//" | grep -v "Hosted-URL" || echo "no active server.url — bundled mode confirmed"`
Expected: no tsc errors; `webDir: 'out'` present; `no active server.url — bundled mode confirmed`.

- [ ] **Step 3: Commit**

```bash
git add capacitor.config.ts
git commit -m "feat(native): Capacitor loads bundled export (webDir: out), not hosted URL"
```

---

## Task 12: build:native script + sync, MOBILE_APP.md

**Files:**
- Modify: `package.json`, `MOBILE_APP.md`

- [ ] **Step 1: Add the build:native script**

In `package.json` `"scripts"`, add after `"cap:android"`:
```json
    "build:native": "NEXT_PUBLIC_NATIVE=1 next build && cap sync",
```

- [ ] **Step 2: Verify the script runs end-to-end (build → export → sync)**

Run: `npm run build:native 2>&1 | tail -20 && test -d out && echo "BUILD:NATIVE OK"`
Expected: build + export + `cap sync` succeed; `BUILD:NATIVE OK`. (A non-fatal Android Gradle JDK warning is expected on this machine and does not fail sync.)

- [ ] **Step 3: Confirm the bundle synced into the native projects**

Run: `test -f ios/App/App/public/index.html && echo "iOS bundle synced"; test -f android/app/src/main/assets/public/index.html && echo "Android bundle synced"`
Expected: both synced. (These are gitignored — they should EXIST but not be committed.)

- [ ] **Step 4: Update MOBILE_APP.md — add a "Bundled (real app) build" section**

In `MOBILE_APP.md`, replace the "## Strategy: Capacitor hosted-URL shell" section heading and its first paragraph with:
```markdown
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
npm run build:native      # NEXT_PUBLIC_NATIVE=1 next build && cap sync
npm run cap:ios           # open Xcode → Run
npm run cap:android       # open Android Studio → Run (needs JDK 17/21)
```

Unlike the old hosted-URL model, you DO rebuild (`build:native`) to ship UI
changes — the app runs bundled assets, not the live site.
```
Leave the rest of MOBILE_APP.md (app identity, prerequisites, JDK note, Guideline
4.2, cost summary) intact. Remove any remaining sentence that says the app "loads
the live deployed site `https://animipro.online/` in a native webview" — that is
now false; replace such phrasing with the bundled description above.

- [ ] **Step 5: Verify docs no longer claim hosted-URL as current**

Run: `grep -E "loads the \*\*live deployed site\*\*|server.url" MOBILE_APP.md && echo "STALE HOSTED-URL CLAIM (fix)" || echo "no stale hosted-URL claim — OK"`
Expected: `no stale hosted-URL claim — OK`.

- [ ] **Step 6: Commit**

```bash
git add package.json MOBILE_APP.md
git commit -m "feat(native): build:native script + bundled-app docs"
```

---

## Task 13: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full test suite green (web path intact)**

Run: `npm test 2>&1 | tail -6`
Expected: all tests pass (110 original + new native tests from Tasks 1–4).

- [ ] **Step 2: Both builds succeed**

Run: `npm run build 2>&1 | tail -4 && echo "--- native ---" && npm run build:native 2>&1 | tail -6 && test -d out && echo "BOTH BUILDS OK"`
Expected: web build + native build both succeed; `BOTH BUILDS OK`.

- [ ] **Step 3: Open the native app in the simulator**

Run: `npm run cap:ios`
Expected: Xcode opens. (Manual: Run in an iOS simulator — the app should open to the LOGIN screen, NOT the marketing homepage. A valid Supabase sign-in should land on /platform. If Supabase env isn't configured in the bundle, login will error — note that as an env/config follow-up, not a code defect.)

- [ ] **Step 4: Confirm the app bundles login + platform, not marketing**

Run: `ls out/ | grep -E "^(login|platform|index)" && echo "---" && grep -l "animipro.online" out/*.html 2>/dev/null && echo "WARN: marketing refs in bundle" || echo "no marketing homepage dependency"`
Expected: login + platform present; the app does not depend on loading animipro.online.

---

## Out of scope (do not implement)

Wiring modules to live Supabase data (modules stay on mock data); guest surface in
the app; push notifications; offline data sync; App Store / Play submission,
signing, provisioning. (Spec §9.)

## Known risks flagged

- **Server-import leak (Task 6):** if the export build rejects `page.tsx`'s
  server-only `getCurrentUser` import even on the unrendered branch, fall back to a
  dedicated native route (controller decides).
- **Supabase env in the bundle:** the static export bakes in
  `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` at build time. `build:native` must run
  with those env vars set, or login will fail at runtime. Document in `.env`.
