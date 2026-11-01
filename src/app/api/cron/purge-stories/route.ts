import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase/env";
import { purgeExpiredStories } from "@/lib/admin/stories";

/**
 * Daily clean-up of story photos past their 24 hours (schedule in
 * vercel.json). Without it, expired photos are still deleted — but only the
 * next time someone opens /admin/stories.
 *
 * Needs two env vars on Vercel:
 *  - SUPABASE_SERVICE_ROLE_KEY: Supabase → Settings → API → service_role.
 *    Server-only; never prefix it with NEXT_PUBLIC_.
 *  - CRON_SECRET: any long random string. Vercel sends it as a Bearer token
 *    on cron calls, which keeps everyone else from triggering this.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!SUPABASE_URL || !serviceKey) {
    return Response.json({ skipped: "SUPABASE_SERVICE_ROLE_KEY not set" });
  }

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });
  const purged = await purgeExpiredStories(supabase);
  return Response.json({ purged });
}
