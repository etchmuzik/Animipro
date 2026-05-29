-- ════════════════════════════════════════════════════════════════════════════
-- AnimaPro — Club tickets (Phase 1: the first real revenue slice)
-- Mirrors lib/club-tickets.ts but adds the columns a real money flow needs:
-- a real payment record, a server-verifiable QR signature, and the platform's
-- margin per sale.
-- ════════════════════════════════════════════════════════════════════════════

create type club_mood as enum ('BEACH', 'NIGHTCLUB', 'LOUNGE', 'OPEN_AIR', 'CULTURAL');
create type ticket_status as enum ('ACTIVE', 'SCANNED', 'REFUNDED');
create type payment_method as enum ('CASH', 'CARD', 'ROOM_CHARGE', 'WALLET');
create type payment_status as enum ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- ─── Clubs (the venues hotels resell for) ────────────────────────────────────
create table clubs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  city        text not null,
  area        text,
  mood        club_mood not null default 'NIGHTCLUB',
  capacity    int,
  gradient    text,                 -- card hero gradient (design)
  image       text,                 -- hero photo URL
  tagline     text,
  price_from  int,                  -- EGP indicative
  min_age     int default 18,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Club nights (a dated event at a club) ───────────────────────────────────
create table club_nights (
  id                uuid primary key default gen_random_uuid(),
  club_id           uuid not null references clubs(id) on delete cascade,
  night_date        date not null,
  doors_open        time,
  doors_close       time,
  theme             text,
  price_per_ticket  int not null,        -- EGP
  capacity          int,
  hotel_allocation  int default 0,       -- tickets reserved for hotel guests
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index club_nights_club_idx on club_nights(club_id);
create index club_nights_date_idx on club_nights(night_date);

-- ─── Payments (a real money record, not a simulation) ────────────────────────
-- One payment per ticket sale. For CARD/WALLET this is reconciled against the
-- Paymob transaction; CASH/ROOM_CHARGE are staff-recorded and marked PAID.
create table payments (
  id                 uuid primary key default gen_random_uuid(),
  hotel_id           uuid not null references hotels(id) on delete restrict,
  amount             int not null,            -- EGP, what the guest paid
  currency           text not null default 'EGP',
  method             payment_method not null,
  status             payment_status not null default 'PENDING',
  -- Paymob linkage (null for cash/room): the provider's order + transaction ids
  provider           text,                    -- 'paymob' | 'fawry' | null
  provider_order_id  text,
  provider_txn_id    text,
  -- Platform economics: what AnimaPro keeps from this sale.
  platform_fee       int not null default 0,  -- EGP, your margin
  net_to_hotel       int not null default 0,  -- EGP, amount - platform_fee
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index payments_hotel_idx on payments(hotel_id);
create index payments_provider_order_idx on payments(provider_order_id);

-- ─── Tickets ─────────────────────────────────────────────────────────────────
-- qr_id is the opaque value encoded in the QR. signature is a server-side HMAC
-- over qr_id (replaces the demo's makeCheck()): the door scanner recomputes it
-- with the secret key, so a guest cannot forge a valid code.
create table tickets (
  id                uuid primary key default gen_random_uuid(),
  qr_id             text not null unique,
  signature         text not null,             -- HMAC-SHA256(qr_id, secret), hex
  club_night_id     uuid not null references club_nights(id) on delete restrict,
  hotel_id          uuid not null references hotels(id) on delete restrict,
  payment_id        uuid references payments(id) on delete set null,
  guest_name        text not null,
  guest_room        text,
  guest_count       int not null default 1 check (guest_count between 1 and 20),
  price_paid        int not null,              -- EGP total
  payment_method    payment_method not null,
  seller_user_id    uuid references profiles(id) on delete set null,
  seller_name       text,
  status            ticket_status not null default 'ACTIVE',
  sold_at           timestamptz not null default now(),
  scanned_at        timestamptz,
  scanned_by_id     uuid references profiles(id) on delete set null,
  scanned_by_name   text,
  refunded_at       timestamptz,
  refund_reason     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index tickets_hotel_idx on tickets(hotel_id);
create index tickets_night_idx on tickets(club_night_id);
create index tickets_status_idx on tickets(status);

-- touch updated_at
create trigger trg_touch_clubs       before update on clubs       for each row execute function touch_updated_at();
create trigger trg_touch_club_nights before update on club_nights for each row execute function touch_updated_at();
create trigger trg_touch_payments    before update on payments    for each row execute function touch_updated_at();
create trigger trg_touch_tickets     before update on tickets     for each row execute function touch_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table clubs        enable row level security;
alter table club_nights  enable row level security;
alter table payments     enable row level security;
alter table tickets      enable row level security;

-- Clubs + nights are public catalog data (guests browse them) → public read.
-- Writes restricted to authenticated admins (level<=3).
create policy clubs_read_public on clubs for select using (true);
create policy clubs_write on clubs for all
  using (current_level() <= 3) with check (current_level() <= 3);

create policy nights_read_public on club_nights for select using (true);
create policy nights_write on club_nights for all
  using (current_level() <= 3) with check (current_level() <= 3);

-- Payments: hotel-scoped read for staff; inserts happen server-side (service
-- role bypasses RLS), so no public insert policy is needed.
create policy payments_read on payments for select using (
  is_super_admin() or hotel_id = current_hotel_id()
);

-- Tickets: a guest needs to read their own ticket by qr_id on the public
-- surface, and staff read their hotel's tickets. Inserts + scans go through
-- server actions using the service role, so writes are not exposed to clients.
create policy tickets_read on tickets for select using (
  is_super_admin() or hotel_id = current_hotel_id()
);
