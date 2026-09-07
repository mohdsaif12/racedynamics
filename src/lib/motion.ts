/**
 * The site's motion language, in one place.
 *
 * Fast, mechanical, precise. Every reveal on the homepage pulls its timing and
 * easing from here so the page reads as one system rather than a pile of
 * individually-tuned effects.
 *
 * Deliberately absent: bounce, elastic, and back easing. `power3.out` /
 * `power4.out` are GSAP's easeOutCubic / easeOutQuart — they decelerate hard
 * and stop dead, which is the mechanical feel we want.
 */

export const EASE = {
  /** easeOutCubic — the default for reveals. */
  out: "power3.out",
  /** easeOutQuart — slightly sharper, for cinematic moments. */
  outQuart: "power4.out",
  /** Linear, for anything scrubbed directly by scroll position. */
  scrub: "none",
} as const;

export const DUR = {
  /** 220ms — hovers, taps, colour changes. */
  micro: 0.22,
  /** 650ms — the standard section reveal. */
  reveal: 0.65,
  /** 800ms — slightly weightier reveals (large images, final CTA). */
  slow: 0.8,
  /** 1.2s — cinematic beats only. */
  cinematic: 1.2,
} as const;

export const STAGGER = {
  /** 80ms — dense groups such as the brand wordmarks. */
  tight: 0.08,
  /** 110ms — the standard for cards and list items. */
  normal: 0.11,
  /** 150ms — a small number of large elements. */
  loose: 0.15,
} as const;

/** Travel distances. Subtle by design — nothing flies across the screen. */
export const SHIFT = {
  sm: 20,
  md: 30,
  lg: 45,
} as const;

/** Where a reveal fires as the element scrolls up into view. */
export const START = "top 85%";

/** Parallax range for large visual sections. Depth, not distraction. */
export const PARALLAX = 28;

export function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
