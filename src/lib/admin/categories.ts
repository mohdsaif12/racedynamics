import { getSupabaseServer } from "@/lib/supabase/server";
import { siteContentImageUrl } from "@/lib/supabase/storage";

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  sortOrder: number;
  photoPath: string | null;
  photoUrl: string | null;
};

export async function getCategoriesForAdmin(): Promise<AdminCategory[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, blurb, sort_order, photo_path")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    blurb: c.blurb,
    sortOrder: c.sort_order,
    photoPath: c.photo_path,
    photoUrl: c.photo_path ? siteContentImageUrl(c.photo_path) : null,
  }));
}
