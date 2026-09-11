"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

/**
 * Build Manual §06 — Lenis owns scroll and nothing else.
 *
 * The failure mode this guards against is two requestAnimationFrame loops:
 * Lenis running its own, GSAP running gsap.ticker, and ScrollTrigger reading a
 * scroll position that is one frame stale. So we drive Lenis FROM gsap.ticker
 * and let Lenis tell ScrollTrigger when to update. One loop, one clock.
 *
 * Mounted from (site)/layout.tsx only, never from the dashboard. That is not a
 * detail: when this did run over /admin it broke it outright — the
 * `html.lenis body { height: auto }` reset in globals.css overrode the
 * dashboard's own layout heights, and `.lenis-stopped { overflow: hidden }`
 * left the page dead after a scroll or two. Eased scrolling has no place in a
 * form-filling tool anyway.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Touch devices already do this better natively.
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    if (reduced || coarse) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      // Also strips the .lenis classes off <html>, releasing the height and
      // overflow overrides they carry.
      lenis.destroy();
    };
  }, []);

  // Route changes swap the whole document height out from under ScrollTrigger.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [pathname]);

  return <>{children}</>;
}
