-- Instagram-style 24-hour stories, run after 0014.
--
-- The client snaps photos in the shop every day and uploads them from
-- /admin/stories. Each one shows on the public site's floating story bubble
-- for exactly 24 hours, then disappears.
--
-- How "disappears" works, in two layers:
--
--  1. Visibility (exact): the public read policy only returns rows younger
--     than 24 hours, so a story drops off the site to the second — no cron,
--     no cache to wait out (the bubble fetches from the browser, see
--     src/components/StoryBubble.tsx).
--
--  2. Deletion (housekeeping): the photo files themselves are removed through
--     the Storage API — Supabase blocks deleting files with plain SQL. That
--     happens every time the admin Stories page is opened, and once a day
--     from the Vercel cron in src/app/api/cron/purge-stories/route.ts when
--     SUPABASE_SERVICE_ROLE_KEY is set.
--
-- Safe to re-run — same drop-then-create pattern as 0002_storage.sql.

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  -- ~200px square crop for the bubble itself, so every visitor downloads a
  -- few KB instead of a full photo just to see the circle.
  thumb_path text,
  created_at timestamptz not null default now()
);

create index if not exists stories_created_at_idx on stories (created_at);

alter table stories enable row level security;

drop policy if exists "public read live stories" on stories;
create policy "public read live stories" on stories for select
  using (created_at > now() - interval '24 hours');

-- `for all` includes select, so admins also see expired rows — which is what
-- lets the admin page find and purge them.
drop policy if exists "admins write stories" on stories;
create policy "admins write stories" on stories for all
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('stories', 'stories', true)
on conflict (id) do update set public = true;

drop policy if exists "public read stories bucket" on storage.objects;
create policy "public read stories bucket" on storage.objects
  for select using (bucket_id = 'stories');

drop policy if exists "admins write stories bucket" on storage.objects;
create policy "admins write stories bucket" on storage.objects
  for insert with check (
    bucket_id = 'stories'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins update stories bucket" on storage.objects;
create policy "admins update stories bucket" on storage.objects
  for update using (
    bucket_id = 'stories'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins delete stories bucket" on storage.objects;
create policy "admins delete stories bucket" on storage.objects
  for delete using (
    bucket_id = 'stories'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );
