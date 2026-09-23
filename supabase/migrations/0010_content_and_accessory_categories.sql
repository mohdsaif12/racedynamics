-- Two independent additions, run after 0009. Safe to re-run.
--
-- 1. Widens site_content with a `body` column, and seeds three more block
--    keys, so the rest of the homepage's hardcoded copy/photos (the About
--    band, the Trust band, and the footer's About-us blurb) can move into
--    /admin/content the same way "Planning to sell?" already did.
--
-- 2. Gives accessories a category, the same shape bikes already have
--    (free text, not a separate table — accessory categories are a short,
--    owner-picked list like "Helmets" or "Riding Gear", not something that
--    needs its own slug/blurb/routing the way bike categories do).

alter table site_content add column if not exists body text;

insert into site_content (key) values ('about_band')   on conflict (key) do nothing;
insert into site_content (key) values ('trust_band')   on conflict (key) do nothing;
insert into site_content (key) values ('footer_about') on conflict (key) do nothing;

alter table accessories add column if not exists category text not null default '';
create index if not exists accessories_category_idx on accessories(category);

-- Backfill categories on the demo rows from 0008_accessories_seed.sql, so the
-- new category filter on /accessories has something to show immediately.
-- Guarded by category = '' so it never overwrites a category someone has
-- already set by hand.
update accessories set category = 'Helmets'
  where slug in ('agv-k3-helmet', 'shark-modular-helmet') and category = '';
update accessories set category = 'Riding Gear'
  where slug in ('riding-jacket-mesh', 'rain-suit') and category = '';
update accessories set category = 'Protection'
  where slug in ('riding-gloves-leather', 'knee-guards') and category = '';
update accessories set category = 'Bike Care'
  where slug = 'bike-cover' and category = '';
update accessories set category = 'Electronics'
  where slug = 'bluetooth-intercom' and category = '';
