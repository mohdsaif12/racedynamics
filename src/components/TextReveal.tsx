"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DUR, EASE, SHIFT, START, reducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Supporting copy: a short fade and a small lift. Quieter than MaskReveal by
 * design — body text should follow its heading, not compete with it.
 */
export default function TextReveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "p" | "span";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion()) return;

      gsap.set(el, { autoAlpha: 0, y: SHIFT.sm });
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: DUR.reveal,
        delay,
        ease: EASE.out,
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
