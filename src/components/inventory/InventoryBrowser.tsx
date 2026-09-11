"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import BikeArt from "@/components/BikeArt";
import { telLink, whatsappLink } from "@/lib/data/links";
import type { Bike, Category, SiteSettings } from "@/lib/data/types";
import {
  formatKm,
  formatPrice,
  pad,
  STATUS_CLASS_DARK,
  STATUS_LABEL,
} from "@/lib/format";
import { SITE } from "@/lib/site";

/**
 * The inventory, as a single full-bleed showcase panel.
 *
 * Colours are sampled straight off the reference: the stage is a smoky mid-grey
 * charcoal (#4A–#6B with a bright pool up and to the right), not a near-black.
 *
 * Layout follows the reference too — widely-spaced number rail down the left,
 * machine dominating the centre, ring-bulleted specification on the right,
 * social icons bottom-left, solid accent GO block flush into the bottom-right
 * corner. Added on top: the category row and the left/right arrows.
 *
 * Below the panel sits a detail band that tracks whichever machine is showing.
 *
 * `bikes`/`categories`/`settings` come from the live database (src/lib/data),
 * fetched once by src/app/inventory/page.tsx.
 */

const EASE_OUT = [0.33, 1, 0.68, 1] as const;
const ALL = "all";
/** Numbers visible in the rail at once, as in the reference. */
const RAIL = 4;

/**
 * The reference's accent is KTM orange #FA6E14. RACEDYNAMICS red is used here
 * instead because the logo carries red and every other page follows it —
 * swapping these four constants to orange is the whole change if wanted.
 */
const A_TEXT = "text-red";
const A_BG = "bg-red";
const A_BORDER = "border-red";
const A_HOVER_BG = "hover:bg-red-dark";

/** Sampled from the reference: bright pool up-right, falling off to the edges. */
const STAGE_BG =
  "radial-gradient(ellipse 125% 95% at 62% 32%, #6E6E6E 0%, #5C5C5C 42%, #4E4E4E 72%, #3E3E3E 100%)";

function matches(b: Bike, q: string) {
  if (!q) return true;
  const hay =
    `${b.brand} ${b.fullName} ${b.model} ${b.location} ${b.year} ${b.category}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((t) => hay.includes(t));
}

export default function InventoryBrowser({
  bikes,
  categories,
  settings,
  initialCategory,
  initialBike,
}: {
  bikes: Bike[];
  categories: Category[];
  settings: SiteSettings;
  initialCategory: string;
  initialBike?: string;
}) {
  const [cat, setCat] = useState(initialCategory);
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [index, setIndex] = useState(() => {
    if (!initialBike) return 0;
    const at = bikes
      .filter((b) => initialCategory === ALL || b.category === initialCategory)
      .findIndex((b) => b.slug === initialBike);
    return at > 0 ? at : 0;
  });
  const [dir, setDir] = useState<1 | -1>(1);
  const reduced = useReducedMotion() ?? false;
  const searchRef = useRef<HTMLInputElement>(null);
  const firstRun = useRef(true);

  const TABS = [{ slug: ALL, name: "All" }, ...categories];

  const list = bikes.filter(
    (b) => (cat === ALL || b.category === cat) && matches(b, q),
  );

  /* Clamped at read time rather than corrected by an effect. */
  const safe = list.length ? Math.min(index, list.length - 1) : 0;
  const bike = list[safe];

  /* images[0] is the cover — the cut-out that floats on the stage above. Only
     what the owner added beyond it belongs in the detail gallery, so a bike
     with a single photo shows no gallery at all rather than one repeated
     thumbnail. */
  const extras = bike?.images.slice(1) ?? [];

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (cat !== ALL) params.set("category", cat);
    if (bike) params.set("bike", bike.slug);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/inventory?${qs}` : "/inventory");
  }, [cat, bike]);

  const chooseCategory = (next: string) => {
    setDir(1);
    setCat(next);
    setIndex(0);
  };

  const step = (d: 1 | -1) => {
    if (list.length < 2) return;
    setDir(d);
    setIndex((i) => {
      const from = Math.min(i, list.length - 1);
      return (from + d + list.length) % list.length;
    });
  };

  /* A sliding window keeps the rail at four numbers however long the list is,
     which is what gives the reference its wide, calm spacing. */
  const start = Math.max(0, Math.min(safe - 1, list.length - RAIL));
  const window_ = list.slice(start, start + RAIL);

  const variants = {
    enter: (d: 1 | -1) => ({
      x: d > 0 ? "18%" : "-18%",
      scale: 0.94,
      opacity: 0,
      filter: "blur(10px)",
    }),
    center: { x: "0%", scale: 1, opacity: 1, filter: "blur(0px)" },
    exit: (d: 1 | -1) => ({
      x: d > 0 ? "-18%" : "18%",
      scale: 0.94,
      opacity: 0,
      filter: "blur(10px)",
    }),
  };
  const swap = { duration: reduced ? 0 : 0.55, ease: EASE_OUT };

  return (
    <>
      {/* ================================================= showcase panel === */}
      <section
        className="relative isolate flex min-h-[calc(100svh-68px)] flex-col overflow-hidden"
        style={{ background: STAGE_BG }}
      >
        {/* real smoke texture, desaturated and screened so it stays grey */}
        <NextImage
          src="/hero/desktop/frame_0192.webp"
          alt=""
          fill
          unoptimized
          priority
          aria-hidden
          className="pointer-events-none -z-10 object-cover opacity-30 grayscale mix-blend-screen"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(35,35,35,0.55)_100%)]"
        />

        {/* ------------------------------------------ categories + search */}
        <div className="relative flex items-center gap-4 px-5 py-6 lg:px-12">
          <Arrow dir="left" onClick={() => step(-1)} className="lg:hidden" />

          <nav
            aria-label="Categories"
            className="flex flex-1 justify-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((t) => {
              const on = t.slug === cat;
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => chooseCategory(t.slug)}
                  aria-pressed={on}
                  className={`shrink-0 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.16em] transition-colors duration-200 ${
                    on ? A_TEXT : "text-white/75 hover:text-white"
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <AnimatePresence initial={false}>
              {searchOpen && (
                <motion.input
                  key="search"
                  ref={searchRef}
                  initial={reduced ? false : { width: 0, opacity: 0 }}
                  animate={{ width: 190, opacity: 1 }}
                  exit={reduced ? undefined : { width: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE_OUT }}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setIndex(0);
                  }}
                  placeholder="Make, model, city"
                  aria-label="Search inventory"
                  className="border-b border-white/40 bg-transparent pb-1 text-[13px] text-white placeholder:text-white/50 focus:border-red focus:outline-none"
                />
              )}
            </AnimatePresence>

            <button
              type="button"
              aria-label={searchOpen ? "Close search" : "Search"}
              aria-expanded={searchOpen}
              onClick={() => {
                if (searchOpen && q) {
                  setQ("");
                  setIndex(0);
                }
                setSearchOpen((v) => !v);
                requestAnimationFrame(() => searchRef.current?.focus());
              }}
              className="grid size-9 shrink-0 place-items-center text-white/85 transition-colors hover:text-red"
            >
              {searchOpen ? <ClearIcon /> : <SearchIcon />}
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------- stage */}
        {bike ? (
          <div className="relative grid flex-1 grid-cols-[64px_minmax(0,1fr)] items-center lg:grid-cols-[130px_minmax(0,1fr)_230px]">
            <nav
              aria-label="Machine index"
              className="flex flex-col items-center gap-12 pl-2 lg:items-start lg:gap-16 lg:pl-10"
            >
              {window_.map((b, n) => {
                const i = start + n;
                const on = i === safe;
                return (
                  <button
                    key={b.slug}
                    type="button"
                    onClick={() => {
                      setDir(i > safe ? 1 : -1);
                      setIndex(i);
                    }}
                    aria-current={on ? "true" : undefined}
                    aria-label={`${b.brand} ${b.fullName}`}
                    className={`figure-nums text-[13px] font-bold tracking-[0.22em] transition-colors duration-200 ${
                      on ? A_TEXT : "text-white/55 hover:text-white/85"
                    }`}
                  >
                    {pad(i + 1)}
                  </button>
                );
              })}
            </nav>

            <div className="relative flex min-h-[42vh] touch-pan-y items-center justify-center px-2 py-6">
              <Arrow
                dir="left"
                onClick={() => step(-1)}
                className="absolute left-0 top-1/2 hidden -translate-y-1/2 lg:grid"
              />

              <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                <motion.div
                  key={bike.slug}
                  custom={dir}
                  variants={variants}
                  initial={reduced ? false : "enter"}
                  animate="center"
                  exit="exit"
                  transition={swap}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.16}
                  dragMomentum={false}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60 || info.velocity.x < -400) step(1);
                    else if (info.offset.x > 60 || info.velocity.x > 400) step(-1);
                  }}
                  className="w-[min(94%,44rem)] cursor-grab active:cursor-grabbing"
                >
                  {bike.image ? (
                    <NextImage
                      src={bike.image}
                      alt={`${bike.brand} ${bike.fullName}`}
                      width={1400}
                      height={900}
                      priority
                      className="h-auto w-full [filter:drop-shadow(0_34px_26px_rgba(0,0,0,0.5))]"
                    />
                  ) : (
                    <BikeArt tint={bike.tint} className="h-auto w-full" />
                  )}
                </motion.div>
              </AnimatePresence>

              <Arrow
                dir="right"
                onClick={() => step(1)}
                className="absolute right-0 top-1/2 hidden -translate-y-1/2 lg:grid"
              />
            </div>

            <dl className="hidden pr-10 lg:block">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={bike.slug}
                  initial={reduced ? false : { opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? undefined : { opacity: 0, x: -14 }}
                  transition={{ ...swap, delay: reduced ? 0 : 0.08 }}
                  className="flex flex-col gap-11"
                >
                  <SpecRow value={bike.fullName} label="Model" />
                  <SpecRow
                    value={categories.find((c) => c.slug === bike.category)?.name ?? "—"}
                    label="Category"
                  />
                  <SpecRow value={formatKm(bike.km)} label="Odometer" numeric />
                  <SpecRow value={String(bike.year)} label="Year" numeric />
                </motion.div>
              </AnimatePresence>
            </dl>
          </div>
        ) : (
          <div className="relative flex flex-1 items-center justify-center px-5 text-center">
            <div>
              <p className="display text-3xl text-white">Nothing matches</p>
              <p className="mt-2 text-[14px] text-white/70">
                No machines for “{q}”.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  chooseCategory(ALL);
                }}
                className={`mt-6 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors ${A_BG} ${A_HOVER_BG}`}
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------- socials + GO corner */}
        <div className="relative flex items-end justify-between">
          <div className="flex items-center gap-5 px-5 pb-7 lg:px-12">
            <Socials settings={settings} />
            {bike && (
              <span className="figure-nums ml-2 text-[11px] tracking-[0.18em] text-white/55">
                {pad(safe + 1)} / {pad(list.length)}
              </span>
            )}
          </div>

          {bike && (
            <div className="flex shrink-0 items-center gap-4 pb-0 pr-0">
              {/* The GO block alone didn't read as "there is more below" —
                  people took it for a decorative corner. */}
              <span className="hidden pb-7 text-right text-[11px] leading-relaxed tracking-[0.14em] text-white/45 sm:block">
                Scroll down for
                <br />
                full details
              </span>
              <a
                href="#details"
                className={`grid size-[76px] shrink-0 place-items-center text-[14px] font-bold uppercase tracking-[0.18em] text-white transition-colors duration-200 sm:size-[92px] ${A_BG} ${A_HOVER_BG}`}
              >
                Go
              </a>
            </div>
          )}
        </div>
      </section>

      {/* =================================================== detail band === */}
      {bike && (
        <section id="details" className="scroll-mt-[68px] bg-ink py-14 lg:py-16">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-12">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={bike.slug}
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: reduced ? 0 : 0.45, ease: EASE_OUT }}
                className={
                  extras.length > 0
                    ? "grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                    : "grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
                }
              >
                {/* identity */}
                <div>
                  <p className={`eyebrow ${A_TEXT}`}>{bike.brand}</p>
                  <h2 className="display mt-2 text-[clamp(1.9rem,4.4vw,3rem)] text-white">
                    {bike.fullName}
                  </h2>
                  <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-ash">
                    {categories.find((c) => c.slug === bike.category)?.blurb}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <span className="display text-[clamp(1.5rem,3vw,2.1rem)] text-white">
                      {formatPrice(bike.priceINR)}
                    </span>
                    <span
                      className={`eyebrow rounded-full border px-3 py-1 ${STATUS_CLASS_DARK[bike.status]}`}
                    >
                      {STATUS_LABEL[bike.status]}
                    </span>
                  </div>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href={whatsappLink(
                        settings,
                        `${bike.brand} ${bike.fullName} (${bike.year})`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors ${A_BG} ${A_HOVER_BG}`}
                    >
                      Enquire on WhatsApp
                    </a>
                    <a
                      href={telLink(settings)}
                      className="border border-white/25 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-ink"
                    >
                      Call {SITE.city}
                    </a>
                    <Link
                      href={`/bike/${bike.slug}`}
                      className="border border-white/25 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-ink"
                    >
                      Full page →
                    </Link>
                  </div>

                  {/* With no extra photos the spec grid keeps the right-hand
                      column to itself, exactly as before. Once the owner adds
                      photos they take that column and the specs sit under the
                      identity block instead. */}
                  {extras.length > 0 && (
                    <SpecGrid bike={bike} categories={categories} className="mt-10" />
                  )}
                </div>

                {extras.length > 0 ? (
                  <BikeGallery
                    photos={extras}
                    name={`${bike.brand} ${bike.fullName}`}
                  />
                ) : (
                  <SpecGrid bike={bike} categories={categories} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      )}
    </>
  );
}

function Cell({
  label,
  value,
  numeric = false,
}: {
  label: string;
  value: string;
  numeric?: boolean;
}) {
  return (
    <div className="bg-ink px-5 py-5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate">
        {label}
      </dt>
      <dd
        className={`mt-1.5 text-[15px] font-bold uppercase text-white ${
          numeric ? "figure-nums" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function SpecRow({
  value,
  label,
  numeric = false,
}: {
  value: string;
  label: string;
  numeric?: boolean;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span
        aria-hidden
        className={`mt-1.5 size-3 shrink-0 rounded-full border-2 ${A_BORDER}`}
      />
      <div>
        <dd
          className={`text-[17px] font-bold leading-tight text-white ${
            numeric ? "figure-nums" : ""
          }`}
        >
          {value}
        </dd>
        <dt className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/60">
          {label}
        </dt>
      </div>
    </div>
  );
}

function Arrow({
  dir,
  onClick,
  className = "",
}: {
  dir: "left" | "right";
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "left" ? "Previous machine" : "Next machine"}
      className={`z-10 grid size-11 shrink-0 place-items-center border border-white/30 text-white/85 transition-colors duration-200 hover:border-red hover:text-red ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={dir === "left" ? "M15 5L8 12l7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Socials({ settings }: { settings: SiteSettings }) {
  const items = [
    {
      label: "Facebook",
      href: settings.social.facebook,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.12-2.4-.12-2.38 0-4 1.45-4 4.11V9.9H7.6V13h2.7v8h3.2Z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: settings.social.instagram,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.2c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85C2.42 3.92 3.93 2.38 7.15 2.23 8.42 2.21 8.8 2.2 12 2.2Zm0 4.9a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8Zm0 8.08a3.18 3.18 0 1 1 0-6.36 3.18 3.18 0 0 1 0 6.36Zm5.09-8.27a1.14 1.14 0 1 0 0-2.29 1.14 1.14 0 0 0 0 2.29Z" />
        </svg>
      ),
    },
    {
      label: "YouTube",
      href: settings.social.youtube,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21.6 7.2s-.2-1.4-.8-2c-.75-.8-1.6-.8-2-.85C16 4.2 12 4.2 12 4.2h-.01s-4 0-6.8.2c-.4.05-1.25.05-2 .85-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.5v1.6c0 1.65.2 3.3.2 3.3s.2 1.4.8 2c.75.8 1.75.77 2.2.85 1.6.15 6.8.2 6.8.2s4 0 6.8-.21c.4-.05 1.25-.05 2-.85.6-.6.8-2 .8-2s.2-1.65.2-3.3v-1.6c0-1.65-.2-3.3-.2-3.3ZM9.95 14.5V8.9l5.15 2.81-5.15 2.79Z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {items.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="text-white/70 transition-colors hover:text-red"
        >
          {s.icon}
        </a>
      ))}
    </>
  );
}

function SpecGrid({
  bike,
  categories,
  className = "",
}: {
  bike: Bike;
  categories: Category[];
  className?: string;
}) {
  return (
    <dl
      className={`grid grid-cols-2 gap-px self-start border border-line-dark bg-line-dark sm:grid-cols-3 ${className}`}
    >
      <Cell label="Reg. Year" value={String(bike.year)} numeric />
      <Cell label="Odometer" value={formatKm(bike.km)} numeric />
      <Cell label="Engine" value={`${bike.engineCc} cc`} numeric />
      <Cell
        label="Category"
        value={categories.find((c) => c.slug === bike.category)?.name ?? "—"}
      />
      <Cell label="Reg. State" value={bike.location} />
      <Cell label="Status" value={STATUS_LABEL[bike.status]} />
      {/* Owner-defined rows continue the same grid, so six fixed specs plus
          three custom ones reads as one table rather than two.

          Guarded because this is the one field that can be absent from an
          otherwise-valid bike: a payload rendered before the column existed,
          or cached by a browser across a deploy that added it. Losing a few
          custom rows is nothing; taking the whole page down over them — which
          is exactly what happened — is not. */}
      {(bike.extraSpecs ?? []).map((spec) => (
        <Cell key={spec.label} label={spec.label} value={spec.value} />
      ))}
    </dl>
  );
}

/**
 * The owner's own photographs of a specific bike — the real thing, shot on a
 * forecourt, as opposed to the cut-out on the stage. One large lead image then
 * a thumbnail row, so a bike with two photos still looks deliberate rather
 * than like a grid with a hole in it.
 */
function BikeGallery({ photos, name }: { photos: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div className="self-start">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-3">
        <NextImage
          key={current}
          src={current}
          alt={`${name} — photograph ${Math.min(active, photos.length - 1) + 1}`}
          fill
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="object-cover"
        />
      </div>

      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photograph ${i + 1} of ${photos.length}`}
              aria-current={i === active}
              className={`relative aspect-square overflow-hidden bg-ink-3 transition-opacity duration-200 ${
                i === active ? "opacity-100" : "opacity-55 hover:opacity-85"
              }`}
            >
              <NextImage
                src={src}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
              {i === active && (
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 h-[3px] ${A_BG}`}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-white/40">
        {photos.length} owner photo{photos.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
