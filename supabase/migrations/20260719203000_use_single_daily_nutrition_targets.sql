-- Replace per-user daily nutrition ranges with single daily targets.
-- Existing saved ranges are converted by midpoint before legacy columns are
-- removed. Historical food log rows are not changed.

update public.daily_goals
set
  calories_target = (greatest(coalesce(calories_min, calories_target, 0), 0) + greatest(coalesce(calories_max, calories_target, 0), 0)) / 2,
  protein_target = (greatest(coalesce(protein_min, protein_target, 0), 0) + greatest(coalesce(protein_max, protein_target, 0), 0)) / 2,
  carbohydrates_target = (greatest(coalesce(carbohydrates_min, carbohydrates_target, 0), 0) + greatest(coalesce(carbohydrates_max, carbohydrates_target, 0), 0)) / 2,
  fat_target = (greatest(coalesce(fat_min, fat_target, 0), 0) + greatest(coalesce(fat_max, fat_target, 0), 0)) / 2;

alter table public.daily_goals
  drop constraint if exists daily_goals_nonnegative_calories_range,
  drop constraint if exists daily_goals_nonnegative_protein_range,
  drop constraint if exists daily_goals_nonnegative_carbohydrates_range,
  drop constraint if exists daily_goals_nonnegative_fat_range,
  drop constraint if exists daily_goals_calories_range_order,
  drop constraint if exists daily_goals_protein_range_order,
  drop constraint if exists daily_goals_carbohydrates_range_order,
  drop constraint if exists daily_goals_fat_range_order;

alter table public.daily_goals
  drop column if exists calories_min,
  drop column if exists calories_max,
  drop column if exists protein_min,
  drop column if exists protein_max,
  drop column if exists carbohydrates_min,
  drop column if exists carbohydrates_max,
  drop column if exists fat_min,
  drop column if exists fat_max;

alter table public.daily_goals
  alter column calories_target set not null,
  alter column protein_target set not null,
  alter column carbohydrates_target set not null,
  alter column fat_target set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_nonnegative_calories_target'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_nonnegative_calories_target check (calories_target >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_nonnegative_protein_target'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_nonnegative_protein_target check (protein_target >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_nonnegative_carbohydrates_target'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_nonnegative_carbohydrates_target check (carbohydrates_target >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_nonnegative_fat_target'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_nonnegative_fat_target check (fat_target >= 0);
  end if;
end $$;

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
    carbohydrates_target,
    fat_target
  )
  values (
    new.id,
    current_date,
    2000,
    100,
    250,
    70
  )
  on conflict (user_id, effective_date) do nothing;

  return new;
end;
$$;

alter table public.daily_goals enable row level security;

revoke all on table public.daily_goals from anon, authenticated;
grant select, insert, update on table public.daily_goals to authenticated;

revoke all on function public.handle_new_user_profile() from public, anon, authenticated;
