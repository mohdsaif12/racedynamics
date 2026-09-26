import { getSupabaseServer } from "@/lib/supabase/server";
import type { AdminAppointment, AppointmentStatus, AppointmentType } from "@/lib/appointments";

/**
 * Appointments are created by the WhatsApp agent (n8n, service-role key) —
 * see docs/agent-dashboard-handoff.md. The dashboard reads them and moves
 * their status along; it never inserts rows itself. New bookings made from
 * the dashboard go to n8n via the booking webhook, and n8n creates the row.
 */

export * from "@/lib/appointments";

const SELECT =
  "id, phone, bike_label, appt_type, appt_date, appt_time, notes, status, created_at, lead:leads(customer_name, wa_profile_name)";

type Row = {
  id: string;
  phone: string;
  bike_label: string | null;
  appt_type: AppointmentType;
  appt_date: string | null;
  appt_time: string | null;
  notes: string | null;
  status: AppointmentStatus;
  created_at: string;
  lead:
    | { customer_name: string | null; wa_profile_name: string | null }
    | { customer_name: string | null; wa_profile_name: string | null }[]
    | null;
};

function toAppointment(r: Row): AdminAppointment {
  const lead = Array.isArray(r.lead) ? r.lead[0] : r.lead;
  return {
    id: r.id,
    phone: r.phone,
    customerName: lead?.customer_name || lead?.wa_profile_name || r.phone,
    bikeLabel: r.bike_label ?? "",
    type: r.appt_type,
    date: r.appt_date,
    time: r.appt_time ?? "",
    notes: r.notes ?? "",
    status: r.status,
    createdAt: r.created_at,
  };
}

/** Every appointment dated between from and to (inclusive, YYYY-MM-DD). */
export async function getAppointmentsBetween(
  from: string,
  to: string,
): Promise<AdminAppointment[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("appointments")
    .select(SELECT)
    .gte("appt_date", from)
    .lte("appt_date", to)
    .order("appt_date", { ascending: true })
    .order("appt_time", { ascending: true });

  if (error || !data) return [];
  return (data as Row[]).map(toAppointment);
}

/** Open appointments with no date yet — the customer needs a call to fix one. */
export async function getUndatedAppointments(): Promise<AdminAppointment[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("appointments")
    .select(SELECT)
    .is("appt_date", null)
    .in("status", ["requested", "confirmed"])
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as Row[]).map(toAppointment);
}

/** Bikes for the "New booking" dropdown — anything still on the floor. */
export async function getBookableBikes(): Promise<{ id: string; label: string }[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("bikes")
    .select("id, full_name, year")
    .in("status", ["available", "on-request"])
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map((b) => ({
    id: b.id,
    label: b.year ? `${b.full_name} (${b.year})` : b.full_name,
  }));
}
