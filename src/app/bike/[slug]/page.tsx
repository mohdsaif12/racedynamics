import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NextImage from "next/image";
import { getAllBikes, getBikeBySlug } from "@/lib/data/bikes";
import { getCategories } from "@/lib/data/categories";
import { getSiteSettings } from "@/lib/data/settings";
import { telLink, whatsappLink } from "@/lib/data/links";
import { formatKm, formatPrice, STATUS_CLASS, STATUS_LABEL } from "@/lib/format";
import { SITE } from "@/lib/site";
import { BikeJsonLd } from "@/components/JsonLd";

/** Every bike's slug, so each one gets its own real, indexable URL. */
export async function generateStaticParams() {
  const bikes = await getAllBikes();
  return bikes.map((b) => ({ slug: b.slug }));
}

/**
 * New bikes (or edits) show up without a redeploy: the static params above
 * are only a warm cache. `revalidate` refreshes it in the background, and
 * the sold-toggle Server Action in /admin calls `revalidatePath` for an
 * instant update on top of that.
 */
export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/bike/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const bike = await getBikeBySlug(slug);
  if (!bike) return {};

  const title = `${bike.brand} ${bike.fullName} (${bike.year})`;
  const description = `${bike.year} ${bike.brand} ${bike.fullName}, ${formatKm(bike.km)}, ${bike.location}. ${formatPrice(bike.priceINR)} at ${SITE.name}, ${SITE.city}.`;

  return {
    title,
    description,
    alternates: { canonical: `/bike/${bike.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/bike/${bike.slug}`,
      // The bike's own cover photo, so a shared link previews the machine
      // rather than the generic brand card.
      images: bike.image ? [{ url: bike.image, alt: title }] : undefined,
    },
  };
}

export default async function BikePage({ params }: PageProps<"/bike/[slug]">) {
  const { slug } = await params;

  const [bike, categories, settings] = await Promise.all([
    getBikeBySlug(slug),
    getCategories(),
    getSiteSettings(),
  ]);
  if (!bike) notFound();

  const category = categories.find((c) => c.slug === bike.category);

  return (
    <article className="mx-auto max-w-[1400px] px-5 py-10 lg:px-10">
      <BikeJsonLd bike={bike} />
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate"
      >
        <Link href="/inventory" className="hover:text-red">
          Inventory
        </Link>
        <span aria-hidden>›</span>
        <Link
          href={`/inventory?category=${bike.category}`}
          className="hover:text-red"
        >
          {category?.name}
        </Link>
        <span aria-hidden>›</span>
        <span className="text-graphite">{bike.fullName}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-mist">
          {bike.image && (
            <NextImage
              src={bike.image}
              alt={`${bike.brand} ${bike.fullName}`}
              width={1400}
              height={900}
              priority
              className="h-auto w-[88%]"
            />
          )}
        </div>

        <div>
          <p className="eyebrow text-slate">{bike.brand}</p>
          <h1 className="display mt-2 text-[clamp(2rem,5vw,3.25rem)] text-graphite">
            {bike.fullName}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span className="figure-nums display text-[2rem] text-graphite">
              {formatPrice(bike.priceINR)}
            </span>
            <span
              className={`eyebrow rounded-full border px-3 py-1 ${STATUS_CLASS[bike.status]}`}
            >
              {STATUS_LABEL[bike.status]}
            </span>
          </div>

          <dl className="mt-8 grid grid-cols-3 border-y border-line py-5 text-center">
            <SpecCell label="Reg. Year" value={String(bike.year)} />
            <SpecCell
              label="Kms."
              value={bike.km.toLocaleString("en-IN")}
              divider
            />
            <SpecCell label="Reg. State" value={bike.location} />
          </dl>

          <dl className="mt-6">
            <SpecRow label="Engine" value={`${bike.engineCc} cc`} />
            <SpecRow label="Category" value={category?.name ?? "—"} />
            {/* Whatever the owner added for this bike in the dashboard —
                owners, services, insurance — listed after the fixed specs. */}
            {bike.extraSpecs.map((spec) => (
              <SpecRow key={spec.label} label={spec.label} value={spec.value} />
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappLink(settings, `${bike.brand} ${bike.fullName} (${bike.year})`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-red hover:bg-red-dark"
            >
              Enquire on WhatsApp
            </a>
            <a href={telLink(settings)} className="btn-dark hover:bg-graphite">
              Call {SITE.city}
            </a>
          </div>
        </div>
      </div>
    </article>
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
      <dd className="figure-nums mt-1 text-[15px] font-bold uppercase text-graphite">
        {value}
      </dd>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3">
      <dt className="eyebrow text-slate">{label}</dt>
      <dd className="figure-nums text-[15px] font-semibold text-graphite">
        {value}
      </dd>
    </div>
  );
}
