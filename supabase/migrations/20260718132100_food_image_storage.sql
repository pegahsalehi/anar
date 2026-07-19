-- Private food image storage. Bucket files must be stored under:
-- {auth.uid()}/{collision-resistant-file-name}
-- This migration creates no app-owned tables or sequences, so it does not grant
-- table or sequence privileges. Access is constrained with Storage RLS policies.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'food-images',
  'food-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "food_images_select_own" on storage.objects;
drop policy if exists "food_images_insert_own" on storage.objects;
drop policy if exists "food_images_update_own" on storage.objects;
drop policy if exists "food_images_delete_own" on storage.objects;

create policy "food_images_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'food-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "food_images_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'food-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "food_images_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'food-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'food-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "food_images_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'food-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
