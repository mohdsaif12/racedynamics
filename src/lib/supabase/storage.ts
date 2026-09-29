import { SUPABASE_URL } from "./env";

/**
 * Public URL for a file in Supabase Storage. Both buckets are public
 * (see supabase/migrations/0002_storage.sql), so this is a plain URL — no
 * signed-URL dance needed for images that are already meant to be public.
 */
export function bikeImageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/bikes/${path}`;
}

/** Homepage showcase-card videos — see supabase/migrations/0012. Bucket id
 *  is literally "bike videos" (with a space), so both segments need
 *  encoding for a valid URL. */
export function bikeVideoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent("bike videos")}/${encodeURIComponent(path)}`;
}

export function ownerImageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/owners/${path}`;
}

export function accessoryImageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/accessories/${path}`;
}

/** Category tile photos and standalone homepage content blocks share this
 *  bucket — neither belongs to a bike, and both are edited from the same
 *  "Website content" admin screen. */
export function siteContentImageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/site-content/${path}`;
}

/** A collision-safe storage path: keeps the extension, randomises the name. */
export function newStoragePath(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${id}.${ext}`;
}
