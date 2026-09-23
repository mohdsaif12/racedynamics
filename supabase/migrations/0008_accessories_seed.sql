-- Sample accessories, run after 0007_accessories.sql. Safe to re-run.
--
-- Demo content only — no photos are referenced (there's no equivalent of
-- public/bikes/*.webp for accessories yet), so every row shows the "No
-- photo" placeholder on the admin list and a plain image-less card on
-- /accessories until real photos are uploaded through /admin/accessories.
-- Delete these from the admin screen once real stock is added.

insert into accessories (slug, name, description, price_inr, status, featured, sort_order) values
  ('agv-k3-helmet',        'AGV K3 Helmet',              'Full-face, DOT certified, multiple sizes in stock.',           7500,  'in-stock',     true,  1),
  ('shark-modular-helmet', 'Shark Evo-GT Modular Helmet', 'Flip-up modular, matte black.',                                18500, 'in-stock',     true,  2),
  ('riding-jacket-mesh',   'Rynox Air GT Riding Jacket',  'Mesh summer jacket with CE armour, sizes M–XXL.',              6200,  'in-stock',     true,  3),
  ('riding-gloves-leather','Alpinestars Leather Gloves',  'Full leather, knuckle protection.',                            3200,  'in-stock',     false, 4),
  ('knee-guards',          'Knee & Elbow Guard Set',      'CE-rated impact protection, one size fits most.',              1800,  'in-stock',     false, 5),
  ('bike-cover',           'Waterproof Bike Cover',       'Large size, fits most cruisers and tourers.',                  1200,  'in-stock',     false, 6),
  ('rain-suit',            'Two-Piece Rain Suit',         'Jacket + pants, packs into its own pouch.',                    2500,  'out-of-stock', false, 7),
  ('bluetooth-intercom',   'Bluetooth Helmet Intercom',   'Rider-to-rider comms, up to 1km range.',                       null,  'in-stock',     false, 8)
on conflict (slug) do nothing;
