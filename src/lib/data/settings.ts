import { getSupabasePublic } from "@/lib/supabase/public";
import { hasSupabase } from "@/lib/supabase/env";
import { SITE } from "@/lib/site";
import type { SiteSettings } from "./types";

function fromSeed(): SiteSettings {
  return {
    phonePrimary: SITE.phonePrimary,
    phoneSecondary: SITE.phoneSecondary,
    whatsapp: SITE.whatsapp,
    email: SITE.email,
    address: SITE.address,
    tagline: SITE.tagline,
    description: SITE.description,
    stats: { bikesSold: 480, yearsTrading: 9, cities: 26, avgDays: 11 },
    social: { ...SITE.social },
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
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

  return {
    phonePrimary: isDummy(data.phone_primary) ? SITE.phonePrimary : data.phone_primary,
    phoneSecondary: isDummy(data.phone_secondary) ? "" : data.phone_secondary,
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
}

// whatsappLink / telLink live in ./links.ts — that file has no server-only
// imports, so it can be used from Client Components too.
