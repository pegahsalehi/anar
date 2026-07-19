-- Repair the daily goal range save contract without weakening RLS.
-- This is forward-only and safe to apply after any subset of the earlier
-- daily-goal migrations. The Supabase project does not auto-expose tables, so
-- only authenticated receives the required table privileges.

alter table public.daily_goals
  add column if not exists fat_target numeric(10, 2) default 70,
  add column if not exists calories_min numeric(10, 2) default 2000,
  add column if not exists calories_max numeric(10, 2) default 2000,
  add column if not exists protein_min numeric(10, 2) default 100,
  add column if not exists protein_max numeric(10, 2) default 100,
  add column if not exists carbohydrates_min numeric(10, 2) default 250,
  add column if not exists carbohydrates_max numeric(10, 2) default 250,
  add column if not exists fat_min numeric(10, 2) default 70,
  add column if not exists fat_max numeric(10, 2) default 70;

update public.daily_goals
set
  calories_target = greatest(coalesce(calories_target, 0), 0),
  protein_target = greatest(coalesce(protein_target, 0), 0),
  carbohydrates_target = greatest(coalesce(carbohydrates_target, 0), 0),
  fat_target = greatest(coalesce(fat_target, 70), 0);

update public.daily_goals
set
  calories_min = greatest(coalesce(calories_min, calories_target, 0), 0),
  calories_max = greatest(coalesce(calories_max, calories_target, 0), 0),
  protein_min = greatest(coalesce(protein_min, protein_target, 0), 0),
  protein_max = greatest(coalesce(protein_max, protein_target, 0), 0),
  carbohydrates_min = greatest(coalesce(carbohydrates_min, carbohydrates_target, 0), 0),
  carbohydrates_max = greatest(coalesce(carbohydrates_max, carbohydrates_target, 0), 0),
  fat_min = greatest(coalesce(fat_min, fat_target, 0), 0),
  fat_max = greatest(coalesce(fat_max, fat_target, 0), 0);

update public.daily_goals
set calories_max = calories_min
where calories_min > calories_max;

update public.daily_goals
set protein_max = protein_min
where protein_min > protein_max;

update public.daily_goals
set carbohydrates_max = carbohydrates_min
where carbohydrates_min > carbohydrates_max;

update public.daily_goals
set fat_max = fat_min
where fat_min > fat_max;

alter table public.daily_goals
  alter column fat_target set not null,
  alter column calories_min set not null,
  alter column calories_max set not null,
  alter column protein_min set not null,
  alter column protein_max set not null,
  alter column carbohydrates_min set not null,
  alter column carbohydrates_max set not null,
  alter column fat_min set not null,
  alter column fat_max set not null;

alter table public.daily_goals
  drop constraint if exists daily_goals_positive_calories,
  drop constraint if exists daily_goals_positive_protein,
  drop constraint if exists daily_goals_positive_carbohydrates,
  drop constraint if exists daily_goals_positive_fat;

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

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_nonnegative_calories_range'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_nonnegative_calories_range check (
        calories_min >= 0 and calories_max >= 0
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_nonnegative_protein_range'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_nonnegative_protein_range check (
        protein_min >= 0 and protein_max >= 0
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_nonnegative_carbohydrates_range'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_nonnegative_carbohydrates_range check (
        carbohydrates_min >= 0 and carbohydrates_max >= 0
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_nonnegative_fat_range'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_nonnegative_fat_range check (
        fat_min >= 0 and fat_max >= 0
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_calories_range_order'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_calories_range_order check (calories_min <= calories_max);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_protein_range_order'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_protein_range_order check (protein_min <= protein_max);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_carbohydrates_range_order'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_carbohydrates_range_order check (
        carbohydrates_min <= carbohydrates_max
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_fat_range_order'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_fat_range_order check (fat_min <= fat_max);
  end if;
end $$;

delete from public.daily_goals daily_goals
using (
  select
    id,
    row_number() over (
      partition by user_id, effective_date
      order by updated_at desc, created_at desc, id desc
    ) as duplicate_rank
  from public.daily_goals
) ranked_goals
where daily_goals.id = ranked_goals.id
  and ranked_goals.duplicate_rank > 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_goals_user_effective_date_unique'
      and conrelid = 'public.daily_goals'::regclass
  ) then
    alter table public.daily_goals
      add constraint daily_goals_user_effective_date_unique unique (user_id, effective_date);
  end if;
end $$;

create index if not exists daily_goals_user_effective_date_idx
  on public.daily_goals (user_id, effective_date desc);

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
    fat_target,
    calories_min,
    calories_max,
    protein_min,
    protein_max,
    carbohydrates_min,
    carbohydrates_max,
    fat_min,
    fat_max
  )
  values (
    new.id,
    current_date,
    2000,
    100,
    250,
    70,
    2000,
    2000,
    100,
    100,
    250,
    250,
    70,
    70
  )
  on conflict (user_id, effective_date) do nothing;

  return new;
end;
$$;

alter table public.daily_goals enable row level security;

drop policy if exists "daily_goals_select_own" on public.daily_goals;
drop policy if exists "daily_goals_insert_own" on public.daily_goals;
drop policy if exists "daily_goals_update_own" on public.daily_goals;

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

revoke all on table public.daily_goals from anon, authenticated;
grant select, insert, update on table public.daily_goals to authenticated;

-- No sequence privileges are granted: daily_goals uses UUID primary keys
-- generated by extensions.gen_random_uuid(), so authenticated users do not
-- need sequences.

revoke all on function public.handle_new_user_profile() from public, anon, authenticated;
