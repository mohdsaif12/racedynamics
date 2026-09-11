import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * The authoritative admin check, used at the top of every /admin page and
 * Server Action. Confirms there's a signed-in user AND that their email is in
 * admin_users — being logged into Supabase Auth alone isn't enough, since
 * anyone can create an account unless invites are disabled.
 */
export async function requireAdmin() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/admin/login?error=not-an-admin");
  }

  return { supabase, user };
}
