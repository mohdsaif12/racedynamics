-- RaceDynamics — core schema
-- Run this once in the Supabase project's SQL editor (Dashboard → SQL Editor
-- → New query → paste → Run). It creates every table the admin dashboard and
-- public site read from, plus the storage bucket bike photos live in.

-- ---------------------------------------------------------------- categories
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  blurb       text not null default '',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- --------------------------------------------------------------------- bikes
create table if not exists bikes (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  brand         text not null,
  model         text not null,        -- short name, used on the ghost wordmark
  full_name     text not null,        -- e.g. "Fat Bob 114"
  category_id   uuid not null references categories(id) on delete restrict,
  year          int not null,
  km            int not null default 0,
  location      text not null default '',
  engine_cc     int not null default 0,
  price_inr     int,                  -- null = "on request"
  status        text not null default 'available'
                  check (status in ('available','booked','sold','on-request')),
  featured      boolean not null default false,  -- shows on the homepage showroom
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists bikes_category_idx on bikes(category_id);
create index if not exists bikes_status_idx on bikes(status);

-- One bike can have several photos; the first (lowest sort_order) is the cover.
create table if not exists bike_images (
  id          uuid primary key default gen_random_uuid(),
  bike_id     uuid not null references bikes(id) on delete cascade,
  path        text not null,   -- path inside the "bikes" storage bucket
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists bike_images_bike_idx on bike_images(bike_id);

-- ------------------------------------------------------------ site settings
-- Single row (id = 1) holding the values that used to be hardcoded in
-- src/lib/site.ts — phone numbers, address, tagline, the four homepage stats.
create table if not exists site_settings (
  id                  int primary key default 1,
  phone_primary       text not null default '',
  phone_secondary     text not null default '',
  whatsapp            text not null default '',   -- digits only, no +
  email               text not null default '',
  address             text not null default '',
  tagline             text not null default '',
  description         text not null default '',
  stat_bikes_sold     int not null default 0,
  stat_years_trading  int not null default 0,
  stat_cities         int not null default 0,
  stat_avg_days       int not null default 0,
  instagram_url       text not null default '',
  facebook_url        text not null default '',
  youtube_url         text not null default '',
  updated_at          timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

-- --------------------------------------------------------------- testimonials
create table if not exists testimonials (
  id          uuid primary key default gen_random_uuid(),
  quote       text not null,
  name        text not null,
  bike_bought text not null default '',
  photo_path  text,             -- path inside the "owners" storage bucket
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- --------------------------------------------------------------------- admin
-- Who is allowed into /admin. Supabase Auth handles passwords; this table just
-- says which authenticated users are staff. Add the client's email here after
-- they sign up once through /admin/login.
create table if not exists admin_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------------- RLS
-- Public (anon) visitors may only READ. All writes require an authenticated
-- admin_users row — enforced below, not just in the app, so a leaked anon key
-- can never be used to edit the catalogue.
alter table categories enable row level security;
alter table bikes enable row level security;
alter table bike_images enable row level security;
alter table site_settings enable row level security;
alter table testimonials enable row level security;
alter table admin_users enable row level security;

drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);
drop policy if exists "public read bikes" on bikes;
create policy "public read bikes" on bikes for select using (true);
drop policy if exists "public read bike_images" on bike_images;
create policy "public read bike_images" on bike_images for select using (true);
drop policy if exists "public read site_settings" on site_settings;
create policy "public read site_settings" on site_settings for select using (true);
drop policy if exists "public read testimonials" on testimonials;
create policy "public read testimonials" on testimonials for select using (true);

drop policy if exists "admins write categories" on categories;
create policy "admins write categories" on categories for all
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

drop policy if exists "admins write bikes" on bikes;
create policy "admins write bikes" on bikes for all
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

drop policy if exists "admins write bike_images" on bike_images;
create policy "admins write bike_images" on bike_images for all
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

drop policy if exists "admins write site_settings" on site_settings;
create policy "admins write site_settings" on site_settings for all
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

drop policy if exists "admins write testimonials" on testimonials;
create policy "admins write testimonials" on testimonials for all
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

drop policy if exists "self read admin_users" on admin_users;
create policy "self read admin_users" on admin_users for select
  using (user_id = auth.uid());

-- keeps updated_at honest on every edit
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists bikes_touch on bikes;
create trigger bikes_touch before update on bikes
  for each row execute function set_updated_at();
