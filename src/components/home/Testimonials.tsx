"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import NextImage from "next/image";
import { SITE } from "@/lib/site";

/**
 * Testimonials — reference layout: a giant grey ghost wordmark behind a photo
 * collage, one quote at a time, dash pagination underneath. Auto-advance is
 * off on purpose; this is the trust section, so let people read.
 *
 * PLACEHOLDER QUOTES — real ones needed before launch.
 */
const QUOTES = [
  {
    text: "Third bike I've bought from them. They tell you what's wrong with it before you find it yourself.",
    name: "Rahul Khurana",
  },
  {
    text: "Superb bikes and honest people. The process is transparent and the condition of every machine is outstanding.",
    name: "Abhinav Kaushik",
  },
  {
    text: "Shipped to Bengaluru in four days with the paperwork already sorted. No chasing anyone.",
    name: "Tripush Modgil",
  },
  {
    text: "They had the full service history for a seven-year-old bike. That told me everything I needed to know.",
    name: "Roman Tellis",
  },
] as const;

/* Stand-in owner photography for the test build. */
const OWNER_PHOTOS = [
  "/owners/owner-1.webp",
  "/owners/owner-2.webp",
  "/owners/owner-3.webp",
  "/owners/owner-4.webp",
  "/owners/owner-5.webp",
  "/owners/owner-1.webp",
];

export default function Testimonials() {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion() ?? false;
  const quote = QUOTES[i];

  return (
    <section className="relative overflow-hidden bg-paper py-16">
      <span
        aria-hidden
        className="ghost-word absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap text-[clamp(4rem,16vw,13rem)]"
      >
        {SITE.name}
      </span>

      <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
        {/* honeycomb collage — placeholder cells until owner photos land */}
        <ul className="mx-auto grid max-w-xl grid-cols-3 gap-2 sm:grid-cols-6">
          {OWNER_PHOTOS.map((src, n) => (
            <li
              key={n}
              className="relative aspect-square overflow-hidden bg-mist"
              style={{
                clipPath:
                  "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                transform: n % 2 ? "translateY(14%)" : undefined,
              }}
            >
              <NextImage
                src={src}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </li>
          ))}
        </ul>

        <h2 className="display mt-12 text-center text-[clamp(1.85rem,4.6vw,3.25rem)] text-red">
          What our <span className="text-graphite">customers say</span>
        </h2>

        <div className="mt-6 min-h-32">
          <AnimatePresence mode="wait" initial={false}>
            <motion.blockquote
              key={i}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-[62ch] text-center"
            >
              <p className="text-[16.5px] leading-[1.9] text-body">
                {quote.text}
              </p>
              <footer className="mt-6 text-[15px] font-semibold text-red">
                {quote.name}
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          {QUOTES.map((q, n) => (
            <button
              key={q.name}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Read review from ${q.name}`}
              aria-current={n === i ? "true" : undefined}
              className={`h-[3px] w-9 transition-colors ${
                n === i ? "bg-ink" : "bg-line hover:bg-slate"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
