import { getSupabaseServer } from "@/lib/supabase/server";
import { bikeImageUrl } from "@/lib/supabase/storage";

/**
 * Admin-only fetch: unlike src/lib/data/bikes.ts, this returns the raw
 * bike_images rows (id + path) rather than resolved URLs only, so the edit
 * form can delete one specific photo.
 */
export type EditableBike = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  fullName: string;
  categoryId: string;
  year: number;
  km: number;
  location: string;
  engineCc: number;
  priceINR: number | null;
  status: "available" | "booked" | "sold" | "on-request";
  featured: boolean;
  images: { id: string; path: string; url: string }[];
};

export async function getBikeForEdit(id: string): Promise<EditableBike | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("bikes")
    .select(
      "id, slug, brand, model, full_name, category_id, year, km, location, engine_cc, price_inr, status, featured, bike_images ( id, path, sort_order )",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const images = ((data.bike_images ?? []) as { id: string; path: string; sort_order: number }[])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({ id: img.id, path: img.path, url: bikeImageUrl(img.path) }));

  return {
    id: data.id,
    slug: data.slug,
    brand: data.brand,
    model: data.model,
    fullName: data.full_name,
    categoryId: data.category_id,
    year: data.year,
    km: data.km,
    location: data.location,
    engineCc: data.engine_cc,
    priceINR: data.price_inr,
    status: data.status,
    featured: data.featured,
    images,
  };
}
