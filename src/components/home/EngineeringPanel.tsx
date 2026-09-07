"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DUR, EASE, SHIFT, reducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The technical panel — the one section driven directly by scroll position
 * rather than fired once on entry.
 *
 * As you scroll: a connector line draws left to right between the nodes, each
 * node lights up as the line reaches it, and its copy resolves in behind. The
 * intent is a precision instrument coming online, not a flourish.
 *
 * The connector is measured from the live DOM (first node centre to last node
 * centre) rather than hard-coded from the grid maths, so it stays correct
 * across breakpoints and if the node count changes.
 */
export default function EngineeringPanel({
  points,
  icon,
}: {
  points: readonly string[];
  /** A rendered element, not a factory — functions cannot cross the
      server/client boundary. Reused for every node. */
  icon: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const line = lineRef.current;
      if (!wrap) return;

      const nodes = Array.from(
        wrap.querySelectorAll<HTMLElement>("[data-node]"),
      );
      const copy = Array.from(wrap.querySelectorAll<HTMLElement>("[data-copy]"));
      if (!nodes.length) return;

      /* Measure the connector against the real node positions. */
      const layoutLine = () => {
        if (!line) return;
        const host = wrap.getBoundingClientRect();
        const first = nodes[0].getBoundingClientRect();
        const last = nodes[nodes.length - 1].getBoundingClientRect();
        const startX = first.left - host.left + first.width / 2;
        const endX = last.left - host.left + last.width / 2;
        const midY = first.top - host.top + first.height / 2;

        // Stacked layout: the nodes sit in a column, so a horizontal rule
        // would be meaningless. Hide it and let the nodes reveal on their own.
        const horizontal = Math.abs(last.top - first.top) < 4;
        line.style.opacity = horizontal ? "1" : "0";
        line.style.left = `${startX}px`;
        line.style.width = `${Math.max(endX - startX, 0)}px`;
        line.style.top = `${midY}px`;
      };

      layoutLine();
      window.addEventListener("resize", layoutLine);

      if (reducedMotion()) {
        return () => window.removeEventListener("resize", layoutLine);
      }

      gsap.set(nodes, { borderColor: "var(--color-line)", scale: 0.96 });
      gsap.set(copy, { autoAlpha: 0, y: SHIFT.sm });
      if (line) gsap.set(line, { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top 78%",
          end: "top 32%",
          scrub: 0.5,
        },
      });

      if (line) {
        tl.to(line, { scaleX: 1, duration: 1, ease: EASE.scrub }, 0);
      }

      // Each node lights as the line arrives at it.
      nodes.forEach((node, i) => {
        const at = (i / Math.max(nodes.length - 1, 1)) * 0.82;
        tl.to(
          node,
          {
            borderColor: "var(--color-red)",
            scale: 1,
            duration: 0.16,
            ease: EASE.out,
          },
          at,
        );
        if (copy[i]) {
          tl.to(
            copy[i],
            { autoAlpha: 1, y: 0, duration: 0.2, ease: EASE.out },
            at + 0.04,
          );
        }
      });

      return () => window.removeEventListener("resize", layoutLine);
    },
    { scope: wrapRef },
  );

  return (
    <div ref={wrapRef} className="relative mt-10">
      {/* connector — measured and positioned in JS */}
      <span
        ref={lineRef}
        aria-hidden
        className="pointer-events-none absolute z-0 hidden h-px bg-red/60 lg:block"
      />

      <ul className="relative z-10 grid gap-8 lg:grid-cols-3">
        {points.map((p, i) => (
          <li key={p} className="flex items-center gap-5">
            <span
              data-node
              style={{ transitionDuration: `${DUR.micro}s` }}
              className="grid size-[86px] shrink-0 place-items-center rounded-full border border-line bg-paper"
            >
              {icon}
            </span>
            <span data-copy className="text-[17px] italic text-body">
              {p}
            </span>
            <span className="sr-only">Step {i + 1}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
