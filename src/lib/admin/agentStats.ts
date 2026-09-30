import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Funnel for the WhatsApp agent, read straight from what the bot wrote (see
 * docs/agent-dashboard-handoff.md). One `leads` row = one customer chat. The
 * cohort is chats *started* in the period, and every chat lands in exactly
 * one bucket: booked an appointment, a lead only (still worth following up),
 * or filtered out (the bot marked it SPAM / LOST).
 */

export type StatsRange = "7d" | "30d" | "all";

export type AgentStats = {
  chats: number;
  messages: number;
  booked: number;
  leadsOnly: number;
  filtered: number;
};

const DAYS: Record<StatsRange, number | null> = { "7d": 7, "30d": 30, all: null };

async function statsSince(since: string | null): Promise<AgentStats | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;

  const leads = () => {
    const q = supabase.from("leads").select("phone", { count: "exact", head: true });
    return since ? q.gte("created_at", since) : q;
  };
  const messages = supabase.from("wa_messages").select("id", { count: "exact", head: true });
  // !inner keeps only leads that have at least one appointment; the count
  // is of leads, so a customer who booked twice counts once.
  const booked = () => {
    const q = supabase
      .from("leads")
      .select("phone, appointments!inner(id)", { count: "exact", head: true });
    return since ? q.gte("created_at", since) : q;
  };

  const [chats, msgs, bookedRes, filtered, bookedThenLost] = await Promise.all([
    leads(),
    since ? messages.gte("created_at", since) : messages,
    booked(),
    leads().in("lead_status", ["SPAM", "LOST"]),
    // A chat that booked and was later marked LOST counts as booked only.
    booked().in("lead_status", ["SPAM", "LOST"]),
  ]);

  if (chats.error) return null;
  const total = chats.count ?? 0;
  const bookedCount = bookedRes.count ?? 0;
  const filteredCount = Math.max(0, (filtered.count ?? 0) - (bookedThenLost.count ?? 0));
  return {
    chats: total,
    messages: msgs.count ?? 0,
    booked: bookedCount,
    leadsOnly: Math.max(0, total - bookedCount - filteredCount),
    filtered: filteredCount,
  };
}

/** Stats for every range at once, so switching ranges is instant. */
export async function getAgentStats(): Promise<Record<StatsRange, AgentStats> | null> {
  const now = Date.now();
  const ranges = Object.keys(DAYS) as StatsRange[];
  const results = await Promise.all(
    ranges.map((r) => {
      const days = DAYS[r];
      return statsSince(days ? new Date(now - days * 86_400_000).toISOString() : null);
    }),
  );
  if (results.some((r) => !r)) return null;
  return Object.fromEntries(ranges.map((r, i) => [r, results[i]!])) as Record<
    StatsRange,
    AgentStats
  >;
}
