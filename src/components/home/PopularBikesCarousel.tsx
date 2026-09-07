"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "motion/react";
import MaskReveal from "@/components/MaskReveal";
import TextReveal from "@/components/TextReveal";
import { BIKES, getCategory } from "@/lib/inventory";
import { formatKm, formatPrice, pad, STATUS_LABEL } from "@/lib/format";

/**
 * Popular bikes — an interactive showroom.
 *
 * One machine, large and centred, floating over a dark pedestal on a dark
 * ground. Switching bikes is a single choreographed move, not four independent
 * animations: the outgoing machine swings off its arc while the incoming one
 * swings in from the opposite side, the pedestal shifts under them, the
 * oversized model name cross-fades sideways, and the readout updates last.
 *
 * The arc is one `rotate` about a `transformOrigin` far below the stage —
 * rotating about a point underneath carries anything above it sideways along a
 * circle, so the machine travels through space rather than sliding flat.
 *
 * All transforms are GPU-friendly: rotate, translate, scale, opacity.
 */

const WRAP = "mx-auto max-w-[1400px] px-5 lg:px-10";

/** easeOutCubic — the Bezier form of the `power3.out` used across the site. */
const EASE_OUT = [0.33, 1, 0.68, 1] as const;
const AUTOPLAY_MS = 5600;
const SWAP = 0.9;

/** Length of the imaginary rod the machine is mounted on. */
const PIVOT = 1150;
/** Tilt at the extremes. 28° on a 1150px arm carries it ~540px sideways. */
const SWING = 28;

/**
 * One sequence, offset in stages. The machine leads, the pedestal follows it,
 * the typography crosses behind, and the text lands last — a short cascade
 * rather than four things firing at once.
 */
const SEQ = { bike: 0, ghost: 0.05, platform: 0.08, info: 0.14 } as const;

/* The three RACEDYNAMICS brand renders, named explicitly. The inventory page
   carries photos on more machines than these, so "has an image" is no longer
   the right test for what belongs in this showcase.

   Module scope: rebuilding this array each render would make its length a
   dependency the React Compiler cannot memoize around. */
const FEATURED_SLUGS = [
  "panigale-v4-2022",
  "s1000rr-2020",
  "rsv4-factory-2019",
];
const FEATURED = FEATURED_SLUGS.map(
  (slug) => BIKES.find((b) => b.slug === slug)!,
).filter(Boolean);

export default function PopularBikes() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const platform = useAnimationControls();

  const bike = FEATURED[index];
  const sold = bike.status === "booked" || bike.status === "sold";
  const descriptor = getCategory(bike.category)?.blurb ?? "";

  const step = useCallback((d: 1 | -1) => {
    setDir(d);
    setIndex((i) => (i + d + FEATURED.length) % FEATURED.length);
  }, []);

  /* The pedestal is part of the move: it takes a nudge in the travel direction
     and settles. Keyframes rather than a state toggle, so it always returns to
     rest however fast you click. */
  useEffect(() => {
    if (reduced) return;
    platform.start({
      x: [dir * 22, 0],
      rotate: [dir * 1.6, 0],
      scaleX: [1.05, 1],
      transition: { duration: SWAP, ease: EASE_OUT, delay: SEQ.platform },
    });
  }, [index, dir, reduced, platform]);

  useEffect(() => {
    if (paused || reduced) return;
    const t = setInterval(() => step(1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, reduced, step]);

  /* Arrow keys act only when the stage has focus — this section sits mid-page
     and must not hijack the document's arrow keys. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  /* Positive rotation about a pivot below carries the group to the right. */
  const bikeVariants = {
    enter: (d: 1 | -1) => ({
      rotate: d > 0 ? SWING : -SWING,
      scale: 0.9,
      opacity: 0,
    }),
    center: { rotate: 0, scale: 1, opacity: 1 },
    exit: (d: 1 | -1) => ({
      rotate: d > 0 ? -SWING : SWING,
      scale: 0.9,
      opacity: 0,
    }),
  };

  const ghostVariants = {
    enter: (d: 1 | -1) => ({ x: d > 0 ? 70 : -70, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: 1 | -1) => ({ x: d > 0 ? -70 : 70, opacity: 0 }),
  };

  const swap = { duration: reduced ? 0 : SWAP, ease: EASE_OUT };

  return (
    <section className="relative overflow-hidden bg-ink py-16">
      <div className={WRAP}>
        <MaskReveal
          as="h2"
          className="display text-center text-[clamp(1.85rem,4.6vw,3.25rem)] text-red"
        >
          Popular <span className="text-white">bikes</span>
        </MaskReveal>
        <TextReveal
          as="p"
          delay={0.08}
          className="mx-auto mt-4 max-w-[54ch] text-center text-[15px] text-ash"
        >
          A complete solution to owning your dream superbike, cruiser, adventure
          or classic — all under one roof.
        </TextReveal>

        {/* ------------------------------------------- stage (scroll reveal) */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Popular bikes"
          onKeyDown={onKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="relative mt-10 outline-none focus-visible:ring-2 focus-visible:ring-red"
        >
          <div className="relative min-h-[360px] overflow-hidden sm:min-h-[520px]">
            {/* oversized model name, crossing sideways with the machine */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden"
            >
              <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                <motion.span
                  key={bike.slug}
                  custom={dir}
                  variants={ghostVariants}
                  initial={reduced ? false : "enter"}
                  animate="center"
                  exit="exit"
                  transition={{ ...swap, delay: reduced ? 0 : SEQ.ghost }}
                  className="ghost-word whitespace-nowrap text-[clamp(3.5rem,15vw,11rem)] leading-none text-[#242428]"
                >
                  {bike.model}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* the pedestal — shifts with the machine, never spins */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[9%] z-0 flex justify-center">
              <motion.div
                animate={{ scale: hovered && !reduced ? 1.03 : 1 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
              >
                <motion.div
                  animate={platform}
                  className="relative h-[64px] sm:h-[78px]"
                  style={{ width: "min(62vw, 30rem)" }}
                >
                  <div className="absolute -inset-x-12 -bottom-10 top-0 rounded-[50%] bg-[radial-gradient(closest-side,rgba(213,13,46,0.34),transparent)] blur-2xl" />
                  <div className="absolute inset-0 rounded-[50%] bg-[linear-gradient(180deg,#2a2a30_0%,#131316_58%,#0a0a0c_100%)]" />
                  <div className="absolute inset-0 rounded-[50%] ring-1 ring-inset ring-red/55" />
                  <div className="absolute inset-x-12 top-2 h-3 rounded-[50%] bg-white/20 blur-[3px]" />
                </motion.div>
              </motion.div>
            </div>

            {/* the machine */}
            <div className="absolute inset-x-0 bottom-[16%] z-10 flex justify-center">
              <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                <motion.div
                  key={bike.slug}
                  custom={dir}
                  variants={bikeVariants}
                  initial={reduced ? false : "enter"}
                  animate="center"
                  exit="exit"
                  transition={{ ...swap, delay: reduced ? 0 : SEQ.bike }}
                  whileHover={reduced ? undefined : { scale: 1.03, y: -8 }}
                  onHoverStart={() => setHovered(true)}
                  onHoverEnd={() => setHovered(false)}
                  style={{ transformOrigin: `50% ${PIVOT}px` }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.14}
                  dragMomentum={false}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60 || info.velocity.x < -400) step(1);
                    else if (info.offset.x > 60 || info.velocity.x > 400) step(-1);
                  }}
                  className="w-[min(76%,34rem)] cursor-grab active:cursor-grabbing"
                >
                  <NextImage
                    src={bike.image as string}
                    alt={`${bike.brand} ${bike.fullName}`}
                    width={1400}
                    height={900}
                    priority={index === 0}
                    /* drop-shadow traces the cut-out silhouette; box-shadow
                       would draw a rectangle around it. */
                    className="h-auto w-full [filter:drop-shadow(0_30px_24px_rgba(0,0,0,0.55))]"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {sold && (
              <span className="absolute right-4 top-4 z-20 bg-red px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                {STATUS_LABEL[bike.status]}
              </span>
            )}
          </div>

          <Arrow side="left" onClick={() => step(-1)} />
          <Arrow side="right" onClick={() => step(1)} />
        </motion.div>

        {/* ------------------------------------- readout, lands last in the seq */}
        <div className="relative mt-10 min-h-[190px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={bike.slug}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -12 }}
              transition={{
                duration: reduced ? 0 : 0.5,
                ease: EASE_OUT,
                delay: reduced ? 0 : SEQ.info,
              }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <p className="eyebrow text-red">{bike.brand}</p>
              <h3 className="display text-[clamp(1.6rem,3.6vw,2.5rem)] text-white">
                {bike.fullName}
              </h3>
              <p className="max-w-[46ch] text-[14.5px] text-ash">{descriptor}</p>

              <p className="figure-nums display mt-1 text-[clamp(1.3rem,2.8vw,1.9rem)] text-white">
                {sold ? STATUS_LABEL[bike.status] : formatPrice(bike.priceINR)}
              </p>

              <dl className="mt-1 flex flex-wrap items-center justify-center divide-x divide-line-dark">
                <Spec label="Reg. Year" value={String(bike.year)} />
                <Spec label="Kms." value={formatKm(bike.km)} />
                <Spec label="Engine" value={`${bike.engineCc} cc`} />
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ------------------------------------------------------ navigation */}
        <div className="mt-6 flex flex-col items-center gap-5">
          <div className="flex items-center gap-4">
            <span className="figure-nums text-[12px] tracking-[0.12em] text-ash">
              {pad(index + 1)}{" "}
              <span className="text-slate">/ {pad(FEATURED.length)}</span>
            </span>
            <div className="flex gap-2">
              {FEATURED.map((b, i) => (
                <button
                  key={b.slug}
                  type="button"
                  onClick={() => {
                    setDir(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  aria-label={`Show ${b.brand} ${b.fullName}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`h-[3px] w-7 transition-colors duration-200 ${
                    i === index ? "bg-red" : "bg-line-dark hover:bg-slate"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={`/bike/${bike.slug}`} className="btn-red hover:bg-red-dark">
              Full specs
            </Link>
            <Link
              href="/inventory"
              className="inline-block border border-white/25 px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-ink"
            >
              Browse collection
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5">
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate">
        {label}
      </dt>
      <dd className="figure-nums mt-1 text-[14px] font-bold uppercase text-white">
        {value}
      </dd>
    </div>
  );
}

function Arrow({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous bike" : "Next bike"}
      className={`absolute top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-red text-white shadow-[0_4px_20px_rgba(213,13,46,0.45)] transition-all duration-200 ease-out hover:scale-105 hover:bg-red-dark active:scale-95 sm:size-14 ${
        side === "left" ? "left-0 lg:left-4" : "right-0 lg:right-4"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={side === "left" ? "M15 5L8 12l7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
