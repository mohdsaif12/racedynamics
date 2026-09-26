import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * The n8n booking webhook URL. Lives in integration_settings (admin-only
 * read, password-gated write — see migration 0011), not site_settings,
 * because site_settings is readable by the public site.
 */
export async function getN8nBookingWebhook(): Promise<string> {
  const supabase = await getSupabaseServer();
  if (!supabase) return "";

  const { data, error } = await supabase
    .from("integration_settings")
    .select("n8n_booking_webhook_url")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return "";
  return data.n8n_booking_webhook_url ?? "";
}
