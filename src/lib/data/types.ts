/**
 * Shapes shared by the static seed data (src/lib/inventory.ts, src/lib/site.ts)
 * and the live Supabase-backed data layer (src/lib/data/*), so every consumer
 * component works unmodified whichever source is active.
 */

export type BikeStatus = "available" | "booked" | "sold" | "on-request";

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  /** Public URL of the admin-uploaded tile photo, if one's been set. Falls
   *  back to a bundled default per category — see Sections.tsx — so an
   *  unset category never renders blank. */
  image?: string;
};

/** An owner-defined row in the spec table, e.g. { label: "Owners", value: "2" }. */
export type ExtraSpec = { label: string; value: string };

export type Bike = {
  id: string;
  slug: string;
  brand: string;
  /** Short name for the oversized ghost wordmark behind the bike. */
  model: string;
  /** Full name as it reads in the spec column, e.g. "Fat Bob 114". */
  fullName: string;
  year: number;
  km: number;
  location: string;
  /** null when status is "on-request" — price shown on enquiry only. */
  priceINR: number | null;
  status: BikeStatus;
  category: string; // category slug
  engineCc: number;
  featured: boolean;
  /** Fallback tint for the placeholder SVG, used only when no photo exists. */
  tint: string;
  /** Public URL of the cover photo. */
  image?: string;
  /** Public URLs of every photo, cover first. */
  images: string[];
  /** Extra spec rows the owner added in the dashboard, in their order. */
  extraSpecs: ExtraSpec[];
};

export type SiteSettings = {
  phonePrimary: string;
  phoneSecondary: string;
  whatsapp: string;
  email: string;
  address: string;
  tagline: string;
  description: string;
  stats: {
    bikesSold: number;
    yearsTrading: number;
    cities: number;
    avgDays: number;
  };
  social: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
};

export type Accessory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** null when priced on request. */
  priceINR: number | null;
  status: "in-stock" | "out-of-stock";
  featured: boolean;
  /** Public URL of the cover photo, if one's been uploaded. */
  image?: string;
};

/**
 * A standalone, admin-editable homepage block — an image and/or text that
 * doesn't belong to any bike, category or other content row. Identified by
 * a fixed `key` rather than an id, since each one is a singleton slot on the
 * page (there is exactly one "planning_to_sell" block, not a list of them).
 */
export type SiteContentBlock = {
  key: string;
  heading: string | null;
  subheading: string | null;
  /** Public URL of the admin-uploaded image, if one's been set. */
  image?: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  bikeBought: string;
  photo?: string;
};
