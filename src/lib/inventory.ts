/**
 * Placeholder inventory — Build Manual §03.
 *
 * These are EXAMPLE listings so the showcase renders in a realistic working
 * state. They are modelled on the kind of stock RaceDynamic actually carries,
 * but the prices, odometer readings and locations are invented and must be
 * replaced with real CMS data (Sanity / Payload) before launch.
 */

export const CATEGORIES = [
  {
    slug: "sport",
    name: "Sport",
    blurb: "Track-bred, fully faired, built to be revved.",
  },
  {
    slug: "cruiser",
    name: "Cruiser",
    blurb: "Torque, chrome and a long wheelbase.",
  },
  {
    slug: "adventure",
    name: "Adventure",
    blurb: "Tall, loaded, and happiest a long way from Lucknow.",
  },
  {
    slug: "touring",
    name: "Touring",
    blurb: "Built for the whole highway, not the first corner.",
  },
  {
    slug: "roadster",
    name: "Roadster",
    blurb: "Naked, upright, and honest about it.",
  },
  {
    slug: "classic",
    name: "Classic",
    blurb: "Older iron, correctly sorted.",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export type BikeStatus = "available" | "booked" | "sold" | "on-request";

export type Bike = {
  slug: string;
  brand: string;
  /** Short name for the oversized ghost wordmark behind the bike. */
  model: string;
  /** Full name as it reads in the spec column. */
  fullName: string;
  year: number;
  km: number;
  location: string;
  /** null when status is "on-request" — price shown on enquiry only. */
  priceINR: number | null;
  status: BikeStatus;
  category: CategorySlug;
  engineCc: number;
  /**
   * Placeholder art tint, used by BikeArt when no photo exists yet.
   */
  tint: string;
  /**
   * Stock photograph in public/bikes. PLACEHOLDER IMAGERY — these are stand-in
   * photos, and two are the wrong marque for the listing. They exist so the
   * showcase can be built and reviewed against real pictures; replace with the
   * client's own shots (ideally background-removed) before launch.
   */
  image?: string;
};

export const BIKES: Bike[] = [
  // ---------------------------------------------------------------- cruiser
  {
    slug: "fatbob-114-2022",
    brand: "Harley-Davidson",
    model: "Fatbob",
    fullName: "Fat Bob 114",
    year: 2022,
    km: 2500,
    location: "Chandigarh",
    priceINR: 1575000,
    status: "available",
    category: "cruiser",
    engineCc: 1868,
    tint: "#B8722E",
    image: "/bikes/fatbob-114-2022.webp",
  },
  {
    slug: "fatboy-114-2023",
    brand: "Harley-Davidson",
    model: "Fatboy",
    fullName: "Fat Boy 114",
    year: 2023,
    km: 4100,
    location: "Bengaluru",
    priceINR: 1890000,
    status: "booked",
    category: "cruiser",
    engineCc: 1868,
    tint: "#8A8F98",
    image: "/bikes/fatboy-114-2023.webp",
  },
  {
    slug: "iron-883-2015",
    brand: "Harley-Davidson",
    model: "Iron 883",
    fullName: "Iron 883",
    year: 2015,
    km: 7600,
    location: "Gurugram",
    priceINR: 650000,
    status: "available",
    category: "cruiser",
    engineCc: 883,
    tint: "#3F4348",
    image: "/bikes/iron-883-2015.webp",
  },
  {
    slug: "diavel-1260s-2021",
    brand: "Ducati",
    model: "Diavel",
    fullName: "Diavel 1260 S",
    year: 2021,
    km: 6800,
    location: "Lucknow",
    priceINR: 1650000,
    status: "available",
    category: "cruiser",
    engineCc: 1262,
    tint: "#C0392B",
    image: "/bikes/diavel-1260s-2021.webp",
  },
  {
    slug: "chief-dark-horse-2020",
    brand: "Indian",
    model: "Chief",
    fullName: "Chief Dark Horse",
    year: 2020,
    km: 11200,
    location: "Delhi",
    priceINR: 1450000,
    status: "on-request",
    category: "cruiser",
    engineCc: 1890,
    tint: "#2E3440",
    image: "/bikes/chief-dark-horse-2020.webp",
  },

  // ------------------------------------------------------------------ sport
  {
    slug: "ninja-1000sx-2021",
    brand: "Kawasaki",
    model: "Ninja",
    fullName: "Ninja 1000 SX",
    year: 2021,
    km: 10300,
    location: "Delhi",
    priceINR: 950000,
    status: "available",
    category: "sport",
    engineCc: 1043,
    tint: "#4E9A51",
    image: "/bikes/ninja-1000sx.webp",
  },
  {
    slug: "panigale-v4-2022",
    brand: "Ducati",
    model: "Panigale",
    fullName: "Panigale V4",
    year: 2022,
    km: 3400,
    location: "Mumbai",
    priceINR: 2450000,
    status: "available",
    category: "sport",
    engineCc: 1103,
    tint: "#C0392B",
    image: "/bikes/panigale-v4.webp",
  },
  {
    slug: "s1000rr-2020",
    brand: "BMW",
    model: "S1000RR",
    fullName: "S 1000 RR",
    year: 2020,
    km: 8900,
    location: "Lucknow",
    priceINR: 1580000,
    status: "booked",
    category: "sport",
    engineCc: 999,
    tint: "#5B7FA8",
    image: "/bikes/s1000rr.webp",
  },
  {
    slug: "rsv4-factory-2019",
    brand: "Aprilia",
    model: "RSV4",
    fullName: "RSV4 1100 Factory",
    year: 2019,
    km: 12400,
    location: "Pune",
    priceINR: 1720000,
    status: "available",
    category: "sport",
    engineCc: 1078,
    tint: "#3D4F63",
    image: "/bikes/rsv4-factory.webp",
  },

  // -------------------------------------------------------------- adventure
  {
    slug: "r1300gs-adventure-2025",
    brand: "BMW",
    model: "R1300GS",
    fullName: "R 1300 GS Adventure",
    year: 2025,
    km: 4200,
    location: "Chandigarh",
    priceINR: null,
    status: "on-request",
    category: "adventure",
    engineCc: 1300,
    tint: "#5B7FA8",
    image: "/bikes/r1300gs-adventure-2025.webp",
  },
  {
    slug: "multistrada-v4s-2022",
    brand: "Ducati",
    model: "Multistrada",
    fullName: "Multistrada V4 S",
    year: 2022,
    km: 9100,
    location: "Lucknow",
    priceINR: 1980000,
    status: "available",
    category: "adventure",
    engineCc: 1158,
    tint: "#C0392B",
    image: "/bikes/multistrada-v4s-2022.webp",
  },
  {
    slug: "tiger-900-rally-2021",
    brand: "Triumph",
    model: "Tiger",
    fullName: "Tiger 900 Rally Pro",
    year: 2021,
    km: 15600,
    location: "Dehradun",
    priceINR: 1080000,
    status: "available",
    category: "adventure",
    engineCc: 888,
    tint: "#4A5D3A",
    image: "/bikes/tiger-900-rally-2021.webp",
  },

  // ---------------------------------------------------------------- touring
  {
    slug: "roadglide-117-2025",
    brand: "Harley-Davidson",
    model: "Roadglide",
    fullName: "Road Glide 117",
    year: 2025,
    km: 7000,
    location: "Patna",
    priceINR: null,
    status: "on-request",
    category: "touring",
    engineCc: 1923,
    tint: "#2E3440",
    image: "/bikes/roadglide-117-2025.webp",
  },
  {
    slug: "k1600gt-2019",
    brand: "BMW",
    model: "K1600",
    fullName: "K 1600 GT",
    year: 2019,
    km: 22400,
    location: "Delhi",
    priceINR: 1350000,
    status: "available",
    category: "touring",
    engineCc: 1649,
    tint: "#5B7FA8",
    image: "/bikes/k1600gt-2019.webp",
  },

  // --------------------------------------------------------------- roadster
  {
    slug: "streetfighter-v4-2023",
    brand: "Ducati",
    model: "Streetfighter",
    fullName: "Streetfighter V4",
    year: 2023,
    km: 2100,
    location: "Lucknow",
    priceINR: 2280000,
    status: "available",
    category: "roadster",
    engineCc: 1103,
    tint: "#C0392B",
    image: "/bikes/streetfighter-v4-2023.webp",
  },
  {
    slug: "z900-2021",
    brand: "Kawasaki",
    model: "Z900",
    fullName: "Z900",
    year: 2021,
    km: 14800,
    location: "Kanpur",
    priceINR: 680000,
    status: "available",
    category: "roadster",
    engineCc: 948,
    tint: "#4E9A51",
    image: "/bikes/z900.webp",
  },
  {
    slug: "speed-triple-1200-2022",
    brand: "Triumph",
    model: "Speed Triple",
    fullName: "Speed Triple 1200 RS",
    year: 2022,
    km: 6300,
    location: "Noida",
    priceINR: 1420000,
    status: "sold",
    category: "roadster",
    engineCc: 1160,
    tint: "#4A5D3A",
    image: "/bikes/speed-triple-1200-2022.webp",
  },

  // ---------------------------------------------------------------- classic
  {
    slug: "continental-gt650-2020",
    brand: "Royal Enfield",
    model: "Continental",
    fullName: "Continental GT 650",
    year: 2020,
    km: 18900,
    location: "Lucknow",
    priceINR: 245000,
    status: "available",
    category: "classic",
    engineCc: 648,
    tint: "#8A6A3E",
    image: "/bikes/continental-gt650-2020.webp",
  },
  {
    slug: "bonneville-t120-2018",
    brand: "Triumph",
    model: "Bonneville",
    fullName: "Bonneville T120",
    year: 2018,
    km: 21500,
    location: "Delhi",
    priceINR: 720000,
    status: "available",
    category: "classic",
    engineCc: 1200,
    tint: "#4A5D3A",
    image: "/bikes/bonneville-t120-2018.webp",
  },
];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function bikesInCategory(slug: string) {
  return BIKES.filter((b) => b.category === slug);
}

export function getBike(slug: string) {
  return BIKES.find((b) => b.slug === slug);
}

export function categoryCounts() {
  return CATEGORIES.map((c) => ({
    ...c,
    count: BIKES.filter((b) => b.category === c.slug).length,
  }));
}
