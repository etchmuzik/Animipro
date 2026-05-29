-- ════════════════════════════════════════════════════════════════════════════
-- AnimaPro — Row-Level Security policies (Phase 0)
-- The tenant-isolation layer. Enabling RLS is deny-by-default: every table is
-- locked until a policy grants access. Helpers (current_hotel_id, etc.) come
-- from 0002.
--
-- Model:
--   • Hotel-scoped read: you see rows whose hotel_id matches your profile's
--     hotel_id. Super admins (level 1) see every tenant.
--   • Writes: gated by authority level (lib/roles.ts). Admins/chiefs (level<=3)
--     manage hotel data; everyone can update their own task_state / leave.
--   • profiles: you read profiles in your hotel, edit only your own.
-- ════════════════════════════════════════════════════════════════════════════

-- Enable RLS everywhere
alter table companies          enable row level security;
alter table hotels             enable row level security;
alter table profiles           enable row level security;
alter table teams              enable row level security;
alter table staff              enable row level security;
alter table activities         enable row level security;
alter table schedule_entries   enable row level security;
alter table assignments        enable row level security;
alter table announcements      enable row level security;
alter table leave_requests     enable row level security;
alter table events             enable row level security;
alter table performance_scores enable row level security;
alter table task_state         enable row level security;
alter table feedback           enable row level security;
alter table applications       enable row level security;

-- ─── companies ───────────────────────────────────────────────────────────────
create policy companies_read on companies for select using (
  is_super_admin() or id = current_company_id()
);
create policy companies_write on companies for all using (is_super_admin()) with check (is_super_admin());

-- ─── hotels ──────────────────────────────────────────────────────────────────
create policy hotels_read on hotels for select using (
  is_super_admin() or company_id = current_company_id() or id = current_hotel_id()
);
create policy hotels_write on hotels for all
  using (is_super_admin() or (company_id = current_company_id() and current_level() <= 2))
  with check (is_super_admin() or (company_id = current_company_id() and current_level() <= 2));

-- ─── profiles ────────────────────────────────────────────────────────────────
-- Read profiles in your hotel; super admins read all. Edit only your own row
-- (admins can edit anyone in their hotel via the write policy).
create policy profiles_read on profiles for select using (
  is_super_admin() or hotel_id = current_hotel_id() or id = auth.uid()
);
create policy profiles_update_self on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_write on profiles for all
  using (is_super_admin() or (hotel_id = current_hotel_id() and current_level() <= 2))
  with check (is_super_admin() or (hotel_id = current_hotel_id() and current_level() <= 2));

-- ─── Generic hotel-scoped tables ─────────────────────────────────────────────
-- Read = same hotel (or super admin). Write = admins/chiefs (level<=3).
-- Applied to: teams, staff, activities, schedule_entries, assignments,
-- announcements, events, performance_scores.

do $$
declare tbl text;
begin
  foreach tbl in array array[
    'teams','staff','activities','schedule_entries','assignments',
    'announcements','events','performance_scores'
  ]
  loop
    execute format($f$
      create policy %1$s_read on %1$s for select
      using (is_super_admin() or hotel_id = current_hotel_id());
    $f$, tbl);

    execute format($f$
      create policy %1$s_write on %1$s for all
      using (is_super_admin() or (hotel_id = current_hotel_id() and current_level() <= 3))
      with check (is_super_admin() or (hotel_id = current_hotel_id() and current_level() <= 3));
    $f$, tbl);
  end loop;
end$$;

-- ─── leave_requests ──────────────────────────────────────────────────────────
-- Read: your hotel. Insert: any staffer for themselves. Approve/reject: level<=3.
create policy leave_read on leave_requests for select using (
  is_super_admin() or hotel_id = current_hotel_id()
);
create policy leave_insert on leave_requests for insert with check (
  hotel_id = current_hotel_id()
);
create policy leave_review on leave_requests for update
  using (is_super_admin() or (hotel_id = current_hotel_id() and current_level() <= 3))
  with check (is_super_admin() or (hotel_id = current_hotel_id() and current_level() <= 3));

-- ─── task_state ──────────────────────────────────────────────────────────────
-- Any staffer in the hotel can mark a task started/completed (they're acting on
-- their own assigned work). Read = hotel-scoped.
create policy task_state_read on task_state for select using (
  is_super_admin() or hotel_id = current_hotel_id()
);
create policy task_state_write on task_state for all
  using (hotel_id = current_hotel_id())
  with check (hotel_id = current_hotel_id());

-- ─── feedback ────────────────────────────────────────────────────────────────
-- Guests submit feedback (insert open to anon for the public guest surface);
-- staff read their hotel's feedback.
create policy feedback_read on feedback for select using (
  is_super_admin() or hotel_id = current_hotel_id()
);
create policy feedback_insert_public on feedback for insert with check (true);

-- ─── applications ────────────────────────────────────────────────────────────
-- Public careers page inserts; admins/chiefs of the hotel read + manage.
create policy applications_insert_public on applications for insert with check (true);
create policy applications_read on applications for select using (
  is_super_admin() or (hotel_id = current_hotel_id() and current_level() <= 3)
);
create policy applications_write on applications for update
  using (is_super_admin() or (hotel_id = current_hotel_id() and current_level() <= 3))
  with check (is_super_admin() or (hotel_id = current_hotel_id() and current_level() <= 3));
