-- Standalone homepage content/images, run after 0008. Safe to re-run.
--
-- Two homepage images were accidentally wired to `bikes` when the Supabase
-- backend went in: the "Planning to sell" hero photo and each category
-- tile's photo were both picked as "the first bike with an image" / "the
-- first bike with an image in that category" — so adding or editing any
-- bike in the admin could silently change unrelated homepage sections, and
-- since a random bike photo isn't the cut-out-on-transparent-background shot
-- the hero slot expects, the section stopped looking "floating" too.
--
-- This gives both a home of their own: category tiles get a photo_path
-- column on `categories` itself, and singleton blocks like the sell-section
-- hero live in `site_content`, a small key → (heading, subheading, image)
-- table for whatever homepage content needs editing next without another
-- migration. Nothing here is required — every block has a bundled fallback
-- in the app code, so an empty table looks identical to how the site
-- shipped originally.

alter table categories add column if not exists photo_path text;

create table if not exists site_content (
  key         text primary key,
  heading     text,
  subheading  text,
  image_path  text,             -- path inside the "site-content" storage bucket
  updated_at  timestamptz not null default now()
);

insert into site_content (key) values ('planning_to_sell') on conflict (key) do nothing;

alter table site_content enable row level security;

drop policy if exists "public read site_content" on site_content;
create policy "public read site_content" on site_content for select using (true);

drop policy if exists "admins write site_content" on site_content;
create policy "admins write site_content" on site_content for all
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

drop trigger if exists site_content_touch on site_content;
create trigger site_content_touch before update on site_content
  for each row execute function set_updated_at();

-- ------------------------------------------------------------------ storage
insert into storage.buckets (id, name, public)
values ('site-content', 'site-content', true)
on conflict (id) do nothing;

drop policy if exists "public read site-content bucket" on storage.objects;
create policy "public read site-content bucket" on storage.objects
  for select using (bucket_id = 'site-content');

drop policy if exists "admins write site-content bucket" on storage.objects;
create policy "admins write site-content bucket" on storage.objects
  for insert with check (
    bucket_id = 'site-content'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins update site-content bucket" on storage.objects;
create policy "admins update site-content bucket" on storage.objects
  for update using (
    bucket_id = 'site-content'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins delete site-content bucket" on storage.objects;
create policy "admins delete site-content bucket" on storage.objects
  for delete using (
    bucket_id = 'site-content'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );
