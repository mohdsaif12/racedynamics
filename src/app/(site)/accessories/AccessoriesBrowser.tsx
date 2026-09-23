"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { whatsappLink } from "@/lib/data/links";
import { formatPrice } from "@/lib/format";
import type { Accessory, SiteSettings } from "@/lib/data/types";

/** Search + category filter over the accessories grid. Client-side only —
 *  the whole catalogue is small enough that a round trip per keystroke
 *  would be slower than just filtering what's already on the page. */
export default function AccessoriesBrowser({
  accessories,
  settings,
}: {
  accessories: Accessory[];
  settings: SiteSettings;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set(accessories.map((a) => a.category).filter(Boolean));
    return Array.from(set).sort();
  }, [accessories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accessories.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    });
  }, [accessories, query, category]);

  if (accessories.length === 0) {
    return (
      <p className="mt-14 text-sm text-slate">
        Nothing listed yet — check back soon, or ask us on WhatsApp about
        what&rsquo;s in stock.
      </p>
    );
  }

  return (
    <>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search accessories…"
            aria-label="Search accessories"
            className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-4 text-[14.5px] text-graphite outline-none focus:border-red"
          />
        </div>

        {categories.length > 1 && (
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
            <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
              All
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-14 text-sm text-slate">
          Nothing matches &ldquo;{query}&rdquo;
          {category !== "all" ? ` in ${category}` : ""}. Try a different search.
        </p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((a) => (
            <AccessoryCard key={a.id} accessory={a} settings={settings} />
          ))}
        </ul>
      )}
    </>
  );
}

function AccessoryCard({ accessory: a, settings }: { accessory: Accessory; settings: SiteSettings }) {
  const outOfStock = a.status === "out-of-stock";

  return (
    <li
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
          <div className="grid h-full place-items-center text-[12px] text-slate">No photo</div>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
      </div>

      {a.category && (
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-red">
          {a.category}
        </p>
      )}
      <h2 className={`text-[15px] font-bold text-graphite ${a.category ? "mt-0.5" : "mt-3"}`}>
        {a.name}
      </h2>
      {a.description && (
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate">
          {a.description}
        </p>
      )}
      <p className="mt-2 text-[14px] font-bold text-graphite">{formatPrice(a.priceINR)}</p>

      <a
        href={whatsappLink(settings, a.name)}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={outOfStock}
        className={`mt-3 block rounded-full py-2.5 text-center text-[13px] font-bold uppercase tracking-wide transition-colors ${
          outOfStock ? "pointer-events-none bg-mist text-slate" : "bg-red text-white hover:bg-red-dark"
        }`}
      >
        {outOfStock ? "Notify me" : "Enquire on WhatsApp"}
      </a>
    </li>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
        active
          ? "border-red bg-red text-white"
          : "border-line text-slate hover:border-red hover:text-red"
      }`}
    >
      {children}
    </button>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
