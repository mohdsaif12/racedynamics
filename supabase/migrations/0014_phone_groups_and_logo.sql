-- Grouped contact numbers + an uploadable header logo. Run after 0013.
-- Safe to re-run.
--
-- 1. phone_groups — the shop runs several lines, each for a different job
--    (sales, buying bikes in, lamination/servicing). Two fixed columns
--    (phone_primary / phone_secondary) can't hold that, so the groups live in
--    one jsonb array the dashboard edits as a whole:
--
--      [{ "label": "Sales team", "numbers": ["+91 63921 68237", ...] }, ...]
--
--    phone_primary stays as-is: it's still the one number behind the
--    floating "Call" button and the closed-day banner.
--
-- 2. logo_path — path inside the "site-content" bucket for a replacement
--    header logo. Null means the bundled /brand/racedynamics.webp.

alter table site_settings add column if not exists phone_groups jsonb not null default '[]'::jsonb;
alter table site_settings add column if not exists logo_path text;

-- Seed with the numbers the client sent, only if nobody has set any yet.
update site_settings
set phone_groups = '[
  {"label": "Sales team", "numbers": ["+91 63921 68237", "+91 93362 29652"]},
  {"label": "For selling your bike", "numbers": ["+91 91184 52729"]},
  {"label": "Lamination & servicing", "numbers": ["+91 95556 33948"]}
]'::jsonb
where id = 1 and phone_groups = '[]'::jsonb;
