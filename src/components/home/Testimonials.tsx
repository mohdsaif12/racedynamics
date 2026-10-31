"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import NextImage from "next/image";
import { SITE } from "@/lib/site";
import type { Testimonial } from "@/lib/data/types";
import { StarIcon, QuoteMarkIcon } from "@/components/icons";

/**
 * Honeycomb photo cluster + quote carousel matching the reference design.
 * The hexagons are real customer handover photos from the showroom; they
 * aren't tied to individual reviews, so the quotes page with the dashes.
 */
export default function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion() ?? false;

  const list = testimonials;

  if (list.length === 0) return null;

  const safeIndex = i % list.length;
  const activeQuote = list[safeIndex];

  return (
    <section className="relative overflow-hidden bg-paper py-20 lg:py-28">
      {/* Background Ghost Wordmark */}
      <span
        aria-hidden
        className="ghost-word absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-[clamp(3rem,11vw,9.5rem)] font-extrabold uppercase tracking-widest text-slate/[0.04] pointer-events-none select-none"
      >
        {SITE.name}
      </span>

      {/* Background Wave Lines SVG */}
      <BackgroundWaves />

      <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
        {/* Honeycomb of real customer handover photos — 4 / 5 / 4 */}
        <div className="mx-auto flex max-w-4xl flex-col items-center py-4">
          {HONEYCOMB_ROWS.map((row, r) => (
            <div
              key={r}
              className={`flex justify-center gap-1 sm:gap-2 lg:gap-3 ${r > 0 ? "-mt-3 sm:-mt-5 lg:-mt-6" : ""}`}
            >
              {row.map((n) => (
                <HexagonPhoto key={n} n={n} featured={n === FEATURED_PHOTO} />
              ))}
            </div>
          ))}
        </div>

        {/* Section Heading: WHAT OUR CUSTOMER SAY */}
        <h2 className="display mt-10 text-center text-[clamp(1.85rem,4.6vw,3.25rem)] font-extrabold uppercase tracking-wide">
          <span className="text-red">WHAT OUR </span>
          <span className="text-graphite">CUSTOMER SAY</span>
        </h2>

        {/* Selected Quote Display */}
        <div className="mt-6 min-h-36">
          <AnimatePresence mode="wait" initial={false}>
            <motion.blockquote
              key={activeQuote.id}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto max-w-[65ch] text-center"
            >
              <QuoteMarkIcon
                size={76}
                className="pointer-events-none absolute -top-8 left-1/2 -z-10 -translate-x-1/2 text-graphite/[0.06]"
              />

              <div className="mb-4 flex justify-center gap-1 text-red">
                {Array.from({ length: 5 }, (_, idx) => (
                  <StarIcon key={idx} size={16} />
                ))}
              </div>

              <p className="text-[17px] leading-[1.85] text-body font-medium">
                &ldquo;{activeQuote.quote}&rdquo;
              </p>

              <footer className="mt-5 text-[15px] font-bold text-red">
                {activeQuote.name}
                {activeQuote.bikeBought && (
                  <span className="ml-2 font-normal text-slate">
                    · {activeQuote.bikeBought}
                  </span>
                )}
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        {/* Dash Pagination Indicators */}
        {list.length > 1 && (
          <div className="mt-8 flex justify-center gap-2.5">
            {list.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Read review from ${t.name}`}
                aria-current={idx === safeIndex ? "true" : undefined}
                className={`h-[3px] transition-all duration-300 ${
                  idx === safeIndex ? "w-10 bg-red" : "w-6 bg-line hover:bg-slate"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const HEX = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

/** Photo numbers in /public/customers, laid out row by row. Storefront shots
 *  sit on opposite corners and the wide showroom shot takes the centre. */
const HONEYCOMB_ROWS = [
  [1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13],
];
const FEATURED_PHOTO = 7;

function HexagonPhoto({ n, featured }: { n: number; featured: boolean }) {
  const src = `/customers/customer-${String(n).padStart(2, "0")}.webp`;
  return (
    <div
      className={`group relative size-[62px] sm:size-24 lg:size-32 transition-transform duration-300 ease-out ${
        featured ? "z-20 scale-110 drop-shadow-lg" : "z-10 hover:z-20 hover:scale-105"
      }`}
    >
      <div
        className={`size-full overflow-hidden ${featured ? "bg-red p-1" : "bg-mist"}`}
        style={{ clipPath: HEX }}
      >
        <div className="relative size-full overflow-hidden" style={{ clipPath: HEX }}>
          <NextImage
            src={src}
            alt={`${SITE.name} customer with their motorcycle`}
            fill
            sizes="(min-width: 1024px) 140px, (min-width: 640px) 100px, 70px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </div>
    </div>
  );
}

/** Background Vector Waves matching reference styling */
function BackgroundWaves() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 600"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full opacity-40"
      fill="none"
    >
      {[0, 15, 30, 45, 60, 75, 90].map((offset) => (
        <path
          key={offset}
          d={`M-100 ${100 + offset * 4} C 400 ${-50 + offset * 3}, 800 ${600 - offset * 2}, 1540 ${200 + offset * 3}`}
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeOpacity="0.45"
        />
      ))}
    </svg>
  );
}

