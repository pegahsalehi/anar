alter table public.profiles
  drop constraint if exists profiles_avatar_id_check;

alter table public.profiles
  alter column avatar_id set default '1';

update public.profiles
set avatar_id = case avatar_id
  when 'pomegranate' then '4'
  when 'avocado' then '1'
  when 'strawberry' then '2'
  when 'carrot' then '6'
  when 'lemon' then '3'
  when 'walnut' then '9'
  when '1' then '1'
  when '2' then '2'
  when '3' then '3'
  when '4' then '4'
  when '5' then '5'
  when '6' then '6'
  when '7' then '7'
  when '8' then '8'
  when '9' then '9'
  else '1'
end;

do $$
begin
  alter table public.profiles
    add constraint profiles_avatar_id_check
    check (avatar_id in ('1', '2', '3', '4', '5', '6', '7', '8', '9'));
exception
  when duplicate_object then null;
end $$;
