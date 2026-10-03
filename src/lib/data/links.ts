import type { SiteSettings } from "./types";

/**
 * Pure helpers — no server-only imports — so they're safe inside Client
 * Components (ContactRail, InventoryBrowser) as well as Server Components.
 * Every call site passes the `settings` it was already given as a prop.
 */

export function whatsappLink(settings: SiteSettings, subject?: string) {
  const text = subject
    ? `Hi RaceDynamics, I'm interested in the ${subject}. Is it still available?`
    : `Hi RaceDynamics, I'd like to know more about your current stock.`;
  return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function telLink(settings: SiteSettings, number?: string) {
  return `tel:${number ?? settings.phonePrimary}`;
}

/** tel: href for a number as typed by a person — spaces and dashes are fine
 *  to display but not every dialer accepts them in the link. */
export function telHref(number: string) {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}
