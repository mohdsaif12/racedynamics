"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import NextImage from "next/image";
import { SITE } from "@/lib/site";
import type { Testimonial } from "@/lib/data/types";
import { StarIcon, QuoteMarkIcon } from "@/components/icons";

/**
 * Testimonials — reference layout: a giant grey ghost wordmark behind a photo
 * collage, one quote at a time, dash pagination underneath. Auto-advance is
 * off on purpose; this is the trust section, so let people read.
 *
 * `testimonials` comes from the client's /admin — see getTestimonials() in
 * src/lib/data/testimonials.ts for the fallback used before any are added.
 */
export default function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion() ?? false;

  if (testimonials.length === 0) return null;

  const safe = i % testimonials.length;
  const quote = testimonials[safe];
  const photos = testimonials.filter((t) => t.photo).slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-paper py-16">
      <span
        aria-hidden
        className="ghost-word absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap text-[clamp(4rem,16vw,13rem)]"
      >
        {SITE.name}
      </span>

      <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
        {photos.length > 0 && (
          <ul className="mx-auto grid max-w-xl grid-cols-3 gap-2 sm:grid-cols-6">
            {photos.map((t, n) => (
              <li
                key={t.id}
                className="relative aspect-square overflow-hidden bg-mist"
                style={{
                  clipPath:
                    "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  transform: n % 2 ? "translateY(14%)" : undefined,
                }}
              >
                <NextImage
                  src={t.photo!}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        )}

        <h2 className="display mt-12 text-center text-[clamp(1.85rem,4.6vw,3.25rem)] text-red">
          What our <span className="text-graphite">customers say</span>
        </h2>

        <div className="mt-6 min-h-32">
          <AnimatePresence mode="wait" initial={false}>
            <motion.blockquote
              key={quote.id}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto max-w-[62ch] text-center"
            >
              {/* Sits behind the words rather than above them — it should
                  register as texture, not as another thing to read. */}
              <QuoteMarkIcon
                size={72}
                className="pointer-events-none absolute -top-7 left-1/2 -z-10 -translate-x-1/2 text-graphite/[0.06]"
              />

              <div className="mb-5 flex justify-center gap-1 text-red">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} size={15} />
                ))}
              </div>

              <p className="text-[16.5px] leading-[1.9] text-body">
                {quote.quote}
              </p>
              <footer className="mt-6 text-[15px] font-semibold text-red">
                {quote.name}
                {quote.bikeBought && (
                  <span className="ml-2 font-normal text-slate">
                    · {quote.bikeBought}
                  </span>
                )}
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        {testimonials.length > 1 && (
          <div className="mt-6 flex justify-center gap-3">
            {testimonials.map((t, n) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setI(n)}
                aria-label={`Read review from ${t.name}`}
                aria-current={n === safe ? "true" : undefined}
                className={`h-[3px] w-9 transition-colors ${
                  n === safe ? "bg-ink" : "bg-line hover:bg-slate"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
