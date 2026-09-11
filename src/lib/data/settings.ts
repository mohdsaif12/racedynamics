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

  return {
    phonePrimary: data.phone_primary,
    phoneSecondary: data.phone_secondary,
    whatsapp: data.whatsapp,
    email: data.email,
    address: data.address,
    tagline: data.tagline,
    description: data.description,
    stats: {
      bikesSold: data.stat_bikes_sold,
      yearsTrading: data.stat_years_trading,
      cities: data.stat_cities,
      avgDays: data.stat_avg_days,
    },
    social: {
      instagram: data.instagram_url,
      facebook: data.facebook_url,
      youtube: data.youtube_url,
    },
  };
}

// whatsappLink / telLink live in ./links.ts — that file has no server-only
// imports, so it can be used from Client Components too.
