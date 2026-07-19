-- Anar private nutrition schema.
-- The Supabase project has "Automatically expose new tables" disabled, so this
-- migration grants only the privileges the authenticated app needs.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  timezone text not null default 'UTC',
  preferred_theme text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (
    display_name is null or char_length(display_name) <= 80
  ),
  constraint profiles_timezone_length check (
    char_length(timezone) between 1 and 100
  ),
  constraint profiles_preferred_theme_check check (
    preferred_theme in ('system', 'light', 'dark')
  )
);

create table public.daily_goals (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  effective_date date not null,
  calories_target numeric(10, 2) not null,
  protein_target numeric(10, 2) not null,
  carbohydrates_target numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_goals_positive_calories check (calories_target > 0),
  constraint daily_goals_positive_protein check (protein_target > 0),
  constraint daily_goals_positive_carbohydrates check (carbohydrates_target > 0),
  constraint daily_goals_user_effective_date_unique unique (user_id, effective_date)
);

create table public.foods (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  image_path text,
  calories_per_100g numeric(10, 2) not null,
  protein_per_100g numeric(10, 2) not null,
  carbohydrates_per_100g numeric(10, 2) not null,
  notes text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint foods_name_length check (char_length(btrim(name)) between 1 and 120),
  constraint foods_notes_length check (notes is null or char_length(notes) <= 1000),
  constraint foods_nonnegative_calories check (calories_per_100g >= 0),
  constraint foods_nonnegative_protein check (protein_per_100g >= 0),
  constraint foods_nonnegative_carbohydrates check (carbohydrates_per_100g >= 0)
);

create table public.food_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid references public.foods(id) on delete set null,
  consumed_grams numeric(10, 2) not null,
  logged_at timestamptz not null default now(),
  local_log_date date not null,
  food_name_snapshot text not null,
  image_path_snapshot text,
  calories_per_100g_snapshot numeric(10, 2) not null,
  protein_per_100g_snapshot numeric(10, 2) not null,
  carbohydrates_per_100g_snapshot numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint food_logs_positive_grams check (consumed_grams > 0),
  constraint food_logs_name_snapshot_length check (
    char_length(btrim(food_name_snapshot)) between 1 and 120
  ),
  constraint food_logs_nonnegative_calories check (calories_per_100g_snapshot >= 0),
  constraint food_logs_nonnegative_protein check (protein_per_100g_snapshot >= 0),
  constraint food_logs_nonnegative_carbohydrates check (
    carbohydrates_per_100g_snapshot >= 0
  )
);

create index daily_goals_user_effective_date_idx
  on public.daily_goals (user_id, effective_date desc);

create index foods_user_deleted_at_idx
  on public.foods (user_id, deleted_at);

create index foods_user_name_idx
  on public.foods (user_id, name);

create index foods_user_favorite_idx
  on public.foods (user_id, is_favorite)
  where deleted_at is null;

create index food_logs_user_local_log_date_idx
  on public.food_logs (user_id, local_log_date desc);

create index food_logs_user_logged_at_idx
  on public.food_logs (user_id, logged_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger daily_goals_set_updated_at
before update on public.daily_goals
for each row execute function public.set_updated_at();

create trigger foods_set_updated_at
before update on public.foods
for each row execute function public.set_updated_at();

create trigger food_logs_set_updated_at
before update on public.food_logs
for each row execute function public.set_updated_at();

create or replace function public.ensure_food_log_food_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.food_id is not null and not exists (
    select 1
    from public.foods
    where foods.id = new.food_id
      and foods.user_id = new.user_id
  ) then
    raise exception 'food_id does not belong to the food log owner';
  end if;

  return new;
end;
$$;

create trigger food_logs_food_owner_check
before insert or update of user_id, food_id on public.food_logs
for each row execute function public.ensure_food_log_food_owner();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_timezone text;
  requested_display_name text;
begin
  requested_timezone := nullif(new.raw_user_meta_data ->> 'timezone', '');
  requested_display_name := nullif(new.raw_user_meta_data ->> 'display_name', '');

  insert into public.profiles (
    id,
    display_name,
    timezone,
    preferred_theme
  )
  values (
    new.id,
    requested_display_name,
    coalesce(requested_timezone, 'UTC'),
    'system'
  )
  on conflict (id) do nothing;

  insert into public.daily_goals (
    user_id,
    effective_date,
    calories_target,
    protein_target,
    carbohydrates_target
  )
  values (
    new.id,
    current_date,
    2000,
    100,
    250
  )
  on conflict (user_id, effective_date) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

alter table public.profiles enable row level security;
alter table public.daily_goals enable row level security;
alter table public.foods enable row level security;
alter table public.food_logs enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "daily_goals_select_own"
on public.daily_goals
for select
to authenticated
using (auth.uid() = user_id);

create policy "daily_goals_insert_own"
on public.daily_goals
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "daily_goals_update_own"
on public.daily_goals
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "foods_select_own"
on public.foods
for select
to authenticated
using (auth.uid() = user_id);

create policy "foods_insert_own"
on public.foods
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "foods_update_own"
on public.foods
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "food_logs_select_own"
on public.food_logs
for select
to authenticated
using (auth.uid() = user_id);

create policy "food_logs_insert_own"
on public.food_logs
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "food_logs_update_own"
on public.food_logs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "food_logs_delete_own"
on public.food_logs
for delete
to authenticated
using (auth.uid() = user_id);

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.daily_goals from anon, authenticated;
revoke all on table public.foods from anon, authenticated;
revoke all on table public.food_logs from anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, update on table public.daily_goals to authenticated;
grant select, insert, update on table public.foods to authenticated;
grant select, insert, update, delete on table public.food_logs to authenticated;

-- No sequence privileges are granted: every app-owned primary key uses UUIDs,
-- so authenticated users do not need access to sequences for inserts.

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.ensure_food_log_food_owner() from public, anon, authenticated;
revoke all on function public.handle_new_user_profile() from public, anon, authenticated;
