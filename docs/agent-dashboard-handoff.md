# Race Dynamics — WhatsApp AI Sales Agent
## Handoff for the Dashboard Developer

The WhatsApp bot is live, running in n8n, independently of this website's
codebase. This document is everything needed to build the human-facing
control panel on top of the data it produces — as new screens inside the
**existing** `/admin` dashboard, not a separate app.

**You are not building or touching the bot.** Its migration
(`supabase/migrations/0006_wa_agent_dashboard.sql`) has already been run
against the project's Supabase database — the tables below exist right now.

---

## 1. How it works today

A customer messages the dealership's WhatsApp number, usually after seeing a
bike on Instagram, Facebook or YouTube. An AI agent replies in Hinglish,
answers strictly from live inventory, sends real bike photos, captures
qualification details, books showroom visits, and notifies the owner **only**
when something actionable happens.

```
Customer WhatsApp message
        ↓
n8n WF1 (Inbound)        receive, de-duplicate, transcribe voice, analyse images
        ↓
n8n WF2 (Processor)      wait for them to stop typing, ONE AI call, validate
        ↓                against live inventory, send reply + real photos
Supabase                 leads, appointments, full message log  ← you read this
        ↓
Owner notification       ONLY on: appointment booked, or customer asks for a human
```

**Design rule, not a suggestion:** the database is the source of truth, not
the AI. The bot has deterministic guards that override its own output
whenever it contradicts inventory (verified in the live n8n workflow — it
force-corrects the reply if the model claims a bike is unavailable when
`status = 'available'`, or vice versa). Your dashboard follows the same rule:
**show DB state, never re-derive or re-guess it.** `lead_status` in
particular is bot-computed — override it as an explicit admin action, never
silently recompute it from the transcript.

---

## 2. Database

One Supabase project, shared with the public website. Nothing here is a
separate database — `leads.bike_id` points at the same `bikes` table the
inventory pages already use.

### 2.1 Already exists — do not change the structure

| Table | Purpose |
|---|---|
| `bikes` | inventory. `id, slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, featured, sort_order, extra_specs, created_at, updated_at` |
| `bike_images` | `id, bike_id, path, sort_order, created_at`. `path` is a filename inside the public `bikes` storage bucket |
| `categories` | `id, slug, name, blurb, sort_order` |
| `site_settings` | single row (`id = 1`): `phone_primary, phone_secondary, whatsapp, email, address, tagline, description, stat_bikes_sold, stat_years_trading, stat_cities, stat_avg_days, instagram_url, facebook_url, youtube_url` |
| `admin_users` | `user_id (uuid, = auth.users.id), email` — who is allowed into `/admin`, agent screens included |
| `sell_enquiries` | the website's own "sell your bike" form — unrelated to WhatsApp leads |

**`bikes.status` is checked free text**: `available`, `sold`, `booked`,
`on-request`. The bot treats only **`available`** as sellable, re-reads it on
**every single customer message** — no cache to invalidate. If this dashboard
edits inventory, use exactly those four strings.

### 2.2 New — created by the agent, migration `0006_wa_agent_dashboard.sql` (already run)

The bot writes these with a service-role key that bypasses RLS, so they've
worked since day one. Migration 0006 only opens a narrow read/write path for
signed-in admins — it never touched how the bot itself writes.

#### `leads` — one row per customer phone number

`phone` is the **primary key**, not an id. Digits + country code, no `+`,
e.g. `917905581778`.

| Column | Type | Notes |
|---|---|---|
| `phone` | text PK | WhatsApp number |
| `wa_profile_name` | text | their WhatsApp display name |
| `customer_name` | text | name they actually gave |
| `interested_bike` | text | free text as the customer said it |
| `bike_id` | uuid → `bikes.id` | resolved, validated against real stock |
| `manufacturer`, `model`, `variant`, `preferred_year` | text | |
| `budget_inr` | integer | numeric rupees, e.g. `300000` |
| `budget_text` | text | as spoken, e.g. "3 lakh" |
| `city`, `usage`, `purchase_timeline` | text | |
| `finance_or_cash` | text | `cash` \| `finance` \| `undecided` |
| `exchange` | boolean | |
| `exchange_vehicle` | text | |
| `intent_signals` | text[] | e.g. `{asked_price,asked_photos,asked_to_visit}` — a real JS array in supabase-js |
| `buying_intent` | text | `low` \| `medium` \| `high` |
| `lead_status` | text | `COLD` \| `WARM` \| `HOT` \| `LOST` \| `SPAM` — bot-computed, never auto-recompute |
| `status_reason` | text | show as a tooltip on the badge — this is *why* it's HOT |
| `handoff_requested` | boolean | customer needs a human |
| `handoff_reason` | text | e.g. `visit_booked`, `asked_human` |
| `appointment_requested` | boolean | |
| `appointment_date` | date | |
| `appointment_time` | text | free text, e.g. "5 PM" |
| `salesperson` | text | **yours** — the bot never writes this |
| `summary` | text | 1–2 line summary written for the sales team — show prominently |
| `sales_notified_at` | timestamptz | when the owner was last WhatsApp-alerted |
| `last_message_at` | timestamptz | **sort the lead list by this** |
| `created_at`, `updated_at` | timestamptz | |

#### `appointments` — showroom visits / calls / test rides

A **unique partial index** allows only one row per phone in `requested` or
`confirmed` at a time — move it to `done`/`cancelled`/`no_show` before a new
one can be booked.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `phone` | text → `leads.phone` | cascade delete |
| `bike_id` | uuid → `bikes.id` | nullable |
| `bike_label` | text | denormalised name, survives bike deletion |
| `appt_type` | text | `showroom_visit` \| `call` \| `test_ride` |
| `appt_date` | date | **null = needs a call** — customer agreed to visit but never fixed a date |
| `appt_time` | text | free text |
| `notes`, `lead_status` | text | |
| `status` | text | `requested` → `confirmed` → `done` / `cancelled` / `no_show` |
| `created_at`, `updated_at` | timestamptz | |

#### `wa_messages` — full transcript, **read-only** from the dashboard

`id` is a chronological bigint — sort by it. `meta` (jsonb) may carry
`bike_id` on outbound photos.

Render these `body` conventions nicely rather than as raw text:

| Message looks like | Render it as |
|---|---|
| `[Voice note transcript] ...` | a voice-note bubble, transcript as caption |
| `[Customer sent an image.] AI image analysis (a guess, NOT verified against stock): brand=..., model=...` | flag clearly as an **unverified guess**, never present as matched inventory |
| outbound photo caption | a photo bubble — `meta.bike_id` often links back to the real bike sent |

#### `wa_conversations` — per-phone runtime state, the takeover switch

| Column | Type | Notes |
|---|---|---|
| `phone` | text PK → `leads.phone` | |
| `paused_until` | timestamptz | while in the future, **the bot stays silent** for this customer |
| `pause_reason` | text | |
| `locked_until`, `lock_token` | timestamptz, text | **never write to these** — internal bot concurrency control, driven by the bot's own `wa_claim_batch` RPC |

---

## 3. Access & RLS

The agent tables were created with RLS enabled and **no policies**, because
only the bot's service-role key needed them. A dashboard querying with a
normal admin session gets **zero rows and no error** — it just looks like an
empty database. This is the single most common "why is it broken" moment,
so read this before debugging anything else.

`0006_wa_agent_dashboard.sql` has already been run (SQL Editor → paste → Run
— same as every other migration in this repo, safe to re-run). Unlike the
earlier admin-only tables (`bikes`, `categories`, …), which check
`admin_users` inline on each policy, this one adds a small
`public.is_admin()` helper (`security definer`, checks `admin_users` for
`auth.uid()`) and uses it everywhere — functionally identical, just less
repetition across four tables.

**The part that's easy to miss:** RLS policies alone are not enough. Postgres
needs a table-level `grant select/update ... to authenticated` *and* a
passing RLS policy — without the grant, a signed-in admin still gets zero
rows with no error, the exact same symptom as a missing policy. The
migration grants `select, update` on `leads`, `appointments`,
`wa_conversations`, and `select` only on `wa_messages`.

| Who | leads / appointments / wa_conversations | wa_messages |
|---|---|---|
| admin (row in `admin_users`) | read + update | read only |
| signed in, not an admin | 0 rows | 0 rows |
| anon (public site key) | permission denied | permission denied |
| admin trying to edit `wa_messages` | — | permission denied (intended — the transcript is never editable) |

**Three rules:**
1. Browser uses the **anon key + Supabase Auth session** only — same as the
   rest of `/admin` already does. The service role key never reaches the
   client.
2. Admins are managed by inserting into `admin_users` — see
   `docs/admin-setup.md` for the exact SQL.
3. Never write to `wa_messages`, `locked_until`, or `lock_token`.

---

## 4. Screens to build

### Screen 1 — Leads (main screen)

List of `leads`, default sort `last_message_at desc`. Show name (fall back
`wa_profile_name` → `phone`), the `lead_status` badge, `interested_bike`,
budget (`budget_text` or formatted `budget_inr`), `city`, `last_message_at`,
and a `https://wa.me/{phone}` deeplink.

Filters: `lead_status`, has open appointment, date range, free-text search
across name / phone / interested bike.

```sql
select l.*, a.appt_date, a.appt_time, a.appt_type, a.status as appt_status
from leads l
left join appointments a
  on a.phone = l.phone and a.status in ('requested','confirmed')
order by l.last_message_at desc nulls last
limit 50;
```

### Screen 2 — Lead detail

- Everything from `leads`, `summary` shown prominently, `status_reason` as a
  tooltip on the badge.
- Full `wa_messages` transcript for that phone, oldest → newest, rendered as
  chat — see the body-convention table above.
- The linked bike from `bikes` via `bike_id`, with its cover photo.

Actions:

```sql
-- assign salesperson
update leads set salesperson = $1 where phone = $2;

-- take over chat: bot goes silent for 3 hours
update wa_conversations
set paused_until = now() + interval '3 hours', pause_reason = 'dashboard_takeover'
where phone = $1;

-- hand back to the bot
update wa_conversations set paused_until = null, pause_reason = null where phone = $1;
```

Show a clear banner while `paused_until > now()` — the bot is silent and a
human is expected to reply directly from WhatsApp.

### Screen 3 — Appointments

List or calendar of `appointments where status in ('requested','confirmed')`,
sorted by `appt_date`. **Highlight rows where `appt_date is null`** — the
customer agreed to visit but the time was never pinned down, needs a call.

Actions: transition `status` (`requested` → `confirmed` → `done` /
`cancelled` / `no_show`), edit `appt_date` / `appt_time` / `notes`. The
migration's trigger bumps `updated_at` automatically on every update.

### Screen 4 — Inventory (already exists at `/admin/bikes`)

CRUD on `bikes` + `bike_images` is already built
(`src/app/admin/(dashboard)/bikes/`). Nothing new to build — just know two
things the bot depends on:

1. `status` must be exactly `available` for the bot to offer it. Takes
   effect on the customer's very next message.
2. Photos need a `.jpg` next to the site's `.webp` — WhatsApp only accepts
   JPEG/PNG. An n8n workflow auto-converts on insert into `bike_images`;
   don't bypass that insert path with a bulk loader that skips it.

### Screen 5 — Message health (optional)

Recent `wa_messages` where `status = 'failed'` or `error is not null` —
migration 0006 adds a partial index on exactly that, so this stays cheap.
Useful for catching Meta token expiry before a customer notices.

---

## 5. Where this lives in the repo

This is **not** a separate app. The site is Next.js (App Router) + Supabase,
and `/admin` already exists with the shape these screens should follow —
match it rather than introducing a new stack.

| Existing pattern | Where |
|---|---|
| Route group + sidebar nav | `src/app/admin/(dashboard)/layout.tsx` — add "Leads" and "Appointments" to the `NAV` array |
| Auth gate | `src/lib/admin/auth.ts` — `requireAdmin()`, reuse as-is |
| Server-side Supabase client | `src/lib/supabase/server.ts` |
| Closest existing analogue | `src/lib/admin/enquiries.ts` + `src/app/admin/(dashboard)/enquiries/` — a list of inbound contacts with a status to move along |
| Server Actions + revalidate | `src/app/admin/actions.ts` — `revalidatePath` after every write, same as bikes/settings |

Env vars are already set — `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. Nothing new to configure.

---

## 6. Things that will bite you

1. **Empty dashboard = RLS, not an empty database.** Zero leads showing
   almost always means you're not signed in as a row in `admin_users`.
2. **`phone` is the primary key** for a lead, not an id column.
3. **Inventory is live, no cache.** The bot reads fresh on every message.
4. **Don't auto-recompute `lead_status`.** Manual override is fine and
   expected; silently re-deriving it from the transcript is not.
5. **One open appointment per phone**, enforced by a unique index — a second
   insert into `requested`/`confirmed` for the same phone fails until the
   existing one is closed.
6. **`salesperson` is dashboard-only** — the bot never touches that column.
7. **`intent_signals` is a Postgres `text[]`**, not JSON.
8. **Everything is `timestamptz` (UTC).** Render in `Asia/Kolkata` — there's
   no existing IST formatter in `src/lib/format.ts` yet, you'll be adding the
   first one.
9. **RPC functions (`wa_sweep`, `wa_claim_batch`, `wa_context`) are bot-internal.**
   Never call them from the dashboard — they exist purely for the n8n
   sweeper/processor workflows.
10. **A grant, not just a policy, is what makes RLS work.** If a fresh admin
    account still sees zero rows after confirming their `admin_users` row
    exists, check `grant select ... to authenticated` was actually applied —
    `information_schema.role_table_grants` will show it if so.

---

## 7. Definition of done

- [ ] Admin login shows leads; a non-admin session shows none
- [ ] Leads list: status badges, filters, search, WhatsApp deeplink, sorted by `last_message_at`
- [ ] Lead detail: full transcript rendered as chat, linked bike with photo, summary up top
- [ ] Assign salesperson works and persists
- [ ] Take over / hand back to bot works, with a visible "bot is paused" banner while active
- [ ] Appointments view with status transitions, null-date rows highlighted
- [ ] All timestamps rendered in IST, not raw UTC
- [ ] Service role key never reaches the browser — anon key + Supabase Auth only
