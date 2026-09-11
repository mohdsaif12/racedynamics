"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/lib/data/types";

const NAV = [
  { href: "/inventory", label: "Inventory" },
  { href: "/sell", label: "Sell Us" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** Dark bar, red wordmark, wide-tracked uppercase nav — as on the reference. */
export default function SiteHeader({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink">
      <div className="mx-auto flex max-w-[1400px] items-center gap-8 px-5 py-4 lg:px-10">
        <Link href="/" className="shrink-0" aria-label="RaceDynamics — home">
          <Image
            src="/brand/racedynamics.webp"
            alt="RaceDynamics"
            width={1200}
            height={400}
            priority
            unoptimized
            className="h-7 w-auto lg:h-8"
          />
        </Link>

        <nav className="mx-auto hidden items-center gap-9 lg:flex" aria-label="Main">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                    active ? "text-red" : "text-white hover:text-red"
                  }`}
                >
                  {item.label}
                </Link>

                {item.href === "/inventory" && (
                  <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-5 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <ul className="min-w-48 bg-ink-3 py-2 shadow-xl">
                      {categories.map((c) => (
                        <li key={c.slug}>
                          <Link
                            href={`/inventory?category=${c.slug}`}
                            className="block px-5 py-2.5 text-[13px] font-medium uppercase tracking-[0.12em] text-ash transition-colors hover:bg-red hover:text-white"
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Menu"
          className="ml-auto flex size-9 flex-col items-end justify-center gap-1.5 lg:ml-0"
        >
          <span className="block h-0.5 w-7 bg-white" />
          <span className="block h-0.5 w-7 bg-white" />
          <span className="block h-0.5 w-5 bg-white" />
        </button>
      </div>

      {open && (
        <nav className="border-t border-line-dark bg-ink px-5 pb-6 lg:px-10" aria-label="Menu">
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line-dark py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-5 text-slate">Categories</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/inventory?category=${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="block py-1 text-[13px] font-medium uppercase tracking-[0.1em] text-ash hover:text-red"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
