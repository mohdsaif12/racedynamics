import { cache } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * The authoritative admin check, used at the top of every /admin page and
 * Server Action. Confirms there's a signed-in user AND that their id is in
 * admin_users — being logged into Supabase Auth alone isn't enough, since
 * anyone can create an account unless invites are disabled.
 *
 * getClaims() verifies the session JWT's signature locally when the project
 * uses asymmetric signing keys, instead of a round trip to the Auth server on
 * every navigation (it falls back to that round trip on legacy HS256
 * projects, so it's never weaker than getUser()). Wrapped in cache() so the
 * layout and anything else in the same render share one check.
 */
export const requireAdmin = cache(async () => {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!admin) {
    redirect("/admin/login?error=not-an-admin");
  }

  return { supabase, userId };
});
