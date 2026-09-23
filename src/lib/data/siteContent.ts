import { getSupabasePublic } from "@/lib/supabase/public";
import { siteContentImageUrl } from "@/lib/supabase/storage";
import { hasSupabase } from "@/lib/supabase/env";
import type { SiteContentBlock } from "./types";

/**
 * Fetches one standalone content block by key. Every call site pairs this
 * with its own bundled fallback (a heading, a photo already in public/) so a
 * missing or empty row — including the entire table not existing yet on an
 * older Supabase project — never breaks the page, only means "using the
 * default until someone edits it in /admin/content".
 */
export async function getSiteContentBlock(key: string): Promise<SiteContentBlock | null> {
  if (!hasSupabase) return null;

  const supabase = getSupabasePublic();
  const { data, error } = await supabase!
    .from("site_content")
    .select("key, heading, subheading, image_path")
    .eq("key", key)
    .maybeSingle();

  if (error || !data) return null;

  return {
    key: data.key,
    heading: data.heading,
    subheading: data.subheading,
    image: data.image_path ? siteContentImageUrl(data.image_path) : undefined,
  };
}
