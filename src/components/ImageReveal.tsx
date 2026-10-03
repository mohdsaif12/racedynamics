"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DUR, EASE, reducedMotion, revealDur, revealStart } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Image reveal — a mask wipes upward while the content settles out of a slight
 * zoom (1.05 → 1). Reads as the image being uncovered rather than faded in.
 *
 * The two run together: by the time the mask clears, the scale has landed.
 */
export default function ImageReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion()) return;

      const inner = el.firstElementChild as HTMLElement | null;
      if (!inner) return;

      gsap.set(el, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(inner, { scale: 1.05 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: revealStart(), once: true },
        delay: revealDur(delay),
      });

      tl.to(el, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: revealDur(DUR.slow),
        ease: EASE.outQuart,
      }).to(
        inner,
        { scale: 1, duration: revealDur(DUR.cinematic), ease: EASE.out },
        0,
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
