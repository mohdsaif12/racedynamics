"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SITE } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Hero — canvas image-sequence scrubber (Build Manual §01).
 *
 * Source: Motorcycle_accelerates_in_dark, 1920x1080, 8s @ 24fps, sparkle
 * watermark removed with ffmpeg delogo. Frames in public/hero/{desktop,mobile}.
 *
 * Beat map, measured off the converted frames:
 *   0.00–0.20  black; the bike is a silhouette, sensed rather than seen
 *   0.20–0.40  rim light builds, the machine resolves in side profile
 *   0.40–0.60  headlight punches on
 *   0.60–0.75  it accelerates left and clears the frame
 *   0.72–0.80  smoke subsides and the logo resolves out of it
 *   0.80–1.00  logo HOLDS, CTAs join it
 *
 * Pinned with `position: sticky`, not ScrollTrigger's pin: sticky needs no
 * pin-spacer, so it cannot fight Lenis over document height.
 */

const DESKTOP = { dir: "/hero/desktop", count: 192 };
const MOBILE = { dir: "/hero/mobile", count: 96 };

/* ---- Tuning ------------------------------------------------------------
   Total scroll distance for the whole sequence. Everything below is a
   fraction of it, so shortening this tightens the entire hero at once. */
const SCROLL_HEIGHT = "260svh";

/* How far past "fit the width" the frame is scaled on portrait phones.
   Capped by cover in draw(). 1.35 keeps the full 18%-87% lit span on screen
   with margin to spare. */
const PORTRAIT_ZOOM = 1.35;

/* Fraction down the frame that the lit subject centres on. */
const PORTRAIT_ANCHOR = 0.58;

/* The bike clears the frame at ~0.75. The logo starts resolving just before
   that so it rides the last of the motion, and is fully settled by 0.80 —
   about one scroll after the bay empties, not five. */
const LOGO_IN = 0.72;
const LOGO_DUR = 0.08;
const CTA_IN = 0.82;
const CTA_DUR = 0.05;

const framePath = (dir: string, i: number) =>
  `${dir}/frame_${String(i).padStart(4, "0")}.webp`;

export default function HeroSequence() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const framesRef = useRef<HTMLImageElement[]>([]);
  const painted = useRef(-1);
  const [ready, setReady] = useState<boolean | null>(null);
  const reduced = useReducedMotion() ?? false;

  /* ---- Load the set, and only report ready once the opening frames have
     actually decoded.

     The earlier version flipped `ready` as soon as a single probe image
     loaded, while every other frame had merely had `.src` assigned. The
     timeline was then built and its first `draw(0)` bailed on `!img.complete`,
     so the canvas stayed blank until you had scrolled far enough to reach a
     frame that happened to have arrived — the dead zone at the top of the
     page. Waiting for a real batch means frame 0 is paintable the instant the
     timeline exists. ---- */
  useEffect(() => {
    const set = window.matchMedia("(max-width: 767px)").matches
      ? MOBILE
      : DESKTOP;

    let cancelled = false;
    let decoded = 0;
    const OPENING = Math.min(16, set.count);

    /* Counts a frame as settled whether it decoded or failed, so one missing
       file cannot leave the hero waiting forever. */
    const settle = () => {
      if (cancelled) return;
      decoded += 1;
      if (decoded === OPENING) setReady(true);
    };

    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= set.count; i++) {
      const img = new window.Image();
      img.decoding = "async";
      img.fetchPriority = i <= OPENING ? "high" : "low";
      if (i <= OPENING) {
        // Handlers are attached before `src`, so cached frames still fire.
        img.onload = settle;
        img.onerror =
          i === 1
            ? () => {
                if (!cancelled) setReady(false);
              }
            : settle;
      }
      img.src = framePath(set.dir, i);
      images[i - 1] = img;
    }
    framesRef.current = images;

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- Paint one frame. Cover on landscape, contain on portrait so a phone
     doesn't crop the bike out of a 16:9 frame.

     If the requested frame has not decoded yet we walk back to the nearest one
     that has, so scrubbing holds on the last good image instead of freezing on
     a blank canvas. ---- */
  const draw = (target: number) => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;

    let index = target;
    while (
      index > 0 &&
      !(frames[index]?.complete && frames[index].naturalWidth > 0)
    ) {
      index -= 1;
    }

    const img = frames[index];
    if (!canvas || !img?.complete || img.naturalWidth === 0) return;
    if (painted.current === index) return;
    painted.current = index;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const sx = w / img.naturalWidth;
    const sy = h / img.naturalHeight;
    const cover = Math.max(sx, sy);
    const contain = Math.min(sx, sy);

    /* Landscape viewports get cover — the frame fills the stage, no seam.
       A portrait phone can't: the frames are 16:9 and covering a 9:19.5
       screen would crop ~60% of the width, taking the bike's ride-out with
       it. So we fit, then zoom back up as far as is safe. The lit subject
       never extends past 18%-87% of the frame width, and everything outside
       it is pure black, so cropping this much costs nothing visible. */
    const scale =
      h > w ? Math.min(contain * PORTRAIT_ZOOM, cover) : cover;

    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;

    /* Vertically the lit area sits low in the frame (roughly 27%-90%), so
       centring the image leaves a dead black band up top and pushes the bike
       below the optical centre. Anchor on the action instead. */
    const dy =
      dh >= h ? (h - dh) / 2 : h / 2 - dh * PORTRAIT_ANCHOR;

    ctx.drawImage(img, (w - dw) / 2, dy, dw, dh);
  };

  useGSAP(
    () => {
      const count = framesRef.current.length;

      if (reduced) {
        gsap.set(introRef.current, { autoAlpha: 0 });
        gsap.set([wordRef.current, ctaRef.current], { autoAlpha: 1, y: 0 });
        if (count) {
          const lastImg = framesRef.current[count - 1];
          const paint = () => draw(count - 1);
          if (lastImg?.complete) paint();
          else lastImg?.addEventListener("load", paint);
        }
        return;
      }

      const state = { frame: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      // duration:1 is load-bearing. Without it GSAP applies its default of 0.5,
      // the timeline becomes 0.87 long, and every position below stops being a
      // fraction of the scroll — the footage would finish at 57% and the logo
      // would not arrive until 83%. Pinning this to 1 makes the timeline exactly
      // one unit long, so LOGO_IN et al. are true scroll fractions.
      tl.to(
        state,
        {
          frame: Math.max(count - 1, 0),
          duration: 1,
          ease: "none",
          onUpdate: () => draw(Math.round(state.frame)),
        },
        0,
      );

      // The opening line clears as the lamp comes up.
      tl.to(introRef.current, { autoAlpha: 0, duration: 0.08 }, 0.06);

      // The bike has cleared the frame by ~0.75. As the smoke thins, the mark
      // resolves out of it — scaled up and blurred, settling to rest.
      tl.fromTo(
        wordRef.current,
        { autoAlpha: 0, scale: 1.09, y: 18, filter: "blur(16px)" },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: LOGO_DUR,
          ease: "power2.out",
        },
        LOGO_IN,
      );

      tl.fromTo(
        ctaRef.current,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: CTA_DUR, ease: "power2.out" },
        CTA_IN,
      );

      // Put the opening frame on screen immediately, then let ScrollTrigger
      // take over — so the very first scroll moves the sequence rather than
      // starting it.
      draw(0);
      ScrollTrigger.refresh();

      const onResize = () => {
        painted.current = -1;
        draw(Math.round(state.frame));
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { scope: wrapRef, dependencies: [ready, reduced] },
  );

  return (
    <section
      ref={wrapRef}
      className="relative bg-black"
      style={reduced ? undefined : { height: SCROLL_HEIGHT }}
      aria-label={`${SITE.name} introduction`}
    >
      {/* Pure black, not bg-ink (#141414): the frames carry black borders,
          and on a portrait phone the fitted frame would otherwise read as a
          visibly-edged video box sitting on a lighter stage. */}
      <div className="sticky top-0 grid h-svh place-items-center overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        />

        {/* Scrim — keeps white type legible over the lit floor pool. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,10,0.55)_0%,transparent_28%,transparent_52%,rgba(10,10,10,0.72)_100%)]"
        />

        {/* Opening line — visible the moment the page loads. */}
        <div
          ref={introRef}
          className="absolute inset-x-0 bottom-12 z-10 flex flex-col items-center gap-3 px-5"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            {SITE.name} · {SITE.city}
          </p>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Scroll
          </span>
          <span
            aria-hidden
            className="h-9 w-px animate-pulse bg-gradient-to-b from-red to-transparent"
          />
        </div>

        {/* The reveal. Lands on the empty stage and stays for good.

            The logo wordmark carries the visual weight, but a screen reader
            or a crawler needs actual words to know what this page is about —
            not just a brand name, but brand + place + what's sold here. The
            sr-only span supplies that; the image goes alt="" (decorative)
            underneath it so the h1's text isn't announced twice. */}
        <h1
          ref={wordRef}
          className="relative z-10 w-[min(82vw,54rem)] px-5"
          style={reduced ? undefined : { opacity: 0 }}
        >
          <span className="sr-only">
            {SITE.name} — {SITE.tagline}
          </span>
          <Image
            src="/brand/racedynamics.webp"
            alt=""
            width={1800}
            height={477}
            priority
            unoptimized
            className="h-auto w-full"
          />
        </h1>

        <div
          ref={ctaRef}
          className="absolute inset-x-0 bottom-14 z-10 flex flex-col items-center gap-5 px-5"
          style={reduced ? undefined : { opacity: 0 }}
        >
          <p className="max-w-[40ch] text-center text-[15px] text-white/75">
            {SITE.tagline}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/inventory" className="btn-red hover:bg-red-dark">
              Browse collection
            </Link>
            <Link
              href="/sell"
              className="btn-dark border border-white/25 hover:bg-white hover:text-ink"
            >
              Sell us
            </Link>
          </div>
        </div>

        {ready === false && (
          <p className="absolute bottom-28 left-1/2 z-10 -translate-x-1/2 text-[11px] uppercase tracking-[0.2em] text-white/40">
            Frame sequence missing
          </p>
        )}
      </div>
    </section>
  );
}
