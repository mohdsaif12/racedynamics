-- Makes the /about page's header + hero photo + intro copy editable from
-- admin, run after 0012. Safe to re-run.
--
-- The /about page was 100% hardcoded (src/app/(site)/about/page.tsx) — no
-- site_content wiring at all, unlike every other homepage block. This adds
-- one more key to the same site_content table from 0009/0010: heading (the
-- H1), subheading (the intro line under it), body (the three opening
-- paragraphs), image (the showcase banner). The rest of the page (key
-- pillars, the manifesto card, etc.) stays fixed brand copy, same scope as
-- how about_band only covers heading+body+image on the homepage.

insert into site_content (key) values ('about_page') on conflict (key) do nothing;
