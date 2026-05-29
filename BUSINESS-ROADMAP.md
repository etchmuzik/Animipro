# AnimaPro — Business Roadmap (demo → real product)

> Status as of 2026-05-29. This is the plan to turn the current front-end-only
> demo into a launchable, revenue-generating product. Read `CLAUDE.md` first for
> how the demo works today; this doc is about what's missing and the order to
> build it.

## The honest starting point

What exists today is a **polished single-player demo**. Every piece of data lives
in the browser (`localStorage` + `IndexedDB`, 80+ call sites). There is:

- **No backend** — no `fetch`, no API routes, no server.
- **No database** — `lib/mock-data.ts` is a hard-coded `const` fixture; runtime
  state is browser-local and resets on a different device/browser.
- **No authentication** — the Topbar user picker swaps a demo user from a dropdown.
- **No real payments** — `sellTicket()` writes a ticket to `localStorage`; the four
  payment methods all simulate success.
- **No outbound comms** — no email, SMS, WhatsApp, or server push.

None of that is a flaw in a demo. It's the line between "looks like a $1M business"
and "is one." The UI, design system, i18n (4 languages + RTL), white-label theming,
and 13 module surfaces are genuinely strong and are the hard part most teams never
reach. The work below is about putting a real engine under that body.

## Decided strategy

- **Goal:** build the full product properly, then launch.
- **Sequencing:** **club-tickets first, end-to-end.** It's the one flow where money
  moves per transaction (hotels resell nightclub tickets and take margin), so it's
  the fastest path to a hotel actually paying — and it's a *vertical slice* through
  every layer (auth → DB → payment → comms). Build that pipe real, then expand the
  other 12 modules horizontally on the proven rails.
- **Backend:** **Supabase** (Postgres, Auth, Row-Level Security, Storage, Realtime).
- **Hosting:** **hybrid** — marketing (`/`, `/careers`, `/partners`) stays static on
  Hostinger; the app (`/platform`, `/guest`) moves to a backend-capable host (Vercel
  or the Hostinger VPS running full Next.js). This ends pure `output: 'export'`.
- **Payments (Egypt):** **Paymob** (or Fawry) for EGP card acquiring — Stripe doesn't
  fully serve EGP. **Stripe Billing** reserved for USD/EUR resellers + subscriptions.
- **Primary comms channel:** **WhatsApp** (the Egyptian resort market default).

---

## ⚡ Activation checklist (what YOU do to turn on the backend)

The code for Phase 0 + most of Phase 1 is committed. To make it live:

1. **Create a Supabase project** (supabase.com → New project; pick the EU/closest
   region). Free tier is fine to start.
2. **Apply the schema:** in the Supabase SQL editor, run the five files in
   `supabase/migrations/` in order (0001 → 0005). Or use the Supabase CLI:
   `supabase link --project-ref <ref> && supabase db push`.
3. **Copy env:** `cp .env.example .env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project
   Settings → API), and generate `TICKET_HMAC_SECRET` with `openssl rand -hex 32`.
4. **Regenerate types** (optional but recommended):
   `npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts`
5. **Create your first admin:** Supabase → Authentication → Add user (email +
   password). Then in the SQL editor, set their role + hotel:
   `update profiles set role='HOTEL_ADMIN', hotel_id='00000000-0000-0000-0000-0000000000h1', company_id='00000000-0000-0000-0000-0000000000c1' where id='<that user id>';`
6. **Run it:** `npm run dev`, go to `/login`, sign in. The demo fallback turns off
   automatically once `NEXT_PUBLIC_SUPABASE_URL` is set — real auth takes over.

Until step 3 is done, the app keeps working on the demo fallback (no crash).

## Phase 0 — Foundation (no revenue yet, unblocks everything)

**Build status (2026-05-29):** ✅ schema (5 migrations) · ✅ Supabase client layer
(browser/server/service + middleware session refresh) · ✅ auth (login page,
server actions, sign-out, middleware gate, `getCurrentUser()` → AppUser bridge,
demo fallback) · ⏳ repository layer (swap localStorage stores → Supabase) is next.


**Goal:** a real database and login, with the app reading/writing Supabase instead
of `localStorage`. Nothing user-visible changes much; the plumbing changes completely.

1. **Stand up Supabase.** New project, pick the EU/closest region (data-residency
   matters for Egyptian PDPL + European resellers). Use the connected Supabase MCP.
2. **Schema v1.** Translate the existing types into tables. Direct map from today's code:
   - `lib/roles.ts` `AppUser` → `profiles` (+ Supabase `auth.users`)
   - `lib/mock-data.ts` companies/hotels/teams/animators → `companies`, `hotels`,
     `teams`, `staff`
   - schedule entries → `schedule_entries`; events → `events`; announcements →
     `announcements`; leave → `leave_requests`
   - `lib/club-tickets.ts` `Club` / `ClubNight` / `Ticket` → `clubs`, `club_nights`,
     `tickets` (this is the slice that goes real first — see Phase 1)
   - `lib/task-state.ts` overlay → `task_state` (started/completed timestamps + proof refs)
   - `lib/feedback.ts` → `feedback`; `lib/applications.ts` → `applications`
3. **Multi-tenancy via RLS.** Every table carries `hotel_id` / `company_id`. Row-Level
   Security policies enforce "you only see your org's rows." This is the single most
   important security control — get it right before any real customer data exists.
4. **Auth.** Email/password + magic link to start. Map the 5-level role model
   (`lib/roles.ts`) onto a `role` claim; keep `canAccess()` / `getPermissions()` as the
   authority layer but feed them the authenticated user.
5. **Hosting migration.** Move `/platform` + `/guest` off static export to the chosen
   host. Keep marketing static on Hostinger. Wire `NEXT_PUBLIC_SUPABASE_URL` / anon key
   as env vars (never hard-coded — see the repo's security rules).
6. **Repository layer.** Introduce a thin data-access layer (one module per entity)
   so components call `ticketsRepo.list(...)` instead of touching Supabase directly.
   The current `lib/*.ts` stores already have this shape — swap their bodies from
   `localStorage` to Supabase, keep their `subscribe()`/`emit()` contracts so the UI
   barely changes.

**Done when:** two people on two devices see the same hotel's data, logins work, and
an org can't read another org's rows.

---

## Phase 1 — Club-tickets, for real (FIRST REVENUE)

**Goal:** a Sharm hotel can sell a real nightclub ticket to a guest, take real money,
and validate the QR at the door — and you take a cut.

1. **Tickets in Postgres.** `sellTicket()` becomes a server action / API route that
   inserts into the `tickets` table. `listTickets()` / `getTicket()` read from it.
2. **Real anti-forgery.** Replace `makeCheck()` (the in-file hash that even its own
   comment says is "not cryptographically secure") with a **server-side HMAC** over the
   ticket id using a secret env key. The door-scanner validates server-side; a guest
   can't forge a code.
3. **Real payment — Paymob.** Replace the simulated CASH/CARD/WALLET/ROOM_CHARGE path
   in `components/guest/buy-sheet.tsx`:
   - Card/Wallet → Paymob hosted checkout (handles EGP card + mobile wallets locally).
   - Cash / Room-charge → stays a staff-recorded method (real use case: guest pays at
     desk or charges to room), but now recorded as a real `payment` row, not a sim.
   - Multi-currency: keep the EGP/USD/EUR switcher for *display*, but settle in EGP via
     Paymob; show the FX-converted figure as indicative.
4. **WhatsApp confirmation.** On successful sale, send the guest a WhatsApp message with
   their ticket QR (WhatsApp Business API / a provider like Twilio or 360dialog).
5. **Your margin.** Model the platform cut: either a per-ticket fee or a % of GMV,
   recorded per transaction so you can invoice/settle with the hotel. This is the
   actual money-making mechanic — make it explicit in the schema.
6. **Door scanner, real.** The scan-panel validates against the DB + HMAC, marks
   `SCANNED` server-side, prevents double-entry across devices.

**Done when:** a real guest buys a real ticket with real EGP, gets a WhatsApp QR, and
staff scan it at the door — and you can see your cut.

---

## Phase 2 — Keep & grow customers

7. **Server-side reminders / push.** The current reminder system honestly documents its
   limit: notifications "fire only while the tab is alive." Replace with a server cron
   (Supabase scheduled function or a worker) + Web Push so "your shift starts in 1h"
   fires whether or not the app is open.
8. **Transactional email + SMS.** Booking confirmations, password resets, staff invites,
   leave-approval notices. (Resend skill is available for email; SMS via a local Egyptian
   gateway or Twilio.)
9. **Real, exportable reporting.** `components/modules/reports.tsx` renders mock charts.
   Make them query real data, add date-range filters, CSV/PDF export, and "email me this
   weekly." This is how a manager justifies the spend to their boss.
10. **Audit trail.** Append-only log for anything touching money (tickets, refunds) or
    labor (shift changes, leave decisions). Doubles as a sales feature ("full accountability").

---

## Phase 3 — Product → company

11. **Subscription billing.** Wire the pricing ladder (see `business-model` memory:
    25K/75K/150K + Hosted Edition recurring) to real billing — Stripe Billing for
    international resellers, Paymob for local. Trials, upgrades, dunning.
12. **Self-serve onboarding.** Signup → guided setup → first "aha" in <10 min. The
    `lib/onboarding.ts` lib exists but is local-only; make it real and conversion-focused.
13. **Observability.** Sentry (errors), product analytics (who uses what), uptime + a
    status page. You can't fix or sell what you can't measure.
14. **Legal/compliance.** Terms, Privacy Policy, a DPA. Egyptian PDPL + GDPR for European
    resellers/guests. No enterprise buyer signs without these.
15. **Native apps.** `MOBILE_APP.md` describes Capacitor packaging, but no `@capacitor/*`
    deps or native dirs exist yet. Build the iOS/Android wrappers so animators get an
    App Store icon and real native push (ties into Phase 2's push work).

---

## What NOT to do yet

- Don't build the other 12 modules' backends before Phase 1 proves the architecture.
- Don't add more UI features — the surface is already ahead of the engine.
- Don't hand-roll auth or payment crypto — use Supabase Auth + Paymob/Stripe.
- Don't keep pure static export once the app needs a server.

## Quick reference — where today's demo maps to the real build

| Demo (today) | Real (target) |
|---|---|
| `lib/mock-data.ts` const arrays | Supabase tables, seeded |
| `lib/club-tickets.ts` localStorage store | `tickets`/`club_nights`/`clubs` tables + server actions |
| `makeCheck()` hash | server-side HMAC with secret key |
| `buy-sheet.tsx` simulated payment | Paymob hosted checkout |
| Topbar role dropdown | Supabase Auth + role claim |
| `lib/reminders.ts` setTimeout | server cron + Web Push |
| Topbar/sidebar "demo user" switching | real login + org isolation (RLS) |
| Hostinger static export | hybrid: marketing static, app on backend host |
