import { getSupabasePublic } from "@/lib/supabase/public";
import { accessoryImageUrl } from "@/lib/supabase/storage";
import { hasSupabase } from "@/lib/supabase/env";
import type { Accessory } from "./types";

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_inr: number | null;
  status: Accessory["status"];
  featured: boolean;
  photo_path: string | null;
};

function mapRow(row: Row): Accessory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceINR: row.price_inr,
    status: row.status,
    featured: row.featured,
    image: row.photo_path ? accessoryImageUrl(row.photo_path) : undefined,
  };
}

const SELECT = "id, slug, name, description, price_inr, status, featured, photo_path";

/**
 * Every accessory in stock, in the order the owner arranged them. No seed
 * fallback — unlike bikes, this section launches empty until the owner adds
 * the first item from /admin/accessories.
 */
export async function getAllAccessories(): Promise<Accessory[]> {
  if (!hasSupabase) return [];

  const supabase = getSupabasePublic();
  const { data, error } = await supabase!
    .from("accessories")
    .select(SELECT)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return (data as Row[]).map(mapRow);
}

export async function getAccessoryBySlug(slug: string): Promise<Accessory | undefined> {
  if (!hasSupabase) return undefined;

  const supabase = getSupabasePublic();
  const { data, error } = await supabase!
    .from("accessories")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return undefined;
  return mapRow(data as Row);
}

/** The items marked `featured`, for the homepage — falls back to the first
 *  few in-stock items so a new section isn't empty the moment one item is
 *  added. */
export async function getFeaturedAccessories(): Promise<Accessory[]> {
  const all = (await getAllAccessories()).filter((a) => a.status === "in-stock");
  const featured = all.filter((a) => a.featured);
  return featured.length ? featured : all.slice(0, 4);
}
