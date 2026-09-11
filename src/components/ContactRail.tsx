"use client";

import { SITE } from "@/lib/site";
import { telLink, whatsappLink } from "@/lib/data/links";
import type { SiteSettings } from "@/lib/data/types";

/**
 * Fixed WhatsApp + call buttons pinned to the right edge, exactly as on the
 * reference site. On phones it becomes a full-width bottom bar instead, since
 * a right-edge rail eats thumb space.
 */
export default function ContactRail({ settings }: { settings: SiteSettings }) {
  return (
    <>
      {/* desktop / tablet — right edge */}
      <div className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col sm:flex">
        <a
          href={whatsappLink(settings)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="grid size-11 place-items-center bg-whatsapp text-white transition-opacity hover:opacity-90"
        >
          <WhatsAppIcon />
        </a>
        <a
          href={telLink(settings)}
          aria-label={`Call ${SITE.name}`}
          className="grid size-11 place-items-center bg-red text-white transition-colors hover:bg-red-dark"
        >
          <PhoneIcon />
        </a>
      </div>

      {/* phones — bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 sm:hidden">
        <a
          href={whatsappLink(settings)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-whatsapp py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-white"
        >
          <WhatsAppIcon /> WhatsApp
        </a>
        <a
          href={telLink(settings)}
          className="flex items-center justify-center gap-2 bg-red py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-white"
        >
          <PhoneIcon /> Call
        </a>
      </div>
    </>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.18c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.82-.11-.42-.11-.96-.29-1.65-.58-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.19-1.58-1.19-3.02s.76-2.14 1.03-2.44c.27-.29.58-.36.78-.36l.56.01c.18 0 .42-.07.66.5.24.58.83 2.02.9 2.17.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.65-.15.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.03-.24c1.12.37 2.33.57 3.56.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.44.57 3.56a1 1 0 0 1-.25 1.03l-2.2 2.2Z" />
    </svg>
  );
}
