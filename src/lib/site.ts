/**
 * Brand + contact configuration.
 *
 * PLACEHOLDER VALUES — every field below needs replacing with the real
 * RaceDynamics details before launch (Build Manual §08). The WhatsApp number in
 * particular must be confirmed as a Business account, since that changes how
 * the deep link behaves on desktop.
 */
export const SITE = {
  name: "RaceDynamics",
  city: "Lucknow",
  tagline: "Pre-owned superbikes, correctly sorted.",
  description:
    "RaceDynamics buys and sells pre-owned superbikes in Lucknow — sport, cruiser, adventure, touring, roadster and classic machines, inspected and delivered across India.",

  // TODO: confirm with client
  phonePrimary: "+919000000000",
  phoneSecondary: "+919000000001",
  whatsapp: "919000000000",
  email: "hello@racedynamic.in",
  address: "Lucknow, Uttar Pradesh, India",

  social: {
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    facebook: "https://facebook.com/",
  },
} as const;

/** Builds a wa.me link pre-filled with the bike the person was looking at. */
export function whatsappLink(subject?: string) {
  const text = subject
    ? `Hi ${SITE.name}, I'm interested in the ${subject}. Is it still available?`
    : `Hi ${SITE.name}, I'd like to know more about your current stock.`;
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function telLink(number: string = SITE.phonePrimary) {
  return `tel:${number}`;
}
