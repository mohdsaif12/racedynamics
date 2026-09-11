-- Storage buckets for bike and owner photos, run after 0001_init.sql.
-- Public bucket = anyone can view the images (needed — they're on the live
-- site); the policies below still restrict who can upload/delete to admins.
--
-- Safe to re-run. Postgres has no "create policy if not exists", and the
-- Supabase SQL editor runs the whole file as one transaction — so a single
-- "policy already exists" error rolls back everything and makes a partially
-- applied file impossible to repair by just running it again. Dropping first
-- makes each policy definition the one that wins, every time.

insert into storage.buckets (id, name, public)
values ('bikes', 'bikes', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('owners', 'owners', true)
on conflict (id) do nothing;

drop policy if exists "public read bikes bucket" on storage.objects;
create policy "public read bikes bucket" on storage.objects
  for select using (bucket_id = 'bikes');

drop policy if exists "public read owners bucket" on storage.objects;
create policy "public read owners bucket" on storage.objects
  for select using (bucket_id = 'owners');

drop policy if exists "admins write bikes bucket" on storage.objects;
create policy "admins write bikes bucket" on storage.objects
  for insert with check (
    bucket_id = 'bikes'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins update bikes bucket" on storage.objects;
create policy "admins update bikes bucket" on storage.objects
  for update using (
    bucket_id = 'bikes'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins delete bikes bucket" on storage.objects;
create policy "admins delete bikes bucket" on storage.objects
  for delete using (
    bucket_id = 'bikes'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins write owners bucket" on storage.objects;
create policy "admins write owners bucket" on storage.objects
  for insert with check (
    bucket_id = 'owners'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins update owners bucket" on storage.objects;
create policy "admins update owners bucket" on storage.objects
  for update using (
    bucket_id = 'owners'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins delete owners bucket" on storage.objects;
create policy "admins delete owners bucket" on storage.objects
  for delete using (
    bucket_id = 'owners'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );
