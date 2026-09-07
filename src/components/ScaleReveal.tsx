"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DUR, EASE, START, reducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Restrained cinematic reveal for the closing CTA: the heading settles out of
 * a slight scale (0.92 to 1) as it fades in. Used once on the page — its whole
 * job is to feel different from the standard section reveals.
 */
export default function ScaleReveal({
  children,
  className,
  as: Tag = "div",
  from = 0.92,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "h2" | "p";
  from?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion()) return;

      gsap.set(el, { autoAlpha: 0, scale: from });
      gsap.to(el, {
        autoAlpha: 1,
        scale: 1,
        duration: DUR.slow,
        delay,
        ease: EASE.outQuart,
        scrollTrigger: { trigger: el, start: START, once: true },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
