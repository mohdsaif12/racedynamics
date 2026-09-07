import type { Metadata } from "next";
import NextImage from "next/image";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Who ${SITE.name} are, where we work, and how every bike is inspected before it goes on sale.`,
};

/** Skeleton — real story, premises and team photography pending (§08). */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
      <h1 className="display text-[clamp(2.25rem,6vw,4rem)] text-graphite">
        The workshop
      </h1>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="relative aspect-[4/3] overflow-hidden border border-line">
          <NextImage
            src="/about/workshop.webp"
            alt={`Inside the ${SITE.name} workshop`}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex max-w-[62ch] flex-col gap-5 text-[16px] leading-relaxed text-body">
          <p>
            {SITE.name} works out of a single bay in {SITE.city}, buying and
            selling pre-owned superbikes across North India.
          </p>
          <p>
            Every machine is inspected before it is listed: compression checked,
            forks and linkages inspected, consumables assessed, and the service
            history traced where it exists — stated plainly where it
            doesn&rsquo;t. What a bike needs is on the listing, not discovered
            afterwards.
          </p>
        </div>
      </div>
    </div>
  );
}
