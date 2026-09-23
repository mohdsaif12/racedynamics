import { getSupabasePublic } from "@/lib/supabase/public";
import { hasSupabase } from "@/lib/supabase/env";
import { siteContentImageUrl } from "@/lib/supabase/storage";
import { CATEGORIES as SEED_CATEGORIES } from "@/lib/inventory";
import type { Bike, Category } from "./types";

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabase) return SEED_CATEGORIES.map((c) => ({ ...c }));

  const supabase = getSupabasePublic();
  const { data, error } = await supabase!
    .from("categories")
    .select("slug, name, blurb, photo_path")
    .order("sort_order", { ascending: true });

  if (error || !data) return SEED_CATEGORIES.map((c) => ({ ...c }));
  return data.map((c) => ({
    slug: c.slug,
    name: c.name,
    blurb: c.blurb,
    image: c.photo_path ? siteContentImageUrl(c.photo_path) : undefined,
  }));
}

export function getCategory(categories: Category[], slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function categoryCounts(categories: Category[], bikes: Bike[]) {
  return categories.map((c) => ({
    ...c,
    count: bikes.filter((b) => b.category === c.slug).length,
  }));
}
