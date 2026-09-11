import { getSupabaseServer } from "@/lib/supabase/server";

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  sortOrder: number;
};

export async function getCategoriesForAdmin(): Promise<AdminCategory[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, blurb, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    blurb: c.blurb,
    sortOrder: c.sort_order,
  }));
}
