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
 * It deliberately does NOT run on /admin. The dashboard is a tool, not a
 * showpiece — nobody wants eased scrolling while filling in a form — and
 * Lenis actively breaks it: the `html.lenis body { height: auto }` reset in
 * globals.css overrides the dashboard's own layout heights, and if Lenis is
 * ever stopped, `.lenis-stopped { overflow: hidden }` locks the page after a
 * scroll or two with no way to get further down.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return; // native scrolling in the dashboard

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
      // Also strips the .lenis classes off <html>, which is what releases the
      // height and overflow overrides above.
      lenis.destroy();
    };
    // Keyed on the boolean, not the pathname, so Lenis is torn down and rebuilt
    // only when crossing into or out of the dashboard — not on every
    // navigation between marketing pages.
  }, [isAdmin]);

  // Route changes swap the whole document height out from under ScrollTrigger.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [pathname]);

  return <>{children}</>;
}
