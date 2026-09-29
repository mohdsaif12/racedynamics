-- Storage bucket for the homepage's autoplaying showcase-card videos, run
-- after 0011. Same shape as the "bikes" bucket in 0002_storage.sql: public
-- read (needed, they play on the live site), admin-only write.
--
-- Bucket id is literally "bike videos" (with a space) — created manually
-- through the Supabase dashboard before this migration existed, confirmed
-- from the dashboard's "Edit bucket" screen. Bucket ids can't be renamed
-- after creation, so the code matches the space rather than the other way
-- round.
--
-- These videos are NOT tied to individual bikes (there's no bikes.video_path
-- column) — the homepage's TiltedStrip section just lists whatever's in this
-- bucket and plays up to 5 of them. Drop a file in via the Supabase dashboard
-- (or later, an admin upload screen) and it shows up automatically.
--
-- Safe to re-run — same drop-then-create pattern as 0002_storage.sql.

-- `do update` (not `do nothing`) because the bucket already exists from the
-- manual dashboard creation — this just guarantees `public` stays true.
insert into storage.buckets (id, name, public)
values ('bike videos', 'bike videos', true)
on conflict (id) do update set public = true;

drop policy if exists "public read bike videos bucket" on storage.objects;
create policy "public read bike videos bucket" on storage.objects
  for select using (bucket_id = 'bike videos');

drop policy if exists "admins write bike videos bucket" on storage.objects;
create policy "admins write bike videos bucket" on storage.objects
  for insert with check (
    bucket_id = 'bike videos'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins update bike videos bucket" on storage.objects;
create policy "admins update bike videos bucket" on storage.objects
  for update using (
    bucket_id = 'bike videos'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins delete bike videos bucket" on storage.objects;
create policy "admins delete bike videos bucket" on storage.objects
  for delete using (
    bucket_id = 'bike videos'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );
