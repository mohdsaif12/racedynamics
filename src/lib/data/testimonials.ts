import { getSupabasePublic } from "@/lib/supabase/public";
import { ownerImageUrl } from "@/lib/supabase/storage";
import { hasSupabase } from "@/lib/supabase/env";
import type { Testimonial } from "./types";

const SEED: Testimonial[] = [
  {
    id: "seed-1",
    quote:
      "Thank you for meeting my requirements. The Machine is not only good, it's Awesome! Your team is very supportive and friendly... will surely recommend Race Dynamics to my friends.",
    name: "Vikramaditya Sharma",
    bikeBought: "Kawasaki Z900",
    photo: "/owners/owner-1.webp",
  },
  {
    id: "seed-2",
    quote:
      "Best destination in Lucknow for superbikes, riding gear, and accessories. Nitish and the team ensure every machine is thoroughly evaluated.",
    name: "Harshit Verma",
    bikeBought: "BMW S1000RR",
    photo: "/owners/owner-2.webp",
  },
  {
    id: "seed-3",
    quote:
      "Shipped to Bengaluru seamlessly within 4 days. Paperwork was fully sorted before delivery. Highly trusted pre-owned superbike dealer!",
    name: "Tripush Modgil",
    bikeBought: "Ducati Panigale V2",
    photo: "/owners/owner-3.webp",
  },
  {
    id: "seed-4",
    quote:
      "Visited their Kalyanpur Ring Road showroom. Honest evaluation, transparent pricing, and top-notch customer support even after handover.",
    name: "Alok Srivastava",
    bikeBought: "Triumph Street Triple R",
    photo: "/owners/owner-4.webp",
  },
  {
    id: "seed-5",
    quote:
      "Third bike I've bought from Race Dynamics. They tell you what's wrong before you even notice. Transparency at its best!",
    name: "Rahul Khurana",
    bikeBought: "Harley-Davidson Fat Boy",
    photo: "/owners/owner-5.webp",
  },
  {
    id: "seed-6",
    quote:
      "Got my Z900 delivered in mint condition to Delhi. Pan-India delivery was super smooth and hassle-free!",
    name: "Anurag Singh",
    bikeBought: "Kawasaki Z900",
    photo: "/owners/owner-6.jpg",
  },
  {
    id: "seed-7",
    quote:
      "Owning a Panigale V4 was my dream. Race Dynamics made the entire purchase and RTO process crystal clear.",
    name: "Siddharth Malhotra",
    bikeBought: "Ducati Panigale V4",
    photo: "/owners/owner-7.jpg",
  },
  {
    id: "seed-8",
    quote:
      "Superb bikes and genuine people. The condition of every machine in their shop is outstanding!",
    name: "Abhinav Kaushik",
    bikeBought: "BMW S1000RR",
    photo: "/owners/owner-8.jpg",
  },
  {
    id: "seed-9",
    quote:
      "Great hospitality at their Lucknow showroom. Found the exact Street Triple I was searching for across India.",
    name: "Rohan Kapoor",
    bikeBought: "Triumph Street Triple",
    photo: "/owners/owner-9.jpg",
  },
  {
    id: "seed-10",
    quote:
      "Full service history verified for my cruiser. Buying a pre-owned superbike from them gave me total peace of mind.",
    name: "Roman Tellis",
    bikeBought: "Harley-Davidson Iron 883",
    photo: "/owners/owner-10.jpg",
  },
  {
    id: "seed-11",
    quote:
      "Exceptional machine condition and prompt delivery to Hyderabad. The team kept me updated at every step.",
    name: "Karan Johar",
    bikeBought: "Suzuki Hayabusa",
    photo: "/owners/owner-11.jpg",
  },
  {
    id: "seed-12",
    quote:
      "The handover experience was unforgettable. Race Dynamics is truly Lucknow's premier superbike hub!",
    name: "Aman Gupta",
    bikeBought: "Yamaha YZF-R1",
    photo: "/owners/owner-12.jpg",
  },
];

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!hasSupabase) return SEED;

  const supabase = getSupabasePublic();
  const { data, error } = await supabase!
    .from("testimonials")
    .select("id, quote, name, bike_bought, photo_path")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return SEED;

  return data.map((row) => ({
    id: row.id,
    quote: row.quote,
    name: row.name,
    bikeBought: row.bike_bought,
    photo: row.photo_path ? ownerImageUrl(row.photo_path) : undefined,
  }));
}
