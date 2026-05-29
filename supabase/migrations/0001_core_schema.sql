-- ════════════════════════════════════════════════════════════════════════════
-- AnimaPro — Core schema (Phase 0)
-- Translates the demo's lib/mock-data.ts + lib/roles.ts types into real tables.
-- Apply with: supabase db push   (or paste into the Supabase SQL editor)
--
-- Conventions:
--   • Every business table carries company_id and/or hotel_id for tenant isolation.
--   • RLS is enabled here but the policies live in 0003_rls_policies.sql so the
--     schema and the access rules can be reviewed independently.
--   • Enums mirror the string-literal unions in the TypeScript source so the app
--     types and DB types stay in lockstep.
-- ════════════════════════════════════════════════════════════════════════════

-- UUID generation
create extension if not exists "pgcrypto";

-- ─── Enums (mirror lib/mock-data.ts + lib/roles.ts + lib/club-tickets.ts) ────

create type subscription_plan as enum ('BASIC', 'PROFESSIONAL', 'ENTERPRISE');

create type user_role as enum (
  'SUPER_ADMIN', 'HOTEL_ADMIN', 'ANIMATION_CHIEF', 'TEAM_LEADER',
  'ANIMATOR', 'ENTERTAINER', 'LIFEGUARD', 'KIDS_CLUB', 'DOOR_SCANNER', 'GUEST'
);

create type team_type as enum (
  'SPORTS', 'ENTERTAINMENT', 'KIDS_CLUB', 'AQUA', 'FITNESS', 'CULTURAL', 'MIXED'
);

create type activity_type as enum (
  'SPORTS', 'WATER_SPORTS', 'AQUA_GYM', 'KIDS_ACTIVITY', 'EVENING_SHOW',
  'DANCE_CLASS', 'GAME', 'EXCURSION', 'CULTURAL', 'FITNESS', 'ENTERTAINMENT'
);

create type contract_type as enum ('FULL_TIME', 'PART_TIME', 'SEASONAL', 'FREELANCE');
create type attendance_status as enum ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'HALF_DAY');
create type leave_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
create type leave_type as enum ('ANNUAL', 'SICK', 'EMERGENCY', 'UNPAID', 'DAY_OFF');
create type assignment_status as enum ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED');
create type priority as enum ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
create type announcement_type as enum ('GENERAL', 'URGENT', 'SCHEDULE_CHANGE', 'TRAINING', 'POLICY', 'EVENT');
create type event_type as enum ('GALA_DINNER', 'THEME_NIGHT', 'KIDS_PARTY', 'SPORTS_TOURNAMENT', 'CULTURAL_SHOW', 'FAREWELL_PARTY', 'WELCOME_PARTY', 'SPECIAL_PERFORMANCE');
create type event_status as enum ('PLANNED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
create type schedule_entry_type as enum ('ACTIVITY', 'SHIFT', 'BREAK', 'MEETING', 'TRAINING', 'OFF_DUTY');
create type schedule_status as enum ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'MISSED');

-- ─── Tenancy: companies → hotels ─────────────────────────────────────────────

create table companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  logo          text,
  plan          subscription_plan not null default 'BASIC',
  contact_email text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table hotels (
  id                    uuid primary key default gen_random_uuid(),
  company_id            uuid not null references companies(id) on delete cascade,
  name                  text not null,
  city                  text not null,           -- HotelCity union; kept as text for flexibility
  stars                 int  not null check (stars between 1 and 5),
  address               text not null,
  contact_email         text not null,
  tripadvisor_rating    numeric(2,1),
  tripadvisor_reviews   int default 0,
  tripadvisor_rank      text,
  tripadvisor_badge     text,
  tripadvisor_trend     text default 'stable',
  google_rating         numeric(2,1),
  booking_rating        numeric(3,1),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index hotels_company_idx on hotels(company_id);

-- ─── Identity: profiles (1:1 with auth.users) ────────────────────────────────
-- Supabase Auth owns auth.users. This holds the app-specific user data the
-- demo kept in lib/roles.ts AppUser. A trigger (0002) seeds a row on signup.

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid references companies(id) on delete set null,
  hotel_id    uuid references hotels(id) on delete set null,
  team_id     uuid,  -- FK added after teams table exists (below)
  full_name   text not null default '',
  initials    text not null default '',
  role        user_role not null default 'ANIMATOR',
  phone       text,
  avatar      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index profiles_company_idx on profiles(company_id);
create index profiles_hotel_idx on profiles(hotel_id);

-- ─── Teams ───────────────────────────────────────────────────────────────────

create table teams (
  id           uuid primary key default gen_random_uuid(),
  hotel_id     uuid not null references hotels(id) on delete cascade,
  name         text not null,
  type         team_type not null default 'MIXED',
  color        text,
  leader_id    uuid references profiles(id) on delete set null,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index teams_hotel_idx on teams(hotel_id);

-- now that teams exists, point profiles.team_id at it
alter table profiles
  add constraint profiles_team_fk
  foreign key (team_id) references teams(id) on delete set null;

-- ─── Staff (animators) — richer per-hotel staff record ───────────────────────
-- Mirrors Animator. Linked to a profile when the person has a login; staff
-- without an account (seasonal hires not yet onboarded) can exist profile-less.

create table staff (
  id              uuid primary key default gen_random_uuid(),
  hotel_id        uuid not null references hotels(id) on delete cascade,
  profile_id      uuid references profiles(id) on delete set null,
  team_id         uuid references teams(id) on delete set null,
  first_name      text not null,
  last_name       text not null,
  email           text,
  phone           text,
  role            user_role not null default 'ANIMATOR',
  nationality     text,
  languages       text[] not null default '{}',
  specialties     text[] not null default '{}',
  avatar          text,
  contract_type   contract_type not null default 'SEASONAL',
  start_date      date,
  is_active       boolean not null default true,
  performance     int default 0 check (performance between 0 and 100),
  attendance_rate int default 0 check (attendance_rate between 0 and 100),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index staff_hotel_idx on staff(hotel_id);
create index staff_team_idx on staff(team_id);

-- ─── Activities catalog (per hotel) ──────────────────────────────────────────

create table activities (
  id            uuid primary key default gen_random_uuid(),
  hotel_id      uuid not null references hotels(id) on delete cascade,
  name          text not null,
  name_ar       text,
  type          activity_type not null,
  venue         text,
  duration      int,                 -- minutes
  min_animators int default 1,
  max_guests    int,
  age_group     text default 'ALL',
  equipment     text[] not null default '{}',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index activities_hotel_idx on activities(hotel_id);

-- ─── Schedule entries ────────────────────────────────────────────────────────

create table schedule_entries (
  id            uuid primary key default gen_random_uuid(),
  hotel_id      uuid not null references hotels(id) on delete cascade,
  staff_id      uuid references staff(id) on delete set null,
  team_id       uuid references teams(id) on delete set null,
  activity_id   uuid references activities(id) on delete set null,
  activity_name text,                -- denormalized snapshot for display
  venue         text,
  entry_date    date not null,
  start_time    time not null,
  end_time      time not null,
  type          schedule_entry_type not null default 'ACTIVITY',
  status        schedule_status not null default 'SCHEDULED',
  attendance    attendance_status,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index schedule_hotel_date_idx on schedule_entries(hotel_id, entry_date);
create index schedule_staff_idx on schedule_entries(staff_id);

-- ─── Assignments (tasks) ─────────────────────────────────────────────────────

create table assignments (
  id              uuid primary key default gen_random_uuid(),
  hotel_id        uuid not null references hotels(id) on delete cascade,
  title           text not null,
  description     text,
  assigned_to_id  uuid references staff(id) on delete set null,
  assigned_by_id  uuid references profiles(id) on delete set null,
  team_id         uuid references teams(id) on delete set null,
  activity_name   text,
  task_date       date,
  start_time      time,
  end_time        time,
  priority        priority not null default 'MEDIUM',
  status          assignment_status not null default 'PENDING',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index assignments_hotel_idx on assignments(hotel_id);
create index assignments_assignee_idx on assignments(assigned_to_id);

-- ─── Announcements ───────────────────────────────────────────────────────────

create table announcements (
  id            uuid primary key default gen_random_uuid(),
  hotel_id      uuid not null references hotels(id) on delete cascade,
  title         text not null,
  content       text not null,
  type          announcement_type not null default 'GENERAL',
  priority      priority not null default 'MEDIUM',
  target_roles  user_role[] not null default '{}',
  is_active     boolean not null default true,
  author_id     uuid references profiles(id) on delete set null,
  author_name   text,
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index announcements_hotel_idx on announcements(hotel_id);

-- ─── Leave requests ──────────────────────────────────────────────────────────

create table leave_requests (
  id           uuid primary key default gen_random_uuid(),
  hotel_id     uuid not null references hotels(id) on delete cascade,
  staff_id     uuid references staff(id) on delete set null,
  type         leave_type not null default 'ANNUAL',
  start_date   date not null,
  end_date     date not null,
  reason       text,
  status       leave_status not null default 'PENDING',
  reviewed_by  uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index leave_hotel_idx on leave_requests(hotel_id);
create index leave_staff_idx on leave_requests(staff_id);

-- ─── Events ──────────────────────────────────────────────────────────────────

create table events (
  id                 uuid primary key default gen_random_uuid(),
  hotel_id           uuid not null references hotels(id) on delete cascade,
  name               text not null,
  description        text,
  event_date         date not null,
  start_time         time,
  end_time           time,
  venue              text,
  type               event_type not null,
  expected_guests    int default 0,
  status             event_status not null default 'PLANNED',
  assigned_staff_ids uuid[] not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index events_hotel_idx on events(hotel_id);

-- ─── Performance scores ──────────────────────────────────────────────────────

create table performance_scores (
  id             uuid primary key default gen_random_uuid(),
  hotel_id       uuid not null references hotels(id) on delete cascade,
  staff_id       uuid not null references staff(id) on delete cascade,
  period         text not null,          -- e.g. "2026-05"
  punctuality    int check (punctuality between 0 and 100),
  attitude       int check (attitude between 0 and 100),
  skills         int check (skills between 0 and 100),
  guest_feedback int check (guest_feedback between 0 and 100),
  teamwork       int check (teamwork between 0 and 100),
  overall        int check (overall between 0 and 100),
  created_at     timestamptz not null default now(),
  unique (staff_id, period)
);
create index performance_hotel_idx on performance_scores(hotel_id);

-- ─── Task-state overlay (mirrors lib/task-state.ts) ──────────────────────────
-- The demo layered runtime status (started/completed + proof) on top of the
-- immutable mock data, keyed by "kind:id". Here it's a real table keyed by the
-- entity it annotates. Proof media goes to Supabase Storage; we keep the path.

create table task_state (
  id             uuid primary key default gen_random_uuid(),
  hotel_id       uuid not null references hotels(id) on delete cascade,
  kind           text not null,          -- 'schedule' | 'assignment' | 'event'
  entity_id      uuid not null,
  status         text not null,          -- 'IN_PROGRESS' | 'COMPLETED'
  started_at     timestamptz,
  completed_at   timestamptz,
  proof_path     text,                   -- Supabase Storage object path
  proof_kind     text,                   -- 'photo' | 'video'
  actor_id       uuid references profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (kind, entity_id)
);
create index task_state_hotel_idx on task_state(hotel_id);

-- ─── Guest feedback (mirrors lib/feedback.ts) ────────────────────────────────

create table feedback (
  id           uuid primary key default gen_random_uuid(),
  hotel_id     uuid not null references hotels(id) on delete cascade,
  activity_id  uuid references activities(id) on delete set null,
  rating       int not null check (rating between 1 and 5),
  comment      text,
  guest_name   text,
  created_at   timestamptz not null default now()
);
create index feedback_hotel_idx on feedback(hotel_id);

-- ─── Recruitment applications (mirrors lib/applications.ts) ───────────────────

create table applications (
  id            uuid primary key default gen_random_uuid(),
  hotel_id      uuid references hotels(id) on delete set null,
  full_name     text not null,
  email         text,
  phone         text,
  role          text,
  nationality   text,
  languages     text[] not null default '{}',
  experience    text,
  cv_path       text,                    -- Supabase Storage path
  status        text not null default 'NEW',  -- NEW | REVIEWING | SHORTLISTED | REJECTED | HIRED
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index applications_hotel_idx on applications(hotel_id);

-- ─── updated_at auto-touch trigger ───────────────────────────────────────────

create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'companies','hotels','profiles','teams','staff','activities',
    'schedule_entries','assignments','announcements','leave_requests',
    'events','task_state','applications'
  ]
  loop
    execute format(
      'create trigger trg_touch_%I before update on %I
       for each row execute function touch_updated_at()', t, t);
  end loop;
end$$;
