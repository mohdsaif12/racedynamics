"use client";

import { useState } from "react";
import type { AgentStats as Stats, StatsRange } from "@/lib/admin/agentStats";

const RANGES: { value: StatsRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All time" },
];

const pct = (n: number, of: number) => (of > 0 ? Math.round((n / of) * 100) : 0);

export default function AgentStats({ stats }: { stats: Record<StatsRange, Stats> }) {
  const [range, setRange] = useState<StatsRange>("30d");
  const s = stats[range];

  const buckets = [
    { label: "Booked", value: s.booked, color: "bg-emerald-600" },
    { label: "Leads only", value: s.leadsOnly, color: "bg-lamp" },
    { label: "Filtered out", value: s.filtered, color: "bg-slate/40" },
  ];

  return (
    <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-graphite">WhatsApp agent</h2>
        <div role="tablist" className="flex rounded-full bg-mist p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              role="tab"
              aria-selected={range === r.value}
              onClick={() => setRange(r.value)}
              className={`rounded-full px-3 py-1 text-[13px] font-semibold transition-colors ${
                range === r.value ? "bg-white text-graphite shadow-sm" : "text-slate hover:text-graphite"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          value={s.chats}
          label="Chats handled"
          sub={`${s.messages.toLocaleString("en-IN")} messages`}
        />
        <Stat
          value={s.booked}
          label="Appointments booked"
          sub={`${pct(s.booked, s.chats)}% of chats`}
          dot="bg-emerald-600"
        />
        <Stat
          value={s.leadsOnly}
          label="Leads only"
          sub="No booking yet — follow up"
          dot="bg-lamp"
        />
        <Stat
          value={s.filtered}
          label="Filtered out"
          sub="Spam or lost"
          dot="bg-slate/40"
        />
      </div>

      {s.chats > 0 && (
        <div
          className="mt-4 flex h-2 gap-0.5 overflow-hidden rounded-full"
          role="img"
          aria-label={buckets.map((b) => `${b.label} ${pct(b.value, s.chats)}%`).join(", ")}
        >
          {buckets.map(
            (b) =>
              b.value > 0 && (
                <span
                  key={b.label}
                  className={b.color}
                  style={{ width: `${(b.value / s.chats) * 100}%` }}
                />
              ),
          )}
        </div>
      )}
    </section>
  );
}

function Stat({
  value,
  label,
  sub,
  dot,
}: {
  value: number;
  label: string;
  sub: string;
  dot?: string;
}) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-slate">
        {dot && <span className={`size-2 rounded-full ${dot}`} />}
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold text-graphite">{value.toLocaleString("en-IN")}</p>
      <p className="mt-0.5 text-[12px] text-slate">{sub}</p>
    </div>
  );
}
