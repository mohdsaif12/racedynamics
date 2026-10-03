"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DUR, EASE, SHIFT, STAGGER, coarsePointer, reducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The technical panel — three icon nodes, each with a line of copy.
 *
 * Desktop: scrubbed to scroll position — each node lights up in turn and its
 * copy resolves in behind it.
 *
 * There used to be a connector rule drawn between the nodes as well; it ran
 * straight through the middle of the copy beside each node, so it's gone.
 *
 * Touch: no scrub. The column of nodes is taller than a phone screen, so a
 * scrub tied to the whole panel left the lower rows blank until you'd
 * already scrolled past them. Each row now simply fades in as it enters.
 */
export default function EngineeringPanel({
  points,
}: {
  /** Each node carries its own icon. They are rendered elements, not
      factories — functions cannot cross the server/client boundary. */
  points: readonly { text: string; icon: React.ReactNode }[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap || reducedMotion()) return;

      const rows = Array.from(wrap.querySelectorAll<HTMLElement>("li"));
      const nodes = Array.from(wrap.querySelectorAll<HTMLElement>("[data-node]"));
      const copy = Array.from(wrap.querySelectorAll<HTMLElement>("[data-copy]"));
      if (!nodes.length) return;

      if (coarsePointer()) {
        gsap.set(nodes, { borderColor: "var(--color-red)" });
        rows.forEach((row) => {
          gsap.from(row, {
            autoAlpha: 0,
            y: SHIFT.sm,
            duration: DUR.micro * 2,
            ease: EASE.out,
            scrollTrigger: { trigger: row, start: "top bottom", once: true },
          });
        });
        return;
      }

      gsap.set(nodes, { borderColor: "var(--color-line)", scale: 0.96 });
      gsap.set(copy, { autoAlpha: 0, y: SHIFT.sm });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top 85%",
          end: "top 45%",
          scrub: 0.4,
        },
      });

      nodes.forEach((node, i) => {
        const at = i * STAGGER.loose * 2;
        tl.to(
          node,
          { borderColor: "var(--color-red)", scale: 1, duration: 0.2, ease: EASE.out },
          at,
        );
        if (copy[i]) {
          tl.to(copy[i], { autoAlpha: 1, y: 0, duration: 0.25, ease: EASE.out }, at + 0.05);
        }
      });
    },
    { scope: wrapRef },
  );

  return (
    <div ref={wrapRef} className="relative mt-10">
      <ul className="grid gap-8 lg:grid-cols-3">
        {points.map((p, i) => (
          <li key={p.text} className="flex items-center gap-5">
            <span
              data-node
              style={{ transitionDuration: `${DUR.micro}s` }}
              className="grid size-[86px] shrink-0 place-items-center rounded-full border border-line bg-paper text-red"
            >
              {p.icon}
            </span>
            <span data-copy className="text-[17px] italic text-body">
              {p.text}
            </span>
            <span className="sr-only">Step {i + 1}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
