"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseServer } from "@/lib/supabase/server";

/*
 * Called from client components right after a successful admin save, so the
 * change shows on the public site immediately. Public pages otherwise only
 * refresh once a day (see src/lib/data/cachePolicy.ts).
 *
 * Every invalidation is a Vercel ISR write the next time each affected page
 * is visited, and the Hobby plan caps those (the project was paused on
 * 2026-10-15 for exceeding it). So:
 *
 *  - Scope each one to the pages that actually show that data. A blanket
 *    revalidatePath("/", "layout") rewrites all ~45 pages (~970 write units)
 *    after every single accessory edit.
 *  - Require an admin. Server Actions are public HTTP endpoints; without
 *    this check anyone could call them in a loop to keep wiping the cache.
 *
 * revalidateTag clears the shared data cache entry (used by several pages,
 * including on-demand ones like /inventory); revalidatePath clears the
 * pre-rendered pages themselves. `{ expire: 0 }` makes the next visit fetch
 * fresh data rather than briefly serving the old copy.
 */
const NOW = { expire: 0 };

/** Settings, logo, categories, website content: shown in the shared header
 *  or footer on every page, so everything must go. These are rare edits. */
export async function revalidateSite() {
  await requireAdmin();
  revalidatePath("/", "layout");
}

/** Bikes: the homepage (featured + counts), every bike page, the sitemap,
 *  and /inventory (rendered on demand, so the tag alone covers it). */
export async function revalidateBikes() {
  await requireAdmin();
  revalidateTag("bikes", NOW);
  revalidatePath("/");
  revalidatePath("/bike/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

/** Accessories only appear on /accessories. */
export async function revalidateAccessories() {
  await requireAdmin();
  revalidateTag("accessories", NOW);
  revalidatePath("/accessories");
}

/** Testimonials only appear on the homepage. */
export async function revalidateTestimonials() {
  await requireAdmin();
  revalidateTag("testimonials", NOW);
  revalidatePath("/");
}

export async function signOut() {
  const supabase = await getSupabaseServer();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
