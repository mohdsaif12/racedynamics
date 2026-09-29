import { getSupabasePublic } from "@/lib/supabase/public";
import { bikeVideoUrl } from "@/lib/supabase/storage";
import { hasSupabase } from "@/lib/supabase/env";

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;

/**
 * Public URLs for the homepage's autoplaying showcase-card videos. Not tied
 * to individual bikes — just whatever's sitting in the "bike videos" bucket
 * (see supabase/migrations/0012_bike_videos_bucket.sql — yes, the bucket id
 * has a literal space in it, confirmed from the Supabase dashboard). Reads
 * the bucket listing directly rather than a DB table, since there's no admin
 * upload screen for these yet; drop a file in via the Supabase dashboard and
 * it shows up on the next request.
 */
export async function getShowcaseVideos(limit = 5): Promise<string[]> {
  if (!hasSupabase) return [];

  const supabase = getSupabasePublic();
  const { data, error } = await supabase!.storage
    .from("bike videos")
    .list("", { limit: 100, sortBy: { column: "name", order: "asc" } });

  if (error || !data) return [];

  return data
    .filter((f) => VIDEO_EXT.test(f.name))
    .slice(0, limit)
    .map((f) => bikeVideoUrl(f.name));
}
