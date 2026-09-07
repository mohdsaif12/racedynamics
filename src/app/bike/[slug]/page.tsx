import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NextImage from "next/image";
import { BIKES, getBike, getCategory } from "@/lib/inventory";
import { formatKm, formatPrice, STATUS_CLASS, STATUS_LABEL } from "@/lib/format";
import { SITE, telLink, whatsappLink } from "@/lib/site";

export function generateStaticParams() {
  return BIKES.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/bike/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const bike = getBike(slug);
  if (!bike) return {};

  return {
    title: `${bike.brand} ${bike.fullName} (${bike.year})`,
    description: `${bike.year} ${bike.brand} ${bike.fullName}, ${formatKm(bike.km)}, ${bike.location}. ${formatPrice(bike.priceINR)} at ${SITE.name}, ${SITE.city}.`,
  };
}

export default async function BikePage({ params }: PageProps<"/bike/[slug]">) {
  const { slug } = await params;
  const bike = getBike(slug);
  if (!bike) notFound();

  const category = getCategory(bike.category);

  return (
    <article className="mx-auto max-w-[1400px] px-5 py-10 lg:px-10">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate"
      >
        <Link href="/inventory" className="hover:text-red">
          Inventory
        </Link>
        <span aria-hidden>›</span>
        <Link href={`/inventory/${bike.category}`} className="hover:text-red">
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
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappLink(`${bike.brand} ${bike.fullName} (${bike.year})`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-red hover:bg-red-dark"
            >
              Enquire on WhatsApp
            </a>
            <a href={telLink()} className="btn-dark hover:bg-graphite">
              Call {SITE.city}
            </a>
          </div>

          <p className="mt-6 max-w-[52ch] text-[14px] text-slate">
            Ownership history, service records and finance estimates land here in
            Phase 5, once the CMS schema is in place.
          </p>
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
