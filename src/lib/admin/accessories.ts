import { getSupabaseServer } from "@/lib/supabase/server";
import { accessoryImageUrl } from "@/lib/supabase/storage";

export type AdminAccessory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceINR: number | null;
  status: "in-stock" | "out-of-stock";
  featured: boolean;
  photoPath: string | null;
  photoUrl: string | null;
};

const SELECT = "id, slug, name, description, category, price_inr, status, featured, photo_path";

function mapRow(row: {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price_inr: number | null;
  status: AdminAccessory["status"];
  featured: boolean;
  photo_path: string | null;
}): AdminAccessory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    priceINR: row.price_inr,
    status: row.status,
    featured: row.featured,
    photoPath: row.photo_path,
    photoUrl: row.photo_path ? accessoryImageUrl(row.photo_path) : null,
  };
}

export async function getAccessoriesForAdmin(): Promise<AdminAccessory[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("accessories")
    .select(SELECT)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map(mapRow);
}

/** Distinct categories already in use, for the form's autocomplete list. */
export async function getAccessoryCategories(): Promise<string[]> {
  const all = await getAccessoriesForAdmin();
  return Array.from(new Set(all.map((a) => a.category).filter(Boolean))).sort();
}

export async function getAccessoryForEdit(id: string): Promise<AdminAccessory | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("accessories")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data);
}
