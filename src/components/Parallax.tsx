"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { EASE, PARALLAX, reducedMotion, coarsePointer } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Very light scroll-linked drift for large visual blocks.
 *
 * Travel is capped at a few dozen pixels — enough to read as depth, far short
 * of the exaggerated parallax that makes a page feel unstable.
 *
 * Disabled on touch/mobile — scroll-scrubbed transforms on coarse-pointer
 * devices burn through the main thread during momentum scrolling, causing
 * visible stutter. The visual payoff is too small to justify it.
 */
export default function Parallax({
  children,
  className,
  distance = PARALLAX,
}: {
  children: React.ReactNode;
  className?: string;
  /** Total travel in px across the section's scroll range. */
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      // Skip on touch devices (phone/tablet) and reduced-motion prefs.
      if (!el || reducedMotion() || coarsePointer()) return;

      gsap.fromTo(
        el,
        { y: distance / 2 },
        {
          y: -distance / 2,
          ease: EASE.scrub,
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
