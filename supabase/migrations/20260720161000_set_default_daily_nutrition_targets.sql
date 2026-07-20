alter table public.daily_goals
  alter column calories_target set default 2000,
  alter column protein_target set default 50,
  alter column carbohydrates_target set default 275,
  alter column fat_target set default 78;

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
    50,
    275,
    78
  )
  on conflict (user_id, effective_date) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user_profile() from public, anon, authenticated;
