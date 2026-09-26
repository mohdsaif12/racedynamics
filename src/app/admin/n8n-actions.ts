"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { getN8nBookingWebhook } from "@/lib/admin/integrations";
import { APPOINTMENT_TYPES, type AppointmentType } from "@/lib/appointments";
import { SITE } from "@/lib/site";

/**
 * Everything the dashboard sends to n8n goes through here, server-side: the
 * webhook URL never reaches the browser bundle, and there's no CORS setup to
 * do on the n8n side. Payload shapes are documented in
 * docs/n8n-booking-webhook.md — keep the two in sync.
 */

type Result = { ok: true } | { ok: false; error: string };

// ------------------------------------------------------------ settings

export async function verifyWebhookPassword(password: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.rpc("verify_admin_password", {
    p_password: password,
  });
  if (error) return { ok: false, error: "Couldn't check the password. Has migration 0011 been run?" };
  if (!data) return { ok: false, error: "Incorrect password." };
  return { ok: true };
}

export async function saveN8nWebhook(password: string, url: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("set_n8n_booking_webhook", {
    p_password: password,
    p_url: url,
  });
  if (error) {
    if (error.code === "28P01") return { ok: false, error: "Incorrect password." };
    if (error.code === "22023") return { ok: false, error: error.message };
    return { ok: false, error: "Couldn't save. Check your connection and try again." };
  }
  revalidatePath("/admin/settings");
  return { ok: true };
}

// ------------------------------------------------------------ outbound

async function postToN8n(body: Record<string, unknown>): Promise<Result> {
  const url = await getN8nBookingWebhook();
  if (!url) {
    return { ok: false, error: "No n8n webhook set. Add it under Site settings → n8n booking webhook." };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        source: "admin_dashboard",
        business: SITE.name,
        sent_at: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, error: `n8n responded ${res.status}.` };
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't reach the n8n webhook." };
  }
}

export type NewBookingInput = {
  customerName: string;
  phone: string;
  type: AppointmentType;
  bikeId: string;
  date: string;
  time: string;
  notes: string;
};

/**
 * A booking made by staff from the dashboard. The dashboard has no insert
 * grant on appointments (the agent owns creation), so this hands the booking
 * to n8n, which creates the lead + appointment and messages the customer.
 */
export async function sendBookingToN8n(input: NewBookingInput): Promise<Result> {
  const { supabase } = await requireAdmin();

  const name = input.customerName.trim();
  const phone = input.phone.replace(/\D/g, "");
  if (!name) return { ok: false, error: "Enter the customer's name." };
  if (phone.length < 10 || phone.length > 15) {
    return { ok: false, error: "Enter a phone number with country code, e.g. 919876543210." };
  }
  if (!APPOINTMENT_TYPES.some((t) => t.value === input.type)) {
    return { ok: false, error: "Pick an appointment type." };
  }
  if (input.date && !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { ok: false, error: "Pick a valid date." };
  }

  let bikeLabel: string | null = null;
  if (input.bikeId) {
    const { data } = await supabase
      .from("bikes")
      .select("full_name, year")
      .eq("id", input.bikeId)
      .maybeSingle();
    if (data) bikeLabel = data.year ? `${data.full_name} (${data.year})` : data.full_name;
  }

  return postToN8n({
    event: "booking_requested",
    appointment: {
      phone,
      customer_name: name,
      appt_type: input.type,
      bike_id: input.bikeId || null,
      bike_label: bikeLabel,
      appt_date: input.date || null,
      appt_time: input.time.trim() || null,
      notes: input.notes.trim() || null,
    },
  });
}

/**
 * Called after staff change an appointment's status, date or time, so n8n
 * can tell the customer. Re-reads the row rather than trusting the client,
 * so the payload always matches what's actually in the database.
 */
export async function notifyAppointmentUpdated(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, phone, bike_id, bike_label, appt_type, appt_date, appt_time, notes, status, lead:leads(customer_name, wa_profile_name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return { ok: false, error: "Appointment not found." };

  const lead = Array.isArray(data.lead) ? data.lead[0] : data.lead;
  revalidatePath("/admin/appointments");

  return postToN8n({
    event: "appointment_updated",
    appointment: {
      id: data.id,
      phone: data.phone,
      customer_name: lead?.customer_name || lead?.wa_profile_name || null,
      appt_type: data.appt_type,
      bike_id: data.bike_id,
      bike_label: data.bike_label,
      appt_date: data.appt_date,
      appt_time: data.appt_time,
      notes: data.notes,
      status: data.status,
    },
  });
}
