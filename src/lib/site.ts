/**
 * Brand + contact configuration.
 *
 * PLACEHOLDER VALUES — every field below needs replacing with the real
 * RaceDynamics details before launch (Build Manual §08). The WhatsApp number in
 * particular must be confirmed as a Business account, since that changes how
 * the deep link behaves on desktop.
 */
export const SITE = {
  name: "Race Dynamics",
  city: "Lucknow",
  tagline: "Lucknow’s Destination for Superbikes & Premium Motorcycles",
  description:
    "Since 2014, Race Dynamics is Lucknow’s premier destination for superbikes, performance motorcycles, and premium pre-owned bikes with Pan-India delivery.",

  phonePrimary: "+91 98896 68858",
  phoneSecondary: "",
  /** Default grouped numbers, as the client sent them. The live list is
   *  edited from /admin/settings — see supabase/migrations/0014. */
  phoneGroups: [
    { label: "Sales team", numbers: ["+91 63921 68237", "+91 93362 29652"] },
    { label: "For selling your bike", numbers: ["+91 91184 52729"] },
    { label: "Lamination & servicing", numbers: ["+91 95556 33948"] },
  ],
  whatsapp: "919889668858",
  email: "racedynamicslucknow@gmail.com",
  address: "Shop No. 529 D, Kalyanpur, Near Shukla Marble & Granite, Ring Road, Lucknow, UP 226022",

  /**
   * The shop's real position from Google Maps listing.
   */
  maps: {
    query: "Race Dynamics Lucknow, Kalyanpur, Ring Road, Lucknow",
    lat: 26.902746,
    lng: 80.96405,
    url: "https://www.google.com/maps/place/26%C2%B054'09.9%22N+80%C2%B057'50.6%22E/@26.902746,80.9614751,17z/data=!3m1!4b1!4m4!3m3!8m2!3d26.902746!4d80.96405",
  },

  /** Shown on the contact page and footer, and mirrored in the JSON-LD.
   *  Closed every Wednesday — see also ClosedBanner. */
  hours: [
    { days: "Mon, Tue, Thu – Sat", time: "10:00 – 19:30" },
    { days: "Wednesday", time: "Closed" },
    { days: "Sunday", time: "By appointment" },
  ],

  social: {
    instagram: "https://www.instagram.com/racedynamicslucknow/?hl=en",
    youtube: "https://www.youtube.com/@racedynamicslucknow",
    facebook: "https://www.facebook.com/nitishprobikers/",
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
