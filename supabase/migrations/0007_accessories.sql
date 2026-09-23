-- Accessories catalogue (helmets, gloves, jackets, etc.), run after 0006.
-- Safe to re-run. Mirrors the shape of `bikes` for admin-write / public-read,
-- and `testimonials` for a single cover photo rather than a gallery — an
-- accessory listing doesn't need multiple angles the way a bike sale does.

create table if not exists accessories (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text not null default '',
  price_inr    int,                  -- null = "on request"
  status       text not null default 'in-stock'
                 check (status in ('in-stock','out-of-stock')),
  featured     boolean not null default false,  -- shows on the homepage
  sort_order   int not null default 0,
  photo_path   text,                 -- path inside the "accessories" storage bucket
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists accessories_status_idx on accessories(status);

alter table accessories enable row level security;

drop policy if exists "public read accessories" on accessories;
create policy "public read accessories" on accessories for select using (true);

drop policy if exists "admins write accessories" on accessories;
create policy "admins write accessories" on accessories for all
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

-- set_updated_at() was created in 0001_init.sql.
drop trigger if exists accessories_touch on accessories;
create trigger accessories_touch before update on accessories
  for each row execute function set_updated_at();

-- ------------------------------------------------------------------ storage
insert into storage.buckets (id, name, public)
values ('accessories', 'accessories', true)
on conflict (id) do nothing;

drop policy if exists "public read accessories bucket" on storage.objects;
create policy "public read accessories bucket" on storage.objects
  for select using (bucket_id = 'accessories');

drop policy if exists "admins write accessories bucket" on storage.objects;
create policy "admins write accessories bucket" on storage.objects
  for insert with check (
    bucket_id = 'accessories'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins update accessories bucket" on storage.objects;
create policy "admins update accessories bucket" on storage.objects
  for update using (
    bucket_id = 'accessories'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins delete accessories bucket" on storage.objects;
create policy "admins delete accessories bucket" on storage.objects
  for delete using (
    bucket_id = 'accessories'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );
