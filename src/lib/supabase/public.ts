import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "./env";

/**
 * A plain, cookie-free Supabase client for anonymous public reads (every
 * policy those reads go through is `using (true)` — see
 * supabase/migrations/0001_init.sql).
 *
 * This deliberately does NOT touch next/headers' cookies(). That call is only
 * safe inside a live request; `generateStaticParams` runs at build time with
 * no request at all, and calling cookies() there hard-fails the build rather
 * than gracefully falling back to dynamic rendering (which is what happens
 * when cookies() is called from an actual page/layout render). Every public
 * data-layer function (src/lib/data/*) needs to work in both places, so it
 * uses this client instead of the cookie-bound one in supabase/server.ts —
 * that one stays reserved for admin code, which genuinely needs the user's
 * session.
 */
export function getSupabasePublic() {
  if (!hasSupabase) return null;
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
