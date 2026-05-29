-- ════════════════════════════════════════════════════════════════════════════
-- AnimaPro — Auth triggers + RLS helper functions (Phase 0)
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Auto-create a profile row when a user signs up ──────────────────────────
-- Supabase fires this on every new auth.users insert. We read optional metadata
-- the client passes at signup (full_name, hotel_id) so an invited staffer lands
-- in the right hotel immediately. Role defaults to ANIMATOR; an admin promotes.

create or replace function handle_new_user() returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, initials, role, hotel_id, company_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'initials', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'ANIMATOR'),
    (new.raw_user_meta_data->>'hotel_id')::uuid,
    (new.raw_user_meta_data->>'company_id')::uuid
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── RLS helper functions ────────────────────────────────────────────────────
-- These read the CURRENT user's tenancy from their profile. RLS policies call
-- them so each policy stays a one-liner. SECURITY DEFINER + a stable search_path
-- so they can read profiles even while RLS is active on that table.

create or replace function current_hotel_id() returns uuid
language sql stable security definer set search_path = public
as $$ select hotel_id from public.profiles where id = auth.uid() $$;

create or replace function current_company_id() returns uuid
language sql stable security definer set search_path = public
as $$ select company_id from public.profiles where id = auth.uid() $$;

create or replace function current_role() returns user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

-- Numeric authority level matching lib/roles.ts (1 = highest). Used by policies
-- that gate writes to admins/chiefs only.
create or replace function current_level() returns int
language sql stable security definer set search_path = public
as $$
  select case (select role from public.profiles where id = auth.uid())
    when 'SUPER_ADMIN'     then 1
    when 'HOTEL_ADMIN'     then 2
    when 'ANIMATION_CHIEF' then 3
    when 'TEAM_LEADER'     then 4
    when 'ANIMATOR'        then 5
    when 'ENTERTAINER'     then 5
    when 'LIFEGUARD'       then 5
    when 'KIDS_CLUB'       then 5
    when 'DOOR_SCANNER'    then 6
    else 99
  end
$$;

-- True when the current user is a platform-wide super admin (sees all tenants).
create or replace function is_super_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select (select role from public.profiles where id = auth.uid()) = 'SUPER_ADMIN' $$;
