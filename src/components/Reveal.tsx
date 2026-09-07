"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DUR, EASE, SHIFT, STAGGER, START, reducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Staggered upward entrance for a group of siblings.
 *
 * Pure translate + fade — no scale, no overshoot. Cards and list items rise a
 * short distance and stop. This is the workhorse reveal for standard sections.
 *
 * The hidden state is set in JS, not CSS, and useGSAP runs before paint: no
 * flash, and if the script never runs the content is simply visible rather than
 * stranded at opacity 0.
 */
export default function RevealGroup({
  children,
  selector = ":scope > *",
  stagger = STAGGER.normal,
  y = SHIFT.md,
  duration = DUR.reveal,
  className,
}: {
  children: React.ReactNode;
  /** Which descendants to stagger. Defaults to direct children. */
  selector?: string;
  stagger?: number;
  /** Travel distance in px. Keep within SHIFT.sm–SHIFT.lg. */
  y?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const host = ref.current;
      if (!host || reducedMotion()) return;

      const items = host.querySelectorAll(selector);
      if (!items.length) return;

      gsap.set(items, { autoAlpha: 0, y });
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration,
        ease: EASE.out,
        stagger,
        scrollTrigger: { trigger: host, start: START, once: true },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
