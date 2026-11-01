import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";
import { storyImageUrl } from "@/lib/supabase/storage";
import { STORY_LIFETIME_MS, type AdminStory } from "@/lib/stories";

export type { AdminStory };

/**
 * Deletes stories older than 24 hours — files first, then rows, so a failed
 * file delete leaves the row behind to retry next time rather than orphaning
 * the photo in the bucket with nothing pointing at it.
 *
 * Visitors stop seeing a story at 24 hours regardless (the public RLS policy
 * filters by age); this only frees the storage. Takes any client that can see
 * expired rows: the signed-in admin's, or the cron's service-role client.
 */
export async function purgeExpiredStories(supabase: SupabaseClient) {
  const cutoff = new Date(Date.now() - STORY_LIFETIME_MS).toISOString();
  const { data: expired } = await supabase
    .from("stories")
    .select("id, image_path, thumb_path")
    .lte("created_at", cutoff);

  if (!expired?.length) return 0;

  const paths = expired.flatMap((s) =>
    s.thumb_path ? [s.image_path, s.thumb_path] : [s.image_path],
  );
  const { error } = await supabase.storage.from("stories").remove(paths);
  if (error) return 0;

  await supabase
    .from("stories")
    .delete()
    .in(
      "id",
      expired.map((s) => s.id),
    );
  return expired.length;
}

/** Purges anything expired, then returns what's still live, oldest first. */
export async function getStoriesForAdmin(): Promise<AdminStory[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  await purgeExpiredStories(supabase);

  const { data, error } = await supabase
    .from("stories")
    .select("id, image_path, thumb_path, created_at")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((s) => ({
    id: s.id,
    imagePath: s.image_path,
    thumbPath: s.thumb_path,
    imageUrl: storyImageUrl(s.image_path),
    createdAt: s.created_at,
  }));
}
