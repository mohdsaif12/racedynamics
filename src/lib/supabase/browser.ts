"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "./env";

/**
 * A Supabase client for Client Components — the admin dashboard's forms,
 * the login page, and the sold-toggle button all use this. Throws if called
 * before a project is configured; every call site is inside /admin, which
 * cannot be reached without credentials anyway.
 */
export function getSupabaseBrowser() {
  if (!hasSupabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local — see docs/admin-setup.md.",
    );
  }
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
