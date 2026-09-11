import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "./env";

/**
 * A Supabase client for use in Server Components, Route Handlers and Server
 * Actions. Reads the visitor's auth cookie, so `auth.uid()` resolves inside
 * RLS policies for admin routes.
 *
 * Returns null when no project is configured yet — callers fall back to the
 * static seed data (see src/lib/data/*).
 */
export async function getSupabaseServer() {
  if (!hasSupabase) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render, where cookies are
          // read-only. Middleware refreshes the session on navigation, so
          // this is safe to ignore.
        }
      },
    },
  });
}
