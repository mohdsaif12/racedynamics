import { getSupabaseServer } from "@/lib/supabase/server";

export type EnquiryStatus = "new" | "contacted" | "closed";

export type AdminEnquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  bike: string;
  year: number | null;
  km: number | null;
  expectedInr: number | null;
  notes: string;
  status: EnquiryStatus;
  createdAt: string;
};

/** Newest first — this is an inbox, so the top of the list is the work. */
export async function getEnquiries(): Promise<AdminEnquiry[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("sell_enquiries")
    .select(
      "id, name, phone, email, bike, year, km, expected_inr, notes, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    bike: r.bike,
    year: r.year,
    km: r.km,
    expectedInr: r.expected_inr,
    notes: r.notes,
    status: r.status as EnquiryStatus,
    createdAt: r.created_at,
  }));
}
