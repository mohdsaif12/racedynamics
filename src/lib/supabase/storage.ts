import { SUPABASE_URL } from "./env";

/**
 * Public URL for a file in Supabase Storage. Both buckets are public
 * (see supabase/migrations/0002_storage.sql), so this is a plain URL — no
 * signed-URL dance needed for images that are already meant to be public.
 */
export function bikeImageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/bikes/${path}`;
}

export function ownerImageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/owners/${path}`;
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
