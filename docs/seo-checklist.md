# Ranking #1 for "Race Dynamics" / "RaceDynamics Lucknow"

Two different kinds of work get you there. **On-page** (the code) is what
this repo controls, and it's already in good shape. **Off-page** (Google
Business Profile, backlinks, reviews, citations) is what actually decides
whether a *branded* search — someone typing your own name — puts you first.
For a branded query, off-page is 80% of the outcome. No amount of code fixes
a Google Business Profile that doesn't exist.

---

## 1. What's already done in code

- Every page has a unique, keyword-real `<title>` and description, and now
  an explicit canonical tag (`about`, `contact`, `sell`, `inventory`,
  `accessories`, `privacy`, every `/bike/[slug]`) — one authoritative URL
  per page, so ranking signals aren't split across duplicates.
- `AutoDealer` structured data (`src/components/JsonLd.tsx`) with the real
  address, phone, geo-coordinates, a Google Maps link, and social profiles —
  this is what makes Google confident enough to show a knowledge panel /
  local pack entry instead of just a blue link.
- Added **`alternateName`** to that same schema: `RaceDynamics`,
  `Race Dynamics Lucknow`, `RaceDynamics Lucknow`, `Race Dynamics
  Motorcycles` — every real way someone types the name, tied to one entity
  instead of left for Google to guess at.
- Added a **`WebSite`** schema with a working `SearchAction` — `/inventory`
  now accepts `?search=`, so Google is eligible to show a search box right
  under the homepage result for a branded query (a "sitelinks searchbox").
- Each bike gets `Vehicle`/`Offer` structured data (price, mileage,
  availability) — what puts a price directly in the search result.
- Fixed the homepage's `<h1>`, which was previously just a logo image with a
  one-word alt text — it now carries real, hidden-but-crawlable text: "Race
  Dynamics — [tagline]". A logo image alone told Google almost nothing about
  what the page is; this is one of the highest-value single changes here.
- `sitemap.xml` (every bike, category and static page, regenerated hourly),
  `robots.txt`, and Open Graph/Twitter cards on every page.
- Wired up (but not filled in) Search Console and Bing site-verification —
  see step 2.

## 2. Do this first — it's the actual gate

**Nothing above matters until Google has crawled, indexed and verified this
site.** In order:

1. **Set `NEXT_PUBLIC_SITE_URL`** on the hosting platform (Vercel → Project →
   Settings → Environment Variables) to the real, final domain — not just in
   `.env.local`. Every canonical tag, the sitemap, and every Open Graph image
   depend on this being correct. If it's unset, they silently point at a
   `vercel.app` preview URL or `localhost` instead.
2. **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)):
   add the property for the real domain, verify it (the easiest way here is
   the HTML tag method — paste the code it gives you into
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in the same place as step 1, then
   redeploy), then submit `https://<domain>/sitemap.xml` under Sitemaps.
   Without this, Google may take weeks to notice the site exists at all.
3. **Bing Webmaster Tools** — same idea, smaller upside, five minutes:
   [www.bing.com/webmasters](https://www.bing.com/webmasters). Paste its code
   into `NEXT_PUBLIC_BING_SITE_VERIFICATION`.
4. After both are verified, use Search Console's **URL Inspection** tool on
   the homepage and request indexing manually — don't just wait for the
   crawler to get there on its own.

## 3. Claim and complete the Google Business Profile

This is the single biggest lever for "Race Dynamics" showing up first —
bigger than anything in the codebase. A branded search for a local business
is answered mostly from the Business Profile, not the website.

1. Go to [business.google.com](https://business.google.com) and claim (or
   create) the listing for Race Dynamics in Lucknow.
2. Business name: **exactly** `Race Dynamics` — not "Race Dynamics
   Motorcycles" or anything decorated, unless that's the literal signage.
   Consistency with the website is what Google cross-checks.
3. Category: **Motorcycle dealer** as primary (add "Used motorcycle dealer"
   or "Motorcycle repair shop" as secondary if accurate).
4. Address, phone number and website URL **must match this site's footer
   exactly** — same phone format, same address text. Mismatches are the most
   common reason a listing doesn't rank.
5. Add real photos — storefront, workshop, team, a few bikes. Listings with
   photos get shown more.
6. Set operating hours (including that it's closed Wednesdays, matching the
   site's banner).
7. Get this **verified** (usually a postcard or phone call from Google) —
   an unverified listing barely ranks at all.

## 4. Reviews

Review count and rating are a direct ranking input for local search, and the
fastest lever available once the listing is live:

- Ask every buyer to leave a Google review after collection — a simple
  WhatsApp message with the direct review link works better than asking in
  person.
- Respond to every review, good or bad — profiles that get owner responses
  rank measurably better.
- Never buy or fake reviews — Google actively detects and penalizes this,
  and it's the kind of penalty that's hard to undo.

## 5. Local citations (NAP consistency)

"NAP" = Name, Address, Phone — the same three facts, worded identically,
listed on other sites Google already trusts. List the business on:

- JustDial, Sulekha, IndiaMART, Yellow Pages India
- Facebook Page (Business, not personal profile) and Instagram bio, with the
  address and a link back to the site
- Any local Lucknow business directories or motorcycle-community forums

Same spelling, same phone format, same address, every time. A citation that
says "Race Dynamics Bikes" on one site and "Race Dynamics" on another is
actively confusing, not neutral.

## 6. Backlinks

Links from other real websites are still the strongest non-branded ranking
signal, and they help branded search too by building the site's overall
authority:

- Ask any motorcycle brands carried (Ducati, Triumph, Harley-Davidson
  dealer-locator pages, etc.) to list Race Dynamics as an authorized/partner
  dealer, linking to the site.
- Local news or motoring blogs covering a notable sale or event.
- Any sponsorship, riding club, or event page that would naturally link back.

## 7. Keep it simple

Don't chase things that don't move a branded search:

- **Meta keywords tag** — ignored by Google since ~2009, deliberately not
  added here.
- **Keyword stuffing** the copy with "Race Dynamics Lucknow" repeated — reads
  as spam to both readers and Google's ranking systems; the natural mentions
  already in the title, H1, footer and structured data are what matters.
- **Buying links or reviews** — actively harmful, not neutral.

---

**Summary of what to actually go do, in order:** set the real domain env var
→ verify Search Console + submit the sitemap → claim and verify the Google
Business Profile with matching NAP → start collecting reviews. That sequence
will move the needle far more than any further code change.
