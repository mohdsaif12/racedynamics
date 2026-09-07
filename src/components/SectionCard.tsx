"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * A pinned card in a stack.
 *
 * Every card is `position: sticky; top: 0` inside one shared parent. A sticky
 * element stays stuck until its *parent* ends — which is the bottom of the
 * whole stack — so card 1 locks at the top and simply stays there while card 2
 * rises from below and covers it, then card 3 covers card 2, and so on. Later
 * cards paint over earlier ones by DOM order, so no z-index is needed.
 *
 * The dwell spacer after each card is what buys the hold: while it scrolls
 * past, the card above is still pinned and the next card has not started
 * rising yet. That is the window where the card's own contents pop in.
 *
 * Cards must fit roughly one viewport. A sticky element taller than the screen
 * pins with its tail unreachable below the fold, so section content is kept to
 * a screenful by design.
 */

const TONE = {
  paper: {
    bg: "bg-paper",
    shadow: "shadow-[0_-22px_50px_rgba(20,20,20,0.22)]",
    edge: "via-white/70",
  },
  mist: {
    bg: "bg-mist",
    shadow: "shadow-[0_-22px_50px_rgba(20,20,20,0.22)]",
    edge: "via-white/70",
  },
  ink: {
    bg: "bg-ink-2",
    shadow: "shadow-[0_-26px_60px_rgba(0,0,0,0.55)]",
    edge: "via-white/25",
  },
} as const;

export default function SectionCard({
  children,
  tone = "paper",
  /** Scroll distance the card is held before the next one starts rising. */
  dwell = 55,
  /**
   * Drawer variant, for the first card only. Instead of pinning, it pulls up
   * over the sticky hero on a negative margin so it reads as a drawer sliding
   * open. The matching top padding means the overlap eats the hero's tail, not
   * this card's own content. Its height is free, so it needn't fit a viewport.
   */
  overHero = false,
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONE;
  dwell?: number;
  overHero?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const t = TONE[tone];

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // The rounded edge is pronounced while the card is rising and flattens
      // as it locks against the top of the viewport.
      gsap.fromTo(
        el,
        { borderTopLeftRadius: "2.5rem", borderTopRightRadius: "2.5rem" },
        {
          borderTopLeftRadius: "0rem",
          borderTopRightRadius: "0rem",
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 70%",
            end: "top top",
            scrub: 0.4,
          },
        },
      );
    },
    { scope: ref },
  );

  const edge = (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${t.edge} to-transparent`}
    />
  );

  if (overHero) {
    return (
      <div
        ref={ref}
        className={`relative -mt-[18svh] overflow-hidden rounded-t-[2.5rem] pt-[7svh] ${t.bg} ${t.shadow} [&>section]:w-full`}
      >
        {edge}
        {children}
      </div>
    );
  }

  return (
    <>
      <div
        ref={ref}
        className={`sticky top-0 flex min-h-svh items-center overflow-hidden rounded-t-[2.5rem] ${t.bg} ${t.shadow} [&>section]:w-full`}
      >
        {edge}
        {children}
      </div>

      {/* Dwell: the card above stays pinned while this scrolls past. */}
      <div aria-hidden style={{ height: `${dwell}svh` }} />
    </>
  );
}
