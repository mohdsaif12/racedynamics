import Link from "next/link";
import RevealGroup from "@/components/Reveal";
import { CATEGORIES } from "@/lib/inventory";
import { SITE } from "@/lib/site";

/** Four-column dark footer, as on the reference site. */
export default function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink pb-16 pt-16 sm:pb-0">
      <RevealGroup
        selector=":scope > *"
        y={14}
        stagger={0.08}
        duration={0.45}
        className="mx-auto grid max-w-[1400px] gap-12 px-5 lg:grid-cols-4 lg:px-10"
      >
        <div>
          <h2 className="display text-xl text-white">About us</h2>
          <p className="mt-5 max-w-[38ch] text-[14.5px] leading-[1.85] text-ash">
            A complete solution to owning your dream superbike, cruiser,
            adventure or classic — bought, inspected and delivered by{" "}
            {SITE.name} in {SITE.city}.
          </p>
          <Link
            href="/about"
            className="mt-5 inline-block text-[13px] font-bold uppercase tracking-[0.14em] text-red hover:text-white"
          >
            Read more
          </Link>
        </div>

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

        <nav aria-label="Categories">
          <h2 className="display text-xl text-white">Categories</h2>
          <ul className="mt-5 flex flex-col gap-2.5">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/inventory/${c.slug}`}
                  className="text-[14.5px] text-ash transition-colors hover:text-red"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="display text-xl text-white">Contact info</h2>
          <address className="mt-5 flex flex-col gap-3 text-[14.5px] not-italic leading-relaxed text-ash">
            <span>{SITE.address}</span>
            <a
              href={`mailto:${SITE.email}`}
              className="transition-colors hover:text-red"
            >
              {SITE.email}
            </a>
            <a
              href={`tel:${SITE.phonePrimary}`}
              className="figure-nums transition-colors hover:text-red"
            >
              {SITE.phonePrimary}
            </a>
            <a
              href={`tel:${SITE.phoneSecondary}`}
              className="figure-nums transition-colors hover:text-red"
            >
              {SITE.phoneSecondary}
            </a>
          </address>
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
