-- Seed data — the same 19 bikes that were hardcoded in src/lib/inventory.ts,
-- now as real database rows. This is what makes the site show real content
-- the moment the database goes live, instead of an empty inventory page.
--
-- Bike photos referenced here (bike_images.path) are the ones already sitting
-- in public/bikes/*.webp. They still need uploading into the "bikes" Storage
-- bucket under the same filenames — see docs/admin-setup.md for the one-time
-- upload step.

insert into categories (slug, name, blurb, sort_order) values
  ('sport',     'Sport',     'Track-bred, fully faired, built to be revved.', 1),
  ('cruiser',   'Cruiser',   'Torque, chrome and a long wheelbase.', 2),
  ('adventure', 'Adventure', 'Tall, loaded, and happiest a long way from Lucknow.', 3),
  ('touring',   'Touring',   'Built for the whole highway, not the first corner.', 4),
  ('roadster',  'Roadster',  'Naked, upright, and honest about it.', 5),
  ('classic',   'Classic',   'Older iron, correctly sorted.', 6)
on conflict (slug) do nothing;

-- helper CTE pattern: insert a bike, then its cover image, per row.
with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'fatbob-114-2022', 'Harley-Davidson', 'Fatbob', 'Fat Bob 114', id, 2022, 2500, 'Chandigarh', 1868, 1575000, 'available', 1
  from categories where slug = 'cruiser'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'fatbob-114-2022.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'fatboy-114-2023', 'Harley-Davidson', 'Fatboy', 'Fat Boy 114', id, 2023, 4100, 'Bengaluru', 1868, 1890000, 'booked', 2
  from categories where slug = 'cruiser'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'fatboy-114-2023.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'iron-883-2015', 'Harley-Davidson', 'Iron 883', 'Iron 883', id, 2015, 7600, 'Gurugram', 883, 650000, 'available', 3
  from categories where slug = 'cruiser'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'iron-883-2015.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'diavel-1260s-2021', 'Ducati', 'Diavel', 'Diavel 1260 S', id, 2021, 6800, 'Lucknow', 1262, 1650000, 'available', 4
  from categories where slug = 'cruiser'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'diavel-1260s-2021.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'chief-dark-horse-2020', 'Indian', 'Chief', 'Chief Dark Horse', id, 2020, 11200, 'Delhi', 1890, 1450000, 'on-request', 5
  from categories where slug = 'cruiser'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'chief-dark-horse-2020.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, featured, sort_order)
  select 'ninja-1000sx-2021', 'Kawasaki', 'Ninja', 'Ninja 1000 SX', id, 2021, 10300, 'Delhi', 1043, 950000, 'available', false, 1
  from categories where slug = 'sport'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'ninja-1000sx.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, featured, sort_order)
  select 'panigale-v4-2022', 'Ducati', 'Panigale', 'Panigale V4', id, 2022, 3400, 'Mumbai', 1103, 2450000, 'available', true, 2
  from categories where slug = 'sport'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'panigale-v4.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, featured, sort_order)
  select 's1000rr-2020', 'BMW', 'S1000RR', 'S 1000 RR', id, 2020, 8900, 'Lucknow', 999, 1580000, 'booked', true, 3
  from categories where slug = 'sport'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 's1000rr.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, featured, sort_order)
  select 'rsv4-factory-2019', 'Aprilia', 'RSV4', 'RSV4 1100 Factory', id, 2019, 12400, 'Pune', 1078, 1720000, 'available', true, 4
  from categories where slug = 'sport'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'rsv4-factory.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'r1300gs-adventure-2025', 'BMW', 'R1300GS', 'R 1300 GS Adventure', id, 2025, 4200, 'Chandigarh', 1300, null, 'on-request', 1
  from categories where slug = 'adventure'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'r1300gs-adventure-2025.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'multistrada-v4s-2022', 'Ducati', 'Multistrada', 'Multistrada V4 S', id, 2022, 9100, 'Lucknow', 1158, 1980000, 'available', 2
  from categories where slug = 'adventure'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'multistrada-v4s-2022.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'tiger-900-rally-2021', 'Triumph', 'Tiger', 'Tiger 900 Rally Pro', id, 2021, 15600, 'Dehradun', 888, 1080000, 'available', 3
  from categories where slug = 'adventure'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'tiger-900-rally-2021.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'roadglide-117-2025', 'Harley-Davidson', 'Roadglide', 'Road Glide 117', id, 2025, 7000, 'Patna', 1923, null, 'on-request', 1
  from categories where slug = 'touring'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'roadglide-117-2025.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'k1600gt-2019', 'BMW', 'K1600', 'K 1600 GT', id, 2019, 22400, 'Delhi', 1649, 1350000, 'available', 2
  from categories where slug = 'touring'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'k1600gt-2019.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'streetfighter-v4-2023', 'Ducati', 'Streetfighter', 'Streetfighter V4', id, 2023, 2100, 'Lucknow', 1103, 2280000, 'available', 1
  from categories where slug = 'roadster'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'streetfighter-v4-2023.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'z900-2021', 'Kawasaki', 'Z900', 'Z900', id, 2021, 14800, 'Kanpur', 948, 680000, 'available', 2
  from categories where slug = 'roadster'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'z900.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'speed-triple-1200-2022', 'Triumph', 'Speed Triple', 'Speed Triple 1200 RS', id, 2022, 6300, 'Noida', 1160, 1420000, 'sold', 3
  from categories where slug = 'roadster'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'speed-triple-1200-2022.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'continental-gt650-2020', 'Royal Enfield', 'Continental', 'Continental GT 650', id, 2020, 18900, 'Lucknow', 648, 245000, 'available', 1
  from categories where slug = 'classic'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'continental-gt650-2020.webp', 0 from new_bike;

with new_bike as (
  insert into bikes (slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, sort_order)
  select 'bonneville-t120-2018', 'Triumph', 'Bonneville', 'Bonneville T120', id, 2018, 21500, 'Delhi', 1200, 720000, 'available', 2
  from categories where slug = 'classic'
  returning id
)
insert into bike_images (bike_id, path, sort_order)
select id, 'bonneville-t120-2018.webp', 0 from new_bike;

-- ------------------------------------------------------------ site settings
-- Same placeholder contact details that were in src/lib/site.ts. Update these
-- from /admin/settings once the client gives you the real numbers.
update site_settings set
  phone_primary      = '+919000000000',
  phone_secondary    = '+919000000001',
  whatsapp           = '919000000000',
  email              = 'hello@racedynamics.in',
  address            = 'Lucknow, Uttar Pradesh, India',
  tagline            = 'Pre-owned superbikes, correctly sorted.',
  description        = 'RaceDynamics buys and sells pre-owned superbikes in Lucknow — sport, cruiser, adventure, touring, roadster and classic machines, inspected and delivered across India.',
  stat_bikes_sold    = 480,
  stat_years_trading = 9,
  stat_cities        = 26,
  stat_avg_days      = 11,
  instagram_url      = 'https://instagram.com/',
  facebook_url       = 'https://facebook.com/',
  youtube_url        = 'https://youtube.com/'
where id = 1;
