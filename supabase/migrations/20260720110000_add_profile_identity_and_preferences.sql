alter table public.profiles
  add column if not exists avatar_id text not null default 'pomegranate',
  add column if not exists week_starts_on text not null default 'monday',
  add column if not exists time_format text not null default '12h';

update public.profiles
set avatar_id = 'pomegranate'
where avatar_id is null or btrim(avatar_id) = '';

update public.profiles
set week_starts_on = 'monday'
where week_starts_on is null or week_starts_on not in ('sunday', 'monday');

update public.profiles
set time_format = '12h'
where time_format is null or time_format not in ('12h', '24h');

do $$
begin
  alter table public.profiles
    add constraint profiles_avatar_id_check
    check (avatar_id in ('pomegranate', 'avocado', 'strawberry', 'carrot', 'lemon', 'walnut'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.profiles
    add constraint profiles_week_starts_on_check
    check (week_starts_on in ('sunday', 'monday'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.profiles
    add constraint profiles_time_format_check
    check (time_format in ('12h', '24h'));
exception
  when duplicate_object then null;
end $$;
