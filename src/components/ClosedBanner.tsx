import { telLink } from "@/lib/data/links";
import type { SiteSettings } from "@/lib/data/types";

/**
 * The shop is closed every Wednesday. Rather than a client-side clock (which
 * would flash the wrong state on load, or drift to the visitor's own device
 * timezone), the day is resolved on the server against Asia/Kolkata — the
 * shop's actual timezone, not wherever the visitor or the server happens to
 * be — so the banner is correct on first paint, every time.
 */
function isClosedTodayIST(): boolean {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
  }).format(new Date());
  return weekday === "Wed";
}

export default function ClosedBanner({ settings }: { settings: SiteSettings }) {
  if (!isClosedTodayIST()) return null;

  return (
    <div className="bg-red px-5 py-2.5 text-center text-[13px] font-semibold text-white">
      Closed today (Wednesday) — back open tomorrow.{" "}
      <a href={telLink(settings)} className="underline underline-offset-2 hover:no-underline">
        Call {settings.phonePrimary} for urgent enquiries
      </a>
      .
    </div>
  );
}
