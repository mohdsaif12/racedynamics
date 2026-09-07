"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DUR, EASE, START, reducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Masked upward reveal for large headings.
 *
 * The heading sits inside an `overflow-hidden` box and travels from
 * `translateY(100%)` to `translateY(0)` with a concurrent fade — a crisp
 * mechanical wipe, no bounce or overshoot.
 *
 * Note on line splitting: the spec asks for per-line stagger, but our headings
 * carry inline colour spans (`Popular <span class="text-graphite">bikes</span>`).
 * Splitting into words to measure line boxes would destroy that markup, so this
 * reveals the heading as one block instead. Where a genuine two-line stagger is
 * wanted, use two MaskReveals with `delay`.
 */
export default function MaskReveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Wrapper tag. Use `"h2"` / `"h3"` to keep heading semantics. */
  as?: "div" | "h2" | "h3" | "p" | "span";
  /** Seconds of offset, for staggering sibling MaskReveals. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion()) return;

      const inner = el.firstElementChild as HTMLElement | null;
      if (!inner) return;

      gsap.set(inner, { yPercent: 100, opacity: 0 });
      gsap.to(inner, {
        yPercent: 0,
        opacity: 1,
        duration: DUR.reveal,
        delay,
        ease: EASE.out,
        scrollTrigger: { trigger: el, start: START, once: true },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as never} className={`overflow-hidden ${className ?? ""}`}>
      <div>{children}</div>
    </Tag>
  );
}
