import type { BikeStatus } from "./inventory";

const inr = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

/** ₹15,75,000 — Indian digit grouping, which is what buyers here read. */
export function formatPrice(value: number | null): string {
  if (value === null) return "On request";
  return `₹${inr.format(value)}`;
}

export function formatKm(value: number): string {
  return `${inr.format(value)} km`;
}

/** Rail index: 1 → "001". Matches the reference designs. */
export function pad(n: number): string {
  return String(n).padStart(3, "0");
}

export const STATUS_LABEL: Record<BikeStatus, string> = {
  available: "Available",
  booked: "Booked",
  sold: "Sold",
  "on-request": "On request",
};

/** Status pill on light surfaces. Red is reserved for booked / sold. */
export const STATUS_CLASS: Record<BikeStatus, string> = {
  available: "border-line text-slate",
  booked: "border-red/50 bg-red/10 text-red",
  sold: "border-red/50 bg-red/10 text-red",
  "on-request": "border-graphite/25 text-graphite",
};

/** Same pill on the dark showcase stage. */
export const STATUS_CLASS_DARK: Record<BikeStatus, string> = {
  available: "border-line-dark text-ash",
  booked: "border-red/60 bg-red/15 text-red",
  sold: "border-red/60 bg-red/15 text-red",
  "on-request": "border-white/25 text-white",
};
