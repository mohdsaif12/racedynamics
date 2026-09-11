"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Called from client components right after a successful save/delete/toggle,
 * so the change shows up on the public site immediately instead of waiting
 * for the 60-second ISR window on /bike/[slug].
 */
export async function revalidateSite() {
  revalidatePath("/", "layout");
}

export async function signOut() {
  const supabase = await getSupabaseServer();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
