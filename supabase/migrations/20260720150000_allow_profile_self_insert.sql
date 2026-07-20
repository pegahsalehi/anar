alter table public.profiles enable row level security;

do $$
begin
  create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);
exception
  when duplicate_object then null;
end $$;

grant select, insert, update on table public.profiles to authenticated;
revoke all on table public.profiles from anon;
