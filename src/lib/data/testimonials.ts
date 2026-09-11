import { getSupabasePublic } from "@/lib/supabase/public";
import { ownerImageUrl } from "@/lib/supabase/storage";
import { hasSupabase } from "@/lib/supabase/env";
import type { Testimonial } from "./types";

const SEED: Testimonial[] = [
  {
    id: "seed-1",
    quote:
      "Third bike I've bought from them. They tell you what's wrong with it before you find it yourself.",
    name: "Rahul Khurana",
    bikeBought: "",
    photo: "/owners/owner-1.webp",
  },
  {
    id: "seed-2",
    quote:
      "Superb bikes and honest people. The process is transparent and the condition of every machine is outstanding.",
    name: "Abhinav Kaushik",
    bikeBought: "",
    photo: "/owners/owner-2.webp",
  },
  {
    id: "seed-3",
    quote:
      "Shipped to Bengaluru in four days with the paperwork already sorted. No chasing anyone.",
    name: "Tripush Modgil",
    bikeBought: "",
    photo: "/owners/owner-3.webp",
  },
  {
    id: "seed-4",
    quote:
      "They had the full service history for a seven-year-old bike. That told me everything I needed to know.",
    name: "Roman Tellis",
    bikeBought: "",
    photo: "/owners/owner-4.webp",
  },
];

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!hasSupabase) return SEED;

  const supabase = getSupabasePublic();
  const { data, error } = await supabase!
    .from("testimonials")
    .select("id, quote, name, bike_bought, photo_path")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return SEED;

  return data.map((row) => ({
    id: row.id,
    quote: row.quote,
    name: row.name,
    bikeBought: row.bike_bought,
    photo: row.photo_path ? ownerImageUrl(row.photo_path) : undefined,
  }));
}
