import Link from "next/link";
import RevealGroup from "@/components/Reveal";
import { SITE, mapEmbedSrc } from "@/lib/site";
import type { SiteSettings } from "@/lib/data/types";
import {
  PinIcon, MailIcon, PhoneIcon,
  InstagramIcon, FacebookIcon, YoutubeIcon,
} from "@/components/icons";

const SOCIALS = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "youtube", label: "YouTube", Icon: YoutubeIcon },
] as const;

/** Three-column dark footer: quick links, contact details, and the map. */
export default function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-auto bg-ink pb-16 pt-16 sm:pb-0">
      <RevealGroup
        selector=":scope > *"
        y={14}
        stagger={0.08}
        duration={0.45}
        className="mx-auto grid max-w-[1400px] gap-12 px-5 lg:grid-cols-3 lg:px-10"
      >
        <nav aria-label="Quick links">
          <h2 className="display text-xl text-white">Quick links</h2>
          <ul className="mt-5 flex flex-col gap-2.5">
            {[
              { href: "/", label: "Home" },
              { href: "/about", label: "About us" },
              { href: "/inventory", label: "Inventory" },
              { href: "/sell", label: "Sell us" },
              { href: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[14.5px] text-ash transition-colors hover:text-red"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="display text-xl text-white">Contact info</h2>
          <address className="mt-5 flex flex-col gap-3.5 text-[14.5px] not-italic leading-relaxed text-ash">
            <span className="flex items-start gap-3">
              <PinIcon size={17} className="mt-0.5 shrink-0 text-red" />
              {settings.address}
            </span>
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-3 transition-colors hover:text-red"
            >
              <MailIcon size={17} className="shrink-0 text-red" />
              {settings.email}
            </a>
            <a
              href={`tel:${settings.phonePrimary}`}
              className="flex items-center gap-3 transition-colors hover:text-red"
            >
              <PhoneIcon size={17} className="shrink-0 text-red" />
              <span className="figure-nums">{settings.phonePrimary}</span>
            </a>
            <a
              href={`tel:${settings.phoneSecondary}`}
              className="flex items-center gap-3 transition-colors hover:text-red"
            >
              {/* One phone icon in the column is enough to label the pair;
                  repeating it would read as a second, different channel. */}
              <span aria-hidden className="w-[17px] shrink-0" />
              <span className="figure-nums">{settings.phoneSecondary}</span>
            </a>
          </address>

          <div className="mt-7 flex gap-3">
            {SOCIALS.map(({ key, label, Icon }) => {
              const href = settings.social[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center border border-line-dark text-ash transition-colors duration-200 hover:border-red hover:bg-red hover:text-white"
                >
                  <Icon size={17} />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="display text-xl text-white">Find us</h2>
          <div className="mt-5 overflow-hidden border border-line-dark">
            <iframe
              title={`Map to ${SITE.name}, ${SITE.city}`}
              src={mapEmbedSrc()}
              // The footer is on every page, so this would otherwise mean a
              // third-party frame loading on every single view. Lazy defers
              // it until someone actually scrolls to the bottom.
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[220px] w-full grayscale-[0.4] transition-[filter] duration-300 hover:grayscale-0"
            />
          </div>
          <a
            href={SITE.maps.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-[13.5px] font-semibold text-red transition-colors hover:text-white"
          >
            <PinIcon size={15} />
            Get directions
          </a>
        </div>
      </RevealGroup>

      <div className="mx-auto mt-14 flex max-w-[1400px] flex-wrap items-center justify-between gap-3 border-t border-line-dark px-5 py-5 lg:px-10">
        <p className="text-[12.5px] text-slate">
          © {new Date().getFullYear()} {SITE.name}, {SITE.city}. All rights
          reserved.
        </p>
        <Link
          href="/privacy"
          className="text-[12.5px] text-slate transition-colors hover:text-red"
        >
          Privacy policy
        </Link>
      </div>
    </footer>
  );
}
