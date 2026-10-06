/**
 * Brands shown in the accessories page's logo strip. Logos live in
 * public/brands/accessories (sources in CREDITS.json there); width/height are
 * the files' real pixel sizes so next/image can reserve space without a
 * layout shift.
 *
 * `match` runs against an accessory's name + category, lowercased — there's
 * no brand column on accessories, so this is how tapping a logo filters the
 * grid. Brands the client carries but has no logo file for (SMK, Solace,
 * FuelX, …) still filter through their category chips; they're just not in
 * the strip.
 */
export type AccessoryBrand = {
  slug: string;
  name: string;
  logo: string;
  width: number;
  height: number;
  match: RegExp;
};

const b = (slug: string, name: string, width: number, height: number, match: RegExp): AccessoryBrand => ({
  slug,
  name,
  logo: `/brands/accessories/${slug}.webp`,
  width,
  height,
  match,
});

export const ACCESSORY_BRANDS: AccessoryBrand[] = [
  b("akrapovic", "Akrapovic", 288, 65, /akrapovi/),
  b("arrow", "Arrow Exhaust", 288, 123, /\barrow\b/),
  b("axor", "Axor Helmets", 288, 106, /\baxor\b/),
  b("dsg", "DSG", 520, 146, /\bdsg\b/),
  b("steelbird", "Steelbird", 243, 160, /steel ?bird/),
  b("studds", "Studds", 288, 103, /\bstudds\b/),
  b("vega", "Vega", 188, 57, /\bvega\b/),
  b("kyt", "KYT", 288, 109, /\bkyt\b/),
  b("mt", "MT Helmets", 288, 120, /\bmt helmet/),
  b("rrp", "RRP Exhaust", 287, 160, /\brrp\b|red rooster/),
  b("sc-project", "SC Project", 288, 84, /\bsc[ -]?project\b/),
  b("ixil", "Ixil", 288, 124, /\bixil+\b/),
  b("axxis", "Axxis", 288, 96, /\baxxis\b/),
  b("motul", "Motul", 288, 60, /\bmotul\b/),
  b("bmc", "BMC Air Filter", 288, 158, /\bbmc\b/),
  b("sena", "Sena", 520, 87, /\bsena\b/),
  b("parani", "Parani", 375, 140, /\bparani\b/),
  b("powertronic", "PowerTRONIC", 497, 78, /power ?tronic/),
  b("moto-torque", "Moto Torque", 293, 160, /moto ?torque/),
  b("motoaggrandize", "Motoaggrandize", 520, 105, /motoaggrandize/),
  b("maddog", "Maddog", 520, 67, /mad ?dog/),
  b("domino", "Domino", 403, 160, /\bdomino\b/),
];

/** Broad groups for the top chip row; a category can sit in more than one
 *  ("Solace Jacket and Pant" is both a jacket and pants). "Riding Gear" is
 *  deliberately the umbrella over everything you wear. */
export const ACCESSORY_GROUPS: { name: string; match: RegExp }[] = [
  { name: "Exhaust Systems", match: /exhaust|silencer/ },
  { name: "Helmets", match: /helmet|axxis/ },
  { name: "Riding Jacket", match: /jacket/ },
  { name: "Riding Pants", match: /\bpants?\b/ },
  { name: "Gloves", match: /glove/ },
  { name: "Frame Slider", match: /slider/ },
  {
    name: "Accessories",
    match: /filter|shield|intercom|fog|light|tail tidy|fuelx|torque|simtac|grip|tank|box|pannier|tracker|oil/,
  },
  { name: "Riding Gear", match: /helmet|axxis|jacket|\bpants?\b|glove|boot|bag|gear|guard|suit/ },
];

export function brandOf(text: string): AccessoryBrand | undefined {
  const t = text.toLowerCase();
  return ACCESSORY_BRANDS.find((x) => x.match.test(t));
}
