import { getSupabasePublic } from "@/lib/supabase/public";
import { bikeImageUrl } from "@/lib/supabase/storage";
import { hasSupabase } from "@/lib/supabase/env";
import { BIKES as SEED_BIKES } from "@/lib/inventory";
import type { Bike, ExtraSpec } from "./types";

const DEFAULT_TINT = "#5B7FA8";

/** Deterministic id for seed rows, so callers can treat it like a UUID. */
function seedId(slug: string) {
  return `seed-${slug}`;
}

function fromSeed(): Bike[] {
  return SEED_BIKES.map((b) => ({
    id: seedId(b.slug),
    slug: b.slug,
    brand: b.brand,
    model: b.model,
    fullName: b.fullName,
    year: b.year,
    km: b.km,
    location: b.location,
    priceINR: b.priceINR,
    status: b.status,
    category: b.category,
    engineCc: b.engineCc,
    featured: false,
    tint: b.tint ?? DEFAULT_TINT,
    image: b.image,
    images: b.image ? [b.image] : [],
    extraSpecs: [],
  }));
}

type Row = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  full_name: string;
  year: number;
  km: number;
  location: string;
  engine_cc: number;
  price_inr: number | null;
  status: Bike["status"];
  featured: boolean;
  categories: { slug: string } | { slug: string }[] | null;
  bike_images: { path: string; sort_order: number }[] | null;
  extra_specs: unknown;
};

/**
 * jsonb comes back as whatever was stored, so every row is checked before it
 * reaches a page. A single bad entry is dropped rather than failing the bike.
 */
function parseExtraSpecs(raw: unknown): ExtraSpec[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (s): s is ExtraSpec =>
        !!s &&
        typeof s === "object" &&
        typeof (s as ExtraSpec).label === "string" &&
        typeof (s as ExtraSpec).value === "string",
    )
    .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
    .filter((s) => s.label && s.value)
    .slice(0, 20);
}

function mapRow(row: Row): Bike {
  const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  const images = (row.bike_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => bikeImageUrl(img.path));

  return {
    id: row.id,
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    fullName: row.full_name,
    year: row.year,
    km: row.km,
    location: row.location,
    priceINR: row.price_inr,
    status: row.status,
    category: cat?.slug ?? "",
    engineCc: row.engine_cc,
    featured: row.featured,
    tint: DEFAULT_TINT,
    image: images[0],
    images,
    extraSpecs: parseExtraSpecs(row.extra_specs),
  };
}

const SELECT = `
  id, slug, brand, model, full_name, year, km, location, engine_cc,
  price_inr, status, featured, extra_specs,
  categories!inner ( slug ),
  bike_images ( path, sort_order )
`;

/** Every bike in stock, newest first. */
export async function getAllBikes(): Promise<Bike[]> {
  if (!hasSupabase) return fromSeed();

  const supabase = getSupabasePublic();
  const { data, error } = await supabase!
    .from("bikes")
    .select(SELECT)
    .order("created_at", { ascending: false });

  if (error || !data) return fromSeed();
  return (data as unknown as Row[]).map(mapRow);
}

export async function getBikeBySlug(slug: string): Promise<Bike | undefined> {
  if (!hasSupabase) return fromSeed().find((b) => b.slug === slug);

  const supabase = getSupabasePublic();
  const { data, error } = await supabase!
    .from("bikes")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return undefined;
  return mapRow(data as unknown as Row);
}

/** The three-or-so bikes marked `featured`, for the homepage showroom. */
export async function getFeaturedBikes(): Promise<Bike[]> {
  const all = await getAllBikes();
  const featured = all.filter((b) => b.image && b.featured);
  return featured.length ? featured : all.filter((b) => b.image).slice(0, 3);
}

export function bikesInCategory(bikes: Bike[], categorySlug: string) {
  return bikes.filter((b) => b.category === categorySlug);
}
