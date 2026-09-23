import { getSupabaseServer } from "@/lib/supabase/server";
import { siteContentImageUrl } from "@/lib/supabase/storage";

export type AdminSiteContent = {
  key: string;
  heading: string | null;
  subheading: string | null;
  imagePath: string | null;
  imageUrl: string | null;
};

export async function getSiteContentBlockForAdmin(key: string): Promise<AdminSiteContent | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("site_content")
    .select("key, heading, subheading, image_path")
    .eq("key", key)
    .maybeSingle();

  if (error || !data) return null;

  return {
    key: data.key,
    heading: data.heading,
    subheading: data.subheading,
    imagePath: data.image_path,
    imageUrl: data.image_path ? siteContentImageUrl(data.image_path) : null,
  };
}
