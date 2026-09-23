import Link from "next/link";
import NextImage from "next/image";
import CountUp from "@/components/CountUp";
import MaskReveal from "@/components/MaskReveal";
import RevealGroup from "@/components/Reveal";
import TextReveal from "@/components/TextReveal";
import ImageReveal from "@/components/ImageReveal";
import ScaleReveal from "@/components/ScaleReveal";
import Parallax from "@/components/Parallax";
import EngineeringPanel from "@/components/home/EngineeringPanel";
import { formatPrice, STATUS_LABEL } from "@/lib/format";
import { SITE } from "@/lib/site";
import type { Bike, Category, SiteContentBlock } from "@/lib/data/types";
import {
  RupeeNoteIcon, SoldBadgeIcon, PriceTagIcon, PaperworkIcon,
  ChecklistIcon, CompareIcon, SpecsIcon,
} from "@/components/icons";

/* Homepage sections, matched to the reference site the client picked. Data
   (bikes/categories/counts) is fetched once in app/page.tsx and passed down
   as props — these are otherwise plain presentational Server Components. */

const WRAP = "mx-auto max-w-[1400px] px-5 lg:px-10";

/* ------------------------------------------------- Planning to sell? ----- */
function valueProps(bikeCount: number) {
  return [
    { top: "Outright", bottom: "Sale", icon: <RupeeNoteIcon size={30} /> },
    {
      top: <CountUp to={bikeCount} suffix="+" />,
      bottom: "Bikes Sold",
      icon: <SoldBadgeIcon size={30} />,
    },
    { top: "Best", bottom: "Offer", icon: <PriceTagIcon size={30} /> },
    {
      top: "Hassle Free",
      bottom: "Processing",
      icon: <PaperworkIcon size={30} />,
    },
  ];
}

/** The section's own default — the same cut-out shot it shipped with,
 *  before this image was (accidentally) wired to whichever bike happened to
 *  be first in stock. Used whenever no one has uploaded a replacement from
 *  /admin/content yet. */
const DEFAULT_SELL_IMAGE = "/bikes/diavel-1260s-2021.webp";

export function PlanningToSell({
  bikes,
  content,
}: {
  bikes: Bike[];
  /** Standalone content block — independent of inventory on purpose, see
   *  DEFAULT_SELL_IMAGE above. */
  content: SiteContentBlock | null;
}) {
  const image = content?.image ?? DEFAULT_SELL_IMAGE;
  const heading = content?.heading || "Planning to sell?";
  const subheading = content?.subheading || "Sell us your bike";

  return (
    <section className="bg-paper py-20 lg:py-28">
      <div className={`${WRAP} grid items-center gap-14 lg:grid-cols-2`}>
        <div>
          <MaskReveal as="h2" className="display text-[clamp(2.25rem,5.5vw,3.75rem)] text-graphite">
            {heading}
          </MaskReveal>
          <TextReveal as="p" delay={0.08} className="mt-2 text-[15px] font-semibold uppercase tracking-[0.1em] text-slate">
            {subheading}
          </TextReveal>

          <RevealGroup selector="li">
          <ul className="mt-10 grid gap-7 sm:grid-cols-2">
            {valueProps(bikes.length).map((v) => (
              <li key={v.bottom} className="flex items-center gap-4">
                <span className="grid size-[74px] shrink-0 place-items-center border border-line text-red transition-colors duration-200 group-hover:border-red">
                  {v.icon}
                </span>
                <span className="leading-tight">
                  <span className="block text-[15px] text-slate">{v.top}</span>
                  <span className="block text-[15px] font-bold text-graphite">
                    {v.bottom}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          </RevealGroup>

          <Link href="/sell" className="btn-red mt-10 hover:bg-red-dark">
            Get a quote
          </Link>
        </div>

        <ImageReveal className="relative grid min-h-72 place-items-center">
          <NextImage
            src={image}
            alt={heading}
            width={1400}
            height={900}
            className="h-auto w-[92%]"
          />
        </ImageReveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------- Browse the database --- */
function dbPoints(bikeCount: number) {
  return [
    { text: "Full inspection report on every bike.", icon: <ChecklistIcon size={32} /> },
    { text: "Compare any two machines side by side.", icon: <CompareIcon size={32} /> },
    {
      text: `More than ${bikeCount} superbikes and their in-depth specifications.`,
      icon: <SpecsIcon size={32} />,
    },
  ];
}

export function BrowseDatabase({ bikeCount }: { bikeCount: number }) {
  return (
    <section className="bg-mist py-16 lg:py-24">
      <div className={WRAP}>
        <MaskReveal as="h2" className="display mx-auto max-w-[22ch] text-center text-[clamp(1.85rem,4.6vw,3.25rem)] text-red">
          Browse {SITE.name}&rsquo;s database of{" "}
          <span className="text-graphite">pre-owned superbikes</span> in India
        </MaskReveal>

        <EngineeringPanel points={dbPoints(bikeCount)} />

        <TextReveal className="mt-10 text-center">
          <Link
            href="/inventory"
            className="text-[15px] font-bold uppercase tracking-[0.14em] text-red underline underline-offset-8 hover:text-red-dark"
          >
            Explore more
          </Link>
        </TextReveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------- Tilted photo strip --- */
export function TiltedStrip({ bikes }: { bikes: Bike[] }) {
  const strip = bikes.filter((b) => b.image).slice(0, 5);

  return (
    <section className="overflow-hidden bg-paper py-14 lg:py-20">
      <Parallax distance={34}>
      <RevealGroup selector="li" stagger={0.08} y={40}>
        <ul className={`${WRAP} flex items-center justify-center gap-5`}>
          {strip.map((b, i) => (
            <li
              key={b.slug}
              className="grid aspect-[3/5] w-1/5 max-w-56 place-items-center overflow-hidden bg-mist shadow-sm"
              style={{ transform: `rotate(-8deg) translateY(${i % 2 ? 34 : 0}px)` }}
            >
              {b.image && (
                <NextImage
                  src={b.image}
                  alt={`${b.brand} ${b.fullName}`}
                  width={1400}
                  height={900}
                  className="h-auto w-[165%] max-w-none"
                />
              )}
            </li>
          ))}
        </ul>
      </RevealGroup>
      </Parallax>
    </section>
  );
}

/* ------------------------------------------------- Browse by category ---- */
/** One representative photo per category, used only when the category has
 *  no admin-uploaded tile of its own — same fallback role as
 *  DEFAULT_SELL_IMAGE above, and to the same bug: this used to be a bike's
 *  own photo, picked at random from whichever bike in that category
 *  happened to have one, so it changed under a category's feet every time
 *  stock changed. */
const DEFAULT_CATEGORY_PHOTO: Record<string, string> = {
  sport: "/bikes/panigale-v4.webp",
  cruiser: "/bikes/fatbob-114-2022.webp",
  adventure: "/bikes/r1300gs-adventure-2025.webp",
  touring: "/bikes/k1600gt-2019.webp",
  roadster: "/bikes/z900.webp",
  classic: "/bikes/bonneville-t120-2018.webp",
};

export function BrowseByCategory({
  categories,
  bikes,
}: {
  categories: Category[];
  bikes: Bike[];
}) {
  const counts = categories.map((c) => ({
    ...c,
    count: bikes.filter((b) => b.category === c.slug).length,
    photo: c.image ?? DEFAULT_CATEGORY_PHOTO[c.slug],
  }));

  return (
    <section className="bg-ink-2 py-16">
      <div className={WRAP}>
        <MaskReveal as="h2" className="display text-center text-[clamp(1.85rem,4.6vw,3.25rem)] text-chalk">
          Browse by category
        </MaskReveal>

        <RevealGroup selector="li">
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {counts.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/inventory?category=${c.slug}`}
                className="group flex flex-col items-center gap-4"
              >
                <span className="grid aspect-square w-full max-w-[168px] place-items-center overflow-hidden rounded-full bg-white transition-transform duration-200 ease-out group-hover:scale-[1.03]">
                  {c.photo && (
                    <NextImage
                      src={c.photo}
                      alt={c.name}
                      width={1400}
                      height={900}
                      className="h-auto w-[84%]"
                    />
                  )}
                </span>
                <span className="text-center">
                  <span className="block text-[15px] font-bold uppercase tracking-[0.12em] text-white transition-colors group-hover:text-red">
                    {c.name}
                  </span>
                  <span className="figure-nums mt-1 block text-[12px] text-ash">
                    {c.count} {c.count === 1 ? "bike" : "bikes"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        </RevealGroup>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Trust band --- */
export function TrustBand({ content }: { content: SiteContentBlock | null }) {
  const heading = content?.heading || "Trust us to deliver excellence with every purchase";
  const subheading = content?.subheading || `Buy your dream bike with ${SITE.name} confidence`;

  return (
    <section className="relative overflow-hidden bg-paper py-16">
      <span
        aria-hidden
        className="ghost-word absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap text-[clamp(4rem,15vw,12rem)]"
      >
        Ride Along
      </span>
      <RedSwoosh />

      <div className={`${WRAP} relative text-center`}>
        <ScaleReveal as="h2" className="display mx-auto max-w-[20ch] text-center text-[clamp(1.85rem,4.6vw,3.25rem)] text-graphite">
          {heading}
        </ScaleReveal>
        <TextReveal as="p" delay={0.14} className="mt-4 text-[15px] text-slate">
          {subheading}
        </TextReveal>
        <TextReveal delay={0.26} className="mt-9">
          <Link href="/inventory" className="btn-red hover:bg-red-dark">
            View complete inventory
          </Link>
        </TextReveal>
      </div>
    </section>
  );
}

function RedSwoosh() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 300"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-1/2 h-64 w-full -translate-y-1/2 opacity-70"
      fill="none"
    >
      {[0, 9, 18, 27].map((o) => (
        <path
          key={o}
          d={`M-40 ${150 + o} C 300 ${40 + o}, 560 ${250 + o}, 900 ${140 + o} S 1320 ${30 + o}, 1480 ${110 + o}`}
          stroke="#D50D2E"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
      ))}
    </svg>
  );
}

/** Card layout lifted from the reference: photo, price, model, 3-up spec row. */
export function BikeCard({ bike }: { bike: Bike }) {
  const sold = bike.status === "booked" || bike.status === "sold";

  return (
    <Link
      href={`/bike/${bike.slug}`}
      className="group flex h-full flex-col bg-paper shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-transparent transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-[0_8px_28px_rgba(0,0,0,0.14)] hover:ring-line"
    >
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-mist">
        {bike.image && (
          <NextImage
            src={bike.image}
            alt={`${bike.brand} ${bike.fullName}`}
            width={1400}
            height={900}
            className="h-auto w-[90%] transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        )}
        {sold && (
          <span className="absolute right-0 top-4 bg-ink px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            {STATUS_LABEL[bike.status]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="figure-nums text-[19px] font-bold text-graphite">
          {sold ? STATUS_LABEL[bike.status] : formatPrice(bike.priceINR)}
        </p>
        <h3 className="mt-2 text-[16px] font-bold uppercase tracking-[0.04em] text-graphite">
          {bike.brand} {bike.fullName}
        </h3>

        <dl className="mt-5 grid grid-cols-3 border-t border-line pt-4 text-center">
          <SpecCell label="Reg. Year" value={String(bike.year)} />
          <SpecCell label="Kms." value={bike.km.toLocaleString("en-IN")} divider />
          <SpecCell label="Reg. State" value={bike.location} />
        </dl>
      </div>
    </Link>
  );
}

function SpecCell({
  label,
  value,
  divider = false,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <div className={divider ? "border-x border-line px-2" : "px-2"}>
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate">
        {label}
      </dt>
      <dd className="figure-nums mt-1 text-[14px] font-bold uppercase text-graphite">
        {value}
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------- About ---- */
const DEFAULT_ABOUT_IMAGE = "/about/workshop.webp";
const DEFAULT_ABOUT_BODY = `Since 2014, ${SITE.name} has grown from a motorcycle enthusiast’s dream into Lucknow’s leading destination for superbikes and premium pre-owned motorcycles, serving riders across India.

From iconic superbikes to riding gear, accessories, and Pan-India delivery, every machine is carefully evaluated on condition, history, and authenticity so you can buy with total confidence.`;

export function AboutBand({ content }: { content: SiteContentBlock | null }) {
  const heading = content?.heading || `About ${SITE.name}`;
  const image = content?.image ?? DEFAULT_ABOUT_IMAGE;
  const paragraphs = (content?.body || DEFAULT_ABOUT_BODY)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="bg-paper py-16">
      <div className={`${WRAP} grid items-center gap-14 lg:grid-cols-2`}>
        <Parallax distance={22}>
          <ImageReveal className="aspect-[4/3] overflow-hidden bg-mist">
            <NextImage
              src={image}
              alt={`Inside the ${SITE.name} showroom in ${SITE.city}`}
              width={1200}
              height={900}
              className="h-full w-full object-cover"
            />
          </ImageReveal>
        </Parallax>

        <div>
          <MaskReveal as="h2" className="display text-[clamp(1.85rem,4.6vw,3rem)] text-graphite">
            {heading}
          </MaskReveal>
          <TextReveal delay={0.1} className="mt-6 flex max-w-[58ch] flex-col gap-4 text-[15.5px] leading-[1.85] text-body">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </TextReveal>
          <p className="mt-8 font-display text-4xl italic tracking-wide text-graphite">
            {SITE.name}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Brands ---- */
/* Wordmarks are public-domain (simple type carries no copyright); they are
   still trademarks, shown here to say which marques this dealer actually
   handles. Provenance per file is in public/brands/CREDITS.json.

   Benelli has no motorcycle logo on Wikimedia Commons — only Benelli Armi,
   the unrelated firearms company — so it stays a wordmark until the client
   supplies the real one. The component handles that case rather than
   shipping the wrong company's mark. */
const BRANDS = [
  { name: "Ducati", logo: "/brands/ducati.svg" },
  { name: "BMW", logo: "/brands/bmw.svg" },
  { name: "Harley-Davidson", logo: "/brands/harley-davidson.svg" },
  { name: "Kawasaki", logo: "/brands/kawasaki.svg" },
  { name: "Triumph", logo: "/brands/triumph.svg" },
  { name: "Aprilia", logo: "/brands/aprilia.svg" },
  { name: "Indian", logo: "/brands/indian.svg" },
  { name: "Suzuki", logo: "/brands/suzuki.svg" },
  { name: "Benelli", logo: null },
] as const;

export function BrandStrip() {
  return (
    <section className="bg-mist py-14">
      <p className="mb-9 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">
        Marques we deal in
      </p>
      <RevealGroup selector="li" stagger={0.05} y={16} duration={0.45}>
      <ul
        className={`${WRAP} flex flex-wrap items-center justify-center gap-x-12 gap-y-9 lg:gap-x-16`}
      >
        {BRANDS.map((b) => (
          <li key={b.name} className="flex items-center">
            {b.logo ? (
              /* Grayscale at rest, true colour on hover. These marks disagree
                 wildly — Aprilia is a red panel, BMW a blue roundel, Suzuki
                 flat blue — and showing them raw makes a jumble. Muting them
                 to one tone is what turns nine logos into one row.

                 Bounded on BOTH axes because the aspect ratios run from
                 Ducati's 0.94:1 to Kawasaki's 5.6:1; capping height alone
                 would let the wide wordmarks dominate the row. */
              /* eslint-disable-next-line @next/next/no-img-element -- local
                 static SVGs of known size; next/image would need
                 dangerouslyAllowSVG turned on globally to serve them, and
                 there is nothing for it to optimise. */
              <img
                src={b.logo}
                alt={b.name}
                loading="lazy"
                decoding="async"
                className="h-8 w-auto max-w-[132px] object-contain opacity-55 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
              />
            ) : (
              <span className="display text-xl text-slate/70 transition-colors hover:text-graphite">
                {b.name}
              </span>
            )}
          </li>
        ))}
      </ul>
      </RevealGroup>
    </section>
  );
}

/* ------------------------------------------------------------- marks ---- */
