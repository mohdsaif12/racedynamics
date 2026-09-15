import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data/settings";
import { telLink, whatsappLink } from "@/lib/data/links";
import { SITE, mapEmbedSrc } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Visit ${SITE.name} in ${SITE.city}, or reach us on WhatsApp and phone.`,
};

/** No animation on this route by design — people arrive here with intent. */
export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
      <h1 className="display text-[clamp(2.25rem,6vw,4rem)] text-graphite">
        Contact
      </h1>

      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <section>
          <h2 className="eyebrow text-slate">Showroom</h2>
          <address className="mt-3 text-sm not-italic text-body">
            {settings.address}
          </address>
        </section>

        <section>
          <h2 className="eyebrow text-slate">Phone</h2>
          <p className="figure-nums mt-3 flex flex-col gap-1 text-sm text-body">
            <a href={telLink(settings, settings.phonePrimary)} className="hover:text-graphite">
              {settings.phonePrimary}
            </a>
            {Boolean(settings.phoneSecondary) && (
              <a href={telLink(settings, settings.phoneSecondary)} className="hover:text-graphite">
                {settings.phoneSecondary}
              </a>
            )}
          </p>
        </section>

        <section>
          <h2 className="eyebrow text-slate">Hours</h2>
          <p className="mt-3 text-sm text-body">
            Monday to Saturday, 10:00 – 19:30
            <br />
            Sunday by appointment
          </p>
        </section>

        <section>
          <h2 className="eyebrow text-slate">Email</h2>
          <p className="mt-3 text-sm text-body">
            <a href={`mailto:${settings.email}`} className="hover:text-graphite">
              {settings.email}
            </a>
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-2">
        <a
          href={whatsappLink(settings)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-red hover:bg-red-dark"
        >
          WhatsApp
        </a>
        <a
          href={telLink(settings)}
          className="btn-dark hover:bg-graphite"
        >
          Call now
        </a>
      </div>

      <div className="mt-12 overflow-hidden border border-line">
        <iframe
          title={`Map to ${SITE.name}, ${SITE.city}`}
          // Was pointing at the city, which dropped a pin in the middle of
          // Lucknow rather than at the shop.
          src={mapEmbedSrc()}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[380px] w-full grayscale-[0.35]"
        />
      </div>
    </div>
  );
}
