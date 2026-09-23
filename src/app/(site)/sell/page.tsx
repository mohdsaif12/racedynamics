import type { Metadata } from "next";
import { pad } from "@/lib/format";
import { getSiteSettings } from "@/lib/data/settings";
import { SITE } from "@/lib/site";
import SellForm from "./SellForm";

export const metadata: Metadata = {
  title: "Sell your bike",
  description: `Sell your superbike outright to ${SITE.name}, ${SITE.city}. Send photos, get a quote in 24 hours, paid on collection.`,
  alternates: { canonical: "/sell" },
};

const STEPS = [
  {
    title: "Send us photos",
    body: "Both sides, the clocks, and anything you'd want to know if you were buying it.",
  },
  {
    title: "We quote in 24 hours",
    body: "One real number. If the bike needs work we'll tell you what and why it moves the price.",
  },
  {
    title: "Paid, and collected",
    body: "Payment clears before the bike moves. We handle transfer paperwork and pick up anywhere in North India.",
  },
] as const;

export default async function SellPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
      <h1 className="display text-[clamp(2.25rem,6vw,4rem)] text-graphite">
        Sell your bike
      </h1>
      <p className="mt-4 max-w-[52ch] text-[17px] text-body">
        Outright purchase. No consignment, no waiting for a buyer, no chasing us
        for the balance.
      </p>

      <ol className="mt-12 grid gap-8 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="border-t border-line pt-5">
            <span className="figure-nums text-[11px] text-red">
              {pad(i + 1)}
            </span>
            <h2 className="mt-3 display text-2xl text-graphite">
              {s.title}
            </h2>
            <p className="mt-2 max-w-[38ch] text-sm text-body">{s.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-14 max-w-2xl">
        <SellForm settings={settings} />
      </div>

    </div>
  );
}
