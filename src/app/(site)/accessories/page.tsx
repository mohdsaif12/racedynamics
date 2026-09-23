import type { Metadata } from "next";
import Image from "next/image";
import { getAllAccessories } from "@/lib/data/accessories";
import { getSiteSettings } from "@/lib/data/settings";
import { whatsappLink } from "@/lib/data/links";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessories",
  description: `Riding gear and bike accessories from ${SITE.name}, ${SITE.city} — helmets, riding jackets, gloves and more.`,
};

export default async function AccessoriesPage() {
  const [accessories, settings] = await Promise.all([
    getAllAccessories(),
    getSiteSettings(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
      <h1 className="display text-[clamp(2.25rem,6vw,4rem)] text-graphite">
        Accessories
      </h1>
      <p className="mt-4 max-w-[52ch] text-[17px] text-body">
        Riding gear and genuine accessories, in stock at the showroom. Message
        us on WhatsApp to check size and availability.
      </p>

      {accessories.length === 0 ? (
        <p className="mt-14 text-sm text-slate">
          Nothing listed yet — check back soon, or ask us on WhatsApp about
          what&rsquo;s in stock.
        </p>
      ) : (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {accessories.map((a) => {
            const outOfStock = a.status === "out-of-stock";
            return (
              <li
                key={a.id}
                className={`group rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-lg ${
                  outOfStock ? "opacity-60" : ""
                }`}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-mist">
                  {a.image ? (
                    <Image
                      src={a.image}
                      alt={a.name}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-[12px] text-slate">
                      No photo
                    </div>
                  )}
                  {outOfStock && (
                    <span className="absolute left-2 top-2 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Out of stock
                    </span>
                  )}
                </div>

                <h2 className="mt-3 text-[15px] font-bold text-graphite">{a.name}</h2>
                {a.description && (
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate">
                    {a.description}
                  </p>
                )}
                <p className="mt-2 text-[14px] font-bold text-graphite">
                  {formatPrice(a.priceINR)}
                </p>

                <a
                  href={whatsappLink(settings, a.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={outOfStock}
                  className={`mt-3 block rounded-full py-2.5 text-center text-[13px] font-bold uppercase tracking-wide transition-colors ${
                    outOfStock
                      ? "pointer-events-none bg-mist text-slate"
                      : "bg-red text-white hover:bg-red-dark"
                  }`}
                >
                  {outOfStock ? "Notify me" : "Enquire on WhatsApp"}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
