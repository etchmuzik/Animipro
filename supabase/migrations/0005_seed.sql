-- ════════════════════════════════════════════════════════════════════════════
-- AnimaPro — Seed data (Phase 0/1)
-- Ports the demo's two Sunrise hotels + the four Sharm clubs and their nights so
-- a fresh database is immediately testable. Idempotent: re-running is a no-op via
-- ON CONFLICT. Club-night dates are relative to current_date (see roadmap note),
-- so seeded nights are always today / +1 / +2.
--
-- NOTE: real production data will be created through the app, not seeded. This is
-- a demo/dev convenience so the club-tickets slice has something to sell.
-- ════════════════════════════════════════════════════════════════════════════

-- Stable UUIDs so re-seeding + app references are deterministic in dev.
-- (Generated once; fixed here on purpose.)

-- ─── Company + hotels ────────────────────────────────────────────────────────
insert into companies (id, name, plan, contact_email) values
  ('00000000-0000-0000-0000-0000000000c1', 'Sunrise Hospitality Group', 'ENTERPRISE', 'ops@sunrisehospitality.com')
on conflict (id) do nothing;

insert into hotels (id, company_id, name, city, stars, address, contact_email,
  tripadvisor_rating, tripadvisor_reviews, tripadvisor_rank, tripadvisor_badge, tripadvisor_trend,
  google_rating, booking_rating) values
  ('00000000-0000-0000-0000-0000000000h1', '00000000-0000-0000-0000-0000000000c1',
   'Sunrise Palace Resort', 'SHARM_EL_SHEIKH', 5, 'Naama Bay, Sharm El Sheikh, South Sinai',
   'palace@sunrisehospitality.com', 4.7, 3842, '#4 of 61 hotels in Sharm El Sheikh',
   'Travelers'' Choice', 'up', 4.6, 9.1),
  ('00000000-0000-0000-0000-0000000000h2', '00000000-0000-0000-0000-0000000000c1',
   'Sunrise Lagoon Hotel', 'HURGHADA', 4, 'El Mamsha Street, El Dahar, Hurghada, Red Sea',
   'lagoon@sunrisehospitality.com', 4.4, 2106, '#12 of 103 hotels in Hurghada',
   null, 'stable', 4.3, 8.7)
on conflict (id) do nothing;

-- ─── Clubs (Sharm) ───────────────────────────────────────────────────────────
insert into clubs (id, name, city, area, mood, capacity, gradient, image, tagline, price_from, min_age) values
  ('00000000-0000-0000-0000-00000000club1', 'Pacha Sharm', 'SHARM_EL_SHEIKH', 'Naama Bay', 'NIGHTCLUB', 1200,
   'from-fuchsia-500 via-purple-600 to-indigo-700',
   'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=70',
   'Sharm''s biggest dance floor. Open-air rooftop, international DJs every weekend.', 600, 21),
  ('00000000-0000-0000-0000-00000000club2', 'Soho Square Lounge', 'SHARM_EL_SHEIKH', 'Soho Square, Sharks Bay', 'LOUNGE', 600,
   'from-amber-400 via-rose-500 to-pink-600',
   'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=70',
   'Live bands, shisha, the famous dancing fountain. Mixed crowd, dress smart.', 350, 18),
  ('00000000-0000-0000-0000-00000000club3', 'Hard Rock Cafe Sharm', 'SHARM_EL_SHEIKH', 'Naama Bay Boulevard', 'NIGHTCLUB', 800,
   'from-rose-500 via-red-600 to-orange-700',
   'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?auto=format&fit=crop&w=1200&q=70',
   'Burgers, rock & pop covers, then DJ sets till 4am.', 450, 18),
  ('00000000-0000-0000-0000-00000000club4', 'Bedouin Stars Dinner', 'SHARM_EL_SHEIKH', 'Desert, 25 min from Naama Bay', 'CULTURAL', 200,
   'from-amber-600 via-orange-700 to-rose-900',
   'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=70',
   'Traditional dinner under the stars, camel ride, telescope astronomy session.', 950, 18)
on conflict (id) do nothing;

-- ─── Club nights (relative to current_date so always "upcoming") ─────────────
insert into club_nights (club_id, night_date, doors_open, doors_close, theme, price_per_ticket, capacity, hotel_allocation) values
  -- Pacha
  ('00000000-0000-0000-0000-00000000club1', current_date,     '23:00', '04:00', 'House Beats — DJ Karim',      700, 1200, 60),
  ('00000000-0000-0000-0000-00000000club1', current_date + 1, '23:00', '04:00', 'Ladies Night — free entry F', 600, 1200, 80),
  ('00000000-0000-0000-0000-00000000club1', current_date + 2, '23:00', '04:00', 'Pacha Anniversary Special',   900, 1200, 40),
  -- Soho
  ('00000000-0000-0000-0000-00000000club2', current_date,     '20:00', '01:00', 'Latin Live Band + dance show', 400, 600, 30),
  ('00000000-0000-0000-0000-00000000club2', current_date + 1, '20:00', '01:00', 'Acoustic & Shisha',            350, 600, 30),
  -- Hard Rock
  ('00000000-0000-0000-0000-00000000club3', current_date,     '22:00', '04:00', 'Rock Classics Night',          500, 800, 40),
  ('00000000-0000-0000-0000-00000000club3', current_date + 2, '22:00', '04:00', '90s Throwback',                450, 800, 50),
  -- Bedouin
  ('00000000-0000-0000-0000-00000000club4', current_date,     '19:30', '23:30', 'Stars & Tea',                  1100, 200, 20),
  ('00000000-0000-0000-0000-00000000club4', current_date + 1, '19:30', '23:30', 'Full-Moon Bedouin Feast',      1250, 200, 25)
on conflict do nothing;
