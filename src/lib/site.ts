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

  /**
   * The shop's real position, from the client's Google Maps listing.
   *
   * `query` is what the embeds search for — a place name resolves to the
   * business card with its name, hours and reviews, where raw coordinates
   * would drop an unlabelled pin. The coordinates are kept anyway: they go
   * into the LocalBusiness structured data, which is what puts the shop on
   * the map in a local search result.
   */
  maps: {
    query: "Race Dynamics Lucknow",
    lat: 26.9033281,
    lng: 80.964492,
    url: "https://www.google.com/maps/place/Race+Dynamics+Lucknow/@26.9025875,80.96156,17z/data=!4m6!3m5!1s0x399957c1bce42487:0x9143685e8a96c9b8!8m2!3d26.9033281!4d80.964492!16s%2Fg%2F11cm060mg7",
  },

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

/** Google Maps embed for the shop. Kept here so the footer and the contact
 *  page can never drift apart on which place they point at. */
export function mapEmbedSrc() {
  return `https://www.google.com/maps?q=${encodeURIComponent(SITE.maps.query)}&z=16&output=embed`;
}
