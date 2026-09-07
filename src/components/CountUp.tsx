"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Counts up once, the first time it scrolls into view — the stat treatment on
 * unitedcarriers.com (2,500+ shipments, 98.2% on-time).
 *
 * Renders the final value immediately under reduced motion, and on tabular
 * figures so the digits don't jitter the layout as they roll.
 */
export default function CountUp({
  to,
  suffix = "",
  decimals = 0,
  className,
}: {
  to: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  const [n, setN] = useState(0);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!seen || reduced) return;

    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      // easeOutExpo — quick off the line, settles rather than stops dead
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setN(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, reduced]);

  const value = reduced ? to : n;

  return (
    <span ref={ref} className={`figure-nums ${className ?? ""}`}>
      {value.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
