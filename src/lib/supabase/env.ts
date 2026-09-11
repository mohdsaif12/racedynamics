/**
 * Whether real Supabase credentials are configured.
 *
 * Until the client's project exists, every page falls back to the static
 * seed data in src/lib/inventory.ts so the site keeps working exactly as it
 * does today. The moment NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are set (see docs/admin-setup.md), every page
 * switches to the live database automatically — nothing else to change.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
