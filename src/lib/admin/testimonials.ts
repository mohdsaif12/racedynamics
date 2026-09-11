import { getSupabaseServer } from "@/lib/supabase/server";
import { ownerImageUrl } from "@/lib/supabase/storage";

export type AdminTestimonial = {
  id: string;
  quote: string;
  name: string;
  bikeBought: string;
  photoPath: string | null;
  photoUrl: string | null;
};

export async function getTestimonialsForAdmin(): Promise<AdminTestimonial[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("testimonials")
    .select("id, quote, name, bike_bought, photo_path")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map((t) => ({
    id: t.id,
    quote: t.quote,
    name: t.name,
    bikeBought: t.bike_bought,
    photoPath: t.photo_path,
    photoUrl: t.photo_path ? ownerImageUrl(t.photo_path) : null,
  }));
}
