-- Add fat as a fourth nutrition metric while preserving existing RLS policies.
-- The Supabase project has "Automatically expose new tables" disabled, so this
-- migration reasserts only the table privileges the authenticated app needs.

alter table public.daily_goals
  add column if not exists fat_target numeric(10, 2) default 70;

update public.daily_goals
set fat_target = 70
where fat_target is null;

alter table public.daily_goals
  alter column fat_target set not null;

alter table public.foods
  add column if not exists fat_per_100g numeric(10, 2) default 0;

update public.foods
set fat_per_100g = 0
where fat_per_100g is null;

alter table public.foods
  alter column fat_per_100g set not null;

alter table public.food_logs
  add column if not exists fat_per_100g_snapshot numeric(10, 2) default 0;

update public.food_logs
set fat_per_100g_snapshot = 0
where fat_per_100g_snapshot is null;

alter table public.food_logs
  alter column fat_per_100g_snapshot set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_positive_fat'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_positive_fat check (fat_target > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'foods_nonnegative_fat'
      and conrelid = 'public.foods'::regclass
  ) then
    alter table public.foods
      add constraint foods_nonnegative_fat check (fat_per_100g >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'food_logs_nonnegative_fat'
      and conrelid = 'public.food_logs'::regclass
  ) then
    alter table public.food_logs
      add constraint food_logs_nonnegative_fat check (fat_per_100g_snapshot >= 0);
  end if;
end $$;

revoke all on table public.daily_goals from anon, authenticated;
revoke all on table public.foods from anon, authenticated;
revoke all on table public.food_logs from anon, authenticated;

grant select, insert, update on table public.daily_goals to authenticated;
grant select, insert, update on table public.foods to authenticated;
grant select, insert, update, delete on table public.food_logs to authenticated;

-- No sequence privileges are granted: every app-owned primary key uses UUIDs,
-- so authenticated users do not need access to sequences for inserts.
