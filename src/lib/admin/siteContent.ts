import { getSupabaseServer } from "@/lib/supabase/server";
import { siteContentImageUrl } from "@/lib/supabase/storage";

export type AdminSiteContent = {
  key: string;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  imagePath: string | null;
  imageUrl: string | null;
};

const SELECT = "key, heading, subheading, body, image_path";

function mapRow(row: {
  key: string;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  image_path: string | null;
}): AdminSiteContent {
  return {
    key: row.key,
    heading: row.heading,
    subheading: row.subheading,
    body: row.body,
    imagePath: row.image_path,
    imageUrl: row.image_path ? siteContentImageUrl(row.image_path) : null,
  };
}

export async function getSiteContentBlockForAdmin(key: string): Promise<AdminSiteContent | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("site_content")
    .select(SELECT)
    .eq("key", key)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data);
}

/** Every block at once, keyed by `key` — what the /admin/content page uses. */
export async function getAllSiteContentBlocksForAdmin(): Promise<Record<string, AdminSiteContent>> {
  const supabase = await getSupabaseServer();
  if (!supabase) return {};

  const { data, error } = await supabase.from("site_content").select(SELECT);
  if (error || !data) return {};

  return Object.fromEntries(data.map((row) => [row.key, mapRow(row)]));
}
