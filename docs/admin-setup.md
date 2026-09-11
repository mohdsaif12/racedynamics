# Setting up the database and admin dashboard

The website works today without any of this — every page falls back to
placeholder data baked into the code. These steps switch it over to a real
database so the client can edit everything from `/admin` themselves. Takes
about ten minutes, all through the browser.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is
   enough for this site).
2. **New project** → name it (e.g. "racedynamics"), pick a database
   password (save it somewhere), pick a region close to India, create.
3. Wait ~2 minutes for it to provision.

## 2. Run the database schema

1. In the project, open **SQL Editor** in the left sidebar.
2. Open `supabase/migrations/0001_init.sql` from this repo, copy the whole
   file, paste into a new query, click **Run**.
3. Do the same for every other file in `supabase/migrations/`, in number
   order — `0002_storage.sql`, `0003_seed.sql`, `0004_sell_enquiries.sql`,
   `0005_bike_extra_specs.sql`. Each depends on the one before it.

   All of them are safe to run twice, so if you lose track, just run them
   again in order.

This creates every table, the two photo-storage buckets, and loads the same
19 bikes that are currently hardcoded — so the site has real content the
moment it switches over.

## 3. Upload the seed photos (optional, but makes step 2 show real images)

The seed data references filenames already sitting in `public/bikes/*.webp`
in this repo. To make them show up:

1. In Supabase, open **Storage** → the `bikes` bucket.
2. Upload every file from `public/bikes/` into it, keeping the filenames
   exactly as they are.

If you skip this, the seeded bikes will just show a blank photo until you
edit each one in `/admin` and upload a real picture — which you'll want to
do anyway before this goes live.

## 4. Connect the website to the project

1. In Supabase: **Settings → API**. Copy the **Project URL** and the
   **anon public** key.
2. In this repo, copy `.env.local.example` to `.env.local` and paste them in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. Restart the dev server (`npm run dev`) — or redeploy, if this is already
   live. The site now reads and writes through the database instead of the
   static fallback.

## 5. Create the client's login

The admin dashboard has no public sign-up page on purpose — accounts are
created once, here:

1. Supabase → **Authentication → Users → Add user**. Enter the client's
   email and a password (or send them a magic-link invite instead — see
   Supabase's own docs for that flow).
2. Back in **SQL Editor**, run this to grant dashboard access to every
   account that exists in Auth:

   ```sql
   insert into admin_users (user_id, email)
   select id, email from auth.users
   on conflict (user_id) do nothing;
   ```

   This is what actually grants access — without a row here, an account can
   sign in but the dashboard will bounce it back to the login page.

   Deliberately not matched on a specific email: a `where email = '...'`
   version silently inserts **zero rows** if the address doesn't match
   exactly (wrong case, a typo, or run before the user was created), and
   SQL Editor still reports success — which looks identical to it having
   worked. Since only people you invite exist in Auth at all, promoting all
   of them is both simpler and safer than a query that can quietly no-op.

3. Verify it worked before trying to log in:

   ```sql
   select u.email,
          u.email_confirmed_at is not null as confirmed,
          a.user_id is not null            as is_admin
   from auth.users u
   left join admin_users a on a.user_id = u.id;
   ```

   You want `confirmed` and `is_admin` both `true`. If `confirmed` is
   `false`, open the user in **Authentication → Users** and confirm them
   (or recreate them with "Auto Confirm User" ticked).

4. The client can now sign in at `/admin/login` and change their password
   from the Supabase dashboard if they want, or you can set one they choose
   during handover.

## What the client can do from `/admin`

- **Bikes** — add one (photos, price, year, km, status), edit any field,
  flip a single switch to mark it sold, delete it.
- **Extra details** — on any bike, add your own rows to the details table
  (Owners / 2, Services done / 5, Insurance / valid to Mar 2027). Type a
  name and a value, press **+ Add a detail** for another, **×** to remove
  one. They appear on the website in the order you put them, and a bike
  with none looks exactly as it does now.
- **Enquiries** — everyone who fills in the form on the Sell your bike page,
  newest first, with buttons to call or WhatsApp them and a To call /
  Called / Done marker.
- **Categories** — add, rename, delete (a category can't be deleted while
  bikes are still in it).
- **Reviews** — add or remove the testimonials shown on the homepage.
- **Site settings** — phone numbers, WhatsApp number, email, address, the
  four homepage stats, social links.

Every change appears on the live site within a few seconds.

### About bike photos

The **first** photo of each bike is its cover, and the inventory page floats
it over a dark lit platform with no frame — so it has to be a cut-out with a
see-through background (a PNG or WebP), not an ordinary photograph. The form
checks as you add it and says so if the background is still there; it never
blocks the save, it just warns.

Every photo **after** the first is shown as a normal framed photograph in the
details section below, so those can be ordinary pictures straight off a phone.
A bike with only its cover photo simply doesn't show that gallery.

## Notes for whoever maintains this later

- Deleting a bike does **not** delete its uploaded photos from Storage — it
  only removes the database rows. Harmless (nothing references the orphaned
  files), but worth a periodic Storage cleanup if it matters.
- Row Level Security is doing the actual enforcement — the anon key in
  `.env.local` is safe to expose in the browser (it's meant to be public);
  it's the `admin_users` table + RLS policies in `0001_init.sql` that decide
  who can write.
- `revalidatePath("/", "layout")` runs after every admin save (see
  `src/app/admin/actions.ts`), which is why changes show up immediately
  instead of waiting for the 60-second ISR window on bike pages.
