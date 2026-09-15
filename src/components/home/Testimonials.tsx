"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import NextImage from "next/image";
import { SITE } from "@/lib/site";
import type { Testimonial } from "@/lib/data/types";
import { StarIcon, QuoteMarkIcon } from "@/components/icons";

/**
 * Honeycomb photo cluster + quote carousel matching the reference design.
 * Features background vector waves, interlocking hexagonal photos for every customer review,
 * interactive photo selection, and bold red/graphite typography.
 */
export default function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion() ?? false;

  // Filter only testimonials that have photos as requested
  const itemsWithPhotos = testimonials.filter((t) => Boolean(t.photo));
  const list = itemsWithPhotos.length > 0 ? itemsWithPhotos : testimonials;

  if (list.length === 0) return null;

  const safeIndex = i % list.length;
  const activeQuote = list[safeIndex];

  return (
    <section className="relative overflow-hidden bg-paper py-20 lg:py-28">
      {/* Background Ghost Wordmark */}
      <span
        aria-hidden
        className="ghost-word absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-[clamp(5rem,18vw,15rem)] font-extrabold uppercase tracking-widest text-slate/[0.04] pointer-events-none select-none"
      >
        {SITE.name}
      </span>

      {/* Background Wave Lines SVG */}
      <BackgroundWaves />

      <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
        {/* Honeycomb Hexagonal Photo Cluster */}
        <div className="mx-auto flex flex-col items-center justify-center max-w-4xl py-4">
          <div className="flex flex-col items-center justify-center gap-y-[-12px] sm:gap-y-[-18px]">
            {/* Row 1 (3 items) */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {list.slice(0, 3).map((t, idx) => {
                const globalIdx = idx;
                const isActive = globalIdx === safeIndex;
                return (
                  <HexagonTile
                    key={t.id}
                    testimonial={t}
                    isActive={isActive}
                    onClick={() => setI(globalIdx)}
                  />
                );
              })}
            </div>

            {/* Row 2 (4 items) - offset slightly */}
            <div className="flex justify-center gap-2 sm:gap-3 -mt-3 sm:-mt-5">
              {list.slice(3, 7).map((t, idx) => {
                const globalIdx = 3 + idx;
                const isActive = globalIdx === safeIndex;
                return (
                  <HexagonTile
                    key={t.id}
                    testimonial={t}
                    isActive={isActive}
                    onClick={() => setI(globalIdx)}
                  />
                );
              })}
            </div>

            {/* Row 3 (3 items) */}
            <div className="flex justify-center gap-2 sm:gap-3 -mt-3 sm:-mt-5">
              {list.slice(7, 10).map((t, idx) => {
                const globalIdx = 7 + idx;
                const isActive = globalIdx === safeIndex;
                return (
                  <HexagonTile
                    key={t.id}
                    testimonial={t}
                    isActive={isActive}
                    onClick={() => setI(globalIdx)}
                  />
                );
              })}
            </div>

            {/* Row 4 (2 items) */}
            {list.length > 10 && (
              <div className="flex justify-center gap-2 sm:gap-3 -mt-3 sm:-mt-5">
                {list.slice(10, 12).map((t, idx) => {
                  const globalIdx = 10 + idx;
                  const isActive = globalIdx === safeIndex;
                  return (
                    <HexagonTile
                      key={t.id}
                      testimonial={t}
                      isActive={isActive}
                      onClick={() => setI(globalIdx)}
                    />
                  );
                })}
              </div>
            )}
          </div>
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

/** Interactive Hexagonal Photo Tile */
function HexagonTile({
  testimonial,
  isActive,
  onClick,
}: {
  testimonial: Testimonial;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View review by ${testimonial.name}`}
      className={`group relative size-20 sm:size-28 lg:size-32 transition-transform duration-300 ease-out focus:outline-none ${
        isActive
          ? "scale-110 z-20 drop-shadow-lg"
          : "scale-100 hover:scale-105 z-10 opacity-90 hover:opacity-100"
      }`}
    >
      <div
        className={`size-full overflow-hidden transition-all duration-300 ${
          isActive ? "bg-red p-1" : "bg-mist hover:bg-slate/30"
        }`}
        style={{
          clipPath:
            "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        }}
      >
        <div
          className="relative size-full overflow-hidden"
          style={{
            clipPath:
              "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
          }}
        >
          {testimonial.photo ? (
            <NextImage
              src={testimonial.photo}
              alt={testimonial.name}
              fill
              sizes="140px"
              className={`object-cover transition-transform duration-500 ${
                isActive ? "scale-110" : "group-hover:scale-105"
              }`}
            />
          ) : (
            <div className="size-full bg-mist grid place-items-center font-bold text-slate">
              {testimonial.name[0]}
            </div>
          )}
        </div>
      </div>
    </button>
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

