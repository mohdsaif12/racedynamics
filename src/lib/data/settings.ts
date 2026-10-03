import { unstable_cache } from "next/cache";
import { getSupabasePublic } from "@/lib/supabase/public";
import { hasSupabase } from "@/lib/supabase/env";
import { SITE } from "@/lib/site";
import { siteContentImageUrl } from "@/lib/supabase/storage";
import type { PhoneGroup, SiteSettings } from "./types";

function seedGroups(): PhoneGroup[] {
  return SITE.phoneGroups.map((g) => ({ label: g.label, numbers: [...g.numbers] }));
}

/**
 * Cleans the stored jsonb into well-formed groups. `undefined` means the
 * column doesn't exist yet (migration 0014 not run), so the bundled defaults
 * apply; an empty array means someone cleared every group on purpose, so fall
 * back to the plain primary/secondary pair rather than showing no number.
 */
function parseGroups(raw: unknown, primary: string, secondary: string): PhoneGroup[] {
  if (raw === undefined || raw === null) return seedGroups();

  const groups = (Array.isArray(raw) ? raw : [])
    .map((g) => ({
      label: typeof g?.label === "string" ? g.label.trim() : "",
      numbers: (Array.isArray(g?.numbers) ? g.numbers : [])
        .filter((n: unknown): n is string => typeof n === "string")
        .map((n: string) => n.trim())
        .filter(Boolean),
    }))
    .filter((g) => g.numbers.length > 0);

  if (groups.length) return groups;
  return [{ label: "Phone", numbers: [primary, secondary].filter(Boolean) }];
}

function fromSeed(): SiteSettings {
  return {
    phonePrimary: SITE.phonePrimary,
    phoneSecondary: SITE.phoneSecondary,
    phoneGroups: seedGroups(),
    whatsapp: SITE.whatsapp,
    email: SITE.email,
    address: SITE.address,
    tagline: SITE.tagline,
    description: SITE.description,
    stats: { bikesSold: 480, yearsTrading: 9, cities: 26, avgDays: 11 },
    social: { ...SITE.social },
  };
}

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    if (!hasSupabase) return fromSeed();

    const supabase = getSupabasePublic();
    const { data, error } = await supabase!
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return fromSeed();

    const isDummy = (val?: string) =>
      !val ||
      val.includes("900000000") ||
      val.includes("9000000001") ||
      val.includes("hello@racedynamic.in") ||
      val === "https://instagram.com/" ||
      val === "https://facebook.com/" ||
      val === "https://youtube.com/";

    const phonePrimary = isDummy(data.phone_primary) ? SITE.phonePrimary : data.phone_primary;
    const phoneSecondary = isDummy(data.phone_secondary) ? "" : data.phone_secondary;

    return {
      phonePrimary,
      phoneSecondary,
      phoneGroups: parseGroups(data.phone_groups, phonePrimary, phoneSecondary),
      logoPath: data.logo_path ?? undefined,
      logoUrl: data.logo_path ? siteContentImageUrl(data.logo_path) : undefined,
      whatsapp: isDummy(data.whatsapp) ? SITE.whatsapp : data.whatsapp,
      email: isDummy(data.email) ? SITE.email : data.email,
      address: isDummy(data.address) || data.address === "Lucknow, Uttar Pradesh, India" ? SITE.address : data.address,
      tagline: isDummy(data.tagline) ? SITE.tagline : data.tagline,
      description: isDummy(data.description) ? SITE.description : data.description,
      stats: {
        bikesSold: data.stat_bikes_sold || 480,
        yearsTrading: data.stat_years_trading || 10,
        cities: data.stat_cities || 26,
        avgDays: data.stat_avg_days || 11,
      },
      social: {
        instagram: isDummy(data.instagram_url) ? SITE.social.instagram : data.instagram_url,
        facebook: isDummy(data.facebook_url) ? SITE.social.facebook : data.facebook_url,
        youtube: isDummy(data.youtube_url) ? SITE.social.youtube : data.youtube_url,
      },
    };
  },
  ["site-settings"],
  { revalidate: 60, tags: ["site-settings"] },
);

// whatsappLink / telLink live in ./links.ts — that file has no server-only
// imports, so it can be used from Client Components too.
