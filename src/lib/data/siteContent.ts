import { unstable_cache } from "next/cache";
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
export const getSiteContentBlock = unstable_cache(
  async (key: string): Promise<SiteContentBlock | null> => {
    if (!hasSupabase) return null;

    const supabase = getSupabasePublic();
    const { data, error } = await supabase!
      .from("site_content")
      .select("key, heading, subheading, body, image_path")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) return null;

    return {
      key: data.key,
      heading: data.heading,
      subheading: data.subheading,
      body: data.body,
      image: data.image_path ? siteContentImageUrl(data.image_path) : undefined,
    };
  },
  ["site-content-block"],
  { revalidate: 60, tags: ["site-content"] },
);

/** Every block at once — one round trip for the homepage instead of four. */
export const getAllSiteContentBlocks = unstable_cache(
  async (): Promise<Record<string, SiteContentBlock>> => {
    if (!hasSupabase) return {};

    const supabase = getSupabasePublic();
    const { data, error } = await supabase!
      .from("site_content")
      .select("key, heading, subheading, body, image_path");

    if (error || !data) return {};

    return Object.fromEntries(
      data.map((row) => [
        row.key,
        {
          key: row.key,
          heading: row.heading,
          subheading: row.subheading,
          body: row.body,
          image: row.image_path ? siteContentImageUrl(row.image_path) : undefined,
        },
      ]),
    );
  },
  ["all-site-content"],
  { revalidate: 60, tags: ["site-content"] },
);
