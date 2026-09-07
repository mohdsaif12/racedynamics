"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Odometer roll — Build Manual §04, transition window 200–420ms.
 *
 * Each character rolls independently with a small stagger. Values are set in
 * tabular figures by the caller so nothing reflows mid-roll and the labels
 * underneath never move.
 */
export default function RollingText({
  value,
  className,
  stagger = 0.022,
  duration = 0.34,
}: {
  value: string;
  className?: string;
  stagger?: number;
  duration?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <span className={className}>{value}</span>;

  return (
    <span className={className} aria-label={value}>
      {value.split("").map((char, i) => (
        <span
          key={i}
          aria-hidden
          className="relative inline-block overflow-hidden align-bottom"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${char}-${i}`}
              className="inline-block"
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-105%" }}
              transition={{
                duration,
                delay: i * stagger,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {char === " " ? " " : char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
