"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { whatsappLink } from "@/lib/data/links";
import { formatPrice } from "@/lib/format";
import type { Accessory, SiteSettings } from "@/lib/data/types";
import { ACCESSORY_BRANDS, ACCESSORY_GROUPS, brandOf, type AccessoryBrand } from "@/lib/accessoryBrands";
import { ArrowRightIcon, BoxIcon, HeartIcon } from "@/components/icons";

const ALL = "all";
const SAVED = "saved";
const RIDING_GEAR = "Riding Gear";

/* ---------------------------------------------------- saved (hearts) ---- */
/* Kept in localStorage, read through useSyncExternalStore so the server
   render (nothing saved) and the first client render agree, and the hearts
   fill in right after hydration without a mismatch. */
const SAVED_KEY = "rd:saved-accessories";
const savedListeners = new Set<() => void>();

function readSaved(): string {
  try {
    return localStorage.getItem(SAVED_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribeSaved(cb: () => void) {
  savedListeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === SAVED_KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    savedListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function writeSaved(ids: string[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  } catch {
    /* private mode — hearts just won't persist */
  }
  savedListeners.forEach((l) => l());
}

function parseSaved(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------ helpers --- */
const haystack = (a: Accessory) => `${a.name} ${a.category}`.toLowerCase();
const groupText = (a: Accessory) => (a.category || a.name).toLowerCase();
const groupMatch = (name: string, text: string) =>
  ACCESSORY_GROUPS.find((g) => g.name === name)?.match.test(text) ?? false;

/* The catalogue was imported in ALL CAPS ("MOTO TORQUE KTM ADVANTURE 390").
   Display it in title case, but leave short runs alone so model codes and
   acronyms (KTM, SS, RE, GT, R15) survive. Mixed-case names are left as typed. */
const SMALL_WORDS = new Set(["AND", "FOR", "THE", "OF", "WITH", "TO", "IN", "ON"]);
const ACRONYMS = new Set(["LED", "ABS", "CNC", "GPS", "USB", "ECU", "DRL", "OEM", "ISI", "DOT", "TVS", "MRF", "AMG"]);
const SPECIAL: Record<string, string> = { FUELX: "FuelX", POWERTRONIC: "PowerTRONIC" };
function tidy(s: string): string {
  if (!s || s !== s.toUpperCase()) return s;
  return s.replace(/[A-Z]+/g, (w, offset: number) => {
    if (SPECIAL[w]) return SPECIAL[w];
    if (offset > 0 && SMALL_WORDS.has(w)) return w.toLowerCase();
    if (ACRONYMS.has(w) || w.length <= 2) return w;
    // A 3-letter run with no vowel is a code (KTM, BMW, DSG, RRP); one with
    // a vowel is a word (AIR, GUN, BAG, FOG).
    if (w.length === 3 && !/[AEIOU]/.test(w)) return w;
    return w[0] + w.slice(1).toLowerCase();
  });
}

const CHIP_PREVIEW = 16;

/* Rendering all 1,200+ cards at once made the page heavy on phones; show a
   page at a time and pull the next one in as the user nears the end. */
const PAGE_SIZE = 24;

export default function AccessoriesBrowser({
  accessories,
  settings,
}: {
  accessories: Accessory[];
  settings: SiteSettings;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [brand, setBrand] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const savedRaw = useSyncExternalStore(subscribeSaved, readSaved, () => "[]");
  const saved = useMemo(() => parseSaved(savedRaw), [savedRaw]);
  const toggleSaved = (id: string) =>
    writeSaved(saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id]);

  const categories = useMemo(() => {
    const set = new Set(accessories.map((a) => a.category).filter(Boolean));
    return Array.from(set).sort((x, y) => x.localeCompare(y));
  }, [accessories]);

  /* Only offer groups that actually have something in them. */
  const groups = useMemo(
    () => ACCESSORY_GROUPS.filter((g) => accessories.some((a) => g.match.test(groupText(a)))),
    [accessories],
  );

  const subCategories =
    group === ALL || group === SAVED
      ? categories
      : categories.filter((c) => groupMatch(group, c.toLowerCase()));

  /* 40-odd categories wrap into a wall of chips that pushes every product
     below the fold — show a preview, keeping the selected one visible. */
  const [showAllChips, setShowAllChips] = useState(false);
  const canCollapse = subCategories.length > CHIP_PREVIEW + 2;
  const collapsed = canCollapse && !showAllChips;
  const chipPreview = subCategories.slice(0, CHIP_PREVIEW);
  if (collapsed && category !== ALL && !chipPreview.includes(category)) chipPreview.push(category);

  const activeBrand = ACCESSORY_BRANDS.find((b) => b.slug === brand);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accessories.filter((a) => {
      if (group === SAVED && !saved.includes(a.id)) return false;
      if (group !== ALL && group !== SAVED && !groupMatch(group, groupText(a))) return false;
      if (category !== ALL && a.category !== category) return false;
      if (activeBrand && !activeBrand.match.test(haystack(a))) return false;
      if (!q) return true;
      const b = brandOf(haystack(a));
      return `${a.name} ${a.description} ${a.category} ${b?.name ?? ""}`.toLowerCase().includes(q);
    });
  }, [accessories, query, group, category, activeBrand, saved]);

  /* The visible count resets whenever the filters change — derived from a
     key rather than reset in an effect. */
  const filterKey = `${query}|${group}|${category}|${brand}`;
  const [paging, setPaging] = useState({ key: filterKey, limit: PAGE_SIZE });
  const limit = paging.key === filterKey ? paging.limit : PAGE_SIZE;
  const visible = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;
  const loadMore = () => setPaging({ key: filterKey, limit: limit + PAGE_SIZE });

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setPaging({ key: filterKey, limit: limit + PAGE_SIZE }),
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filterKey, limit, hasMore]);

  const pickGroup = (g: string) => {
    setGroup(g);
    setCategory(ALL);
  };

  const shopRidingGear = () => {
    setBrand(null);
    setCategory(ALL);
    setGroup(groups.some((g) => g.name === RIDING_GEAR) ? RIDING_GEAR : ALL);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearAll = () => {
    setQuery("");
    setGroup(ALL);
    setCategory(ALL);
    setBrand(null);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-20 lg:px-10">
      <BrandStrip active={brand} onPick={(slug) => setBrand((cur) => (cur === slug ? null : slug))} />

      {accessories.length === 0 ? (
        <p className="mt-14 text-sm text-slate">
          Nothing listed yet — check back soon, or ask us on WhatsApp about what&rsquo;s in stock.
        </p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,370px)_minmax(0,1fr)]">
          {/* ------------------------------------------------ left column */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <label className="relative block">
              <span className="sr-only">Search accessories</span>
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search accessories, brands or models…"
                className="h-12 w-full rounded-xl border border-line bg-mist pl-11 pr-4 text-[14.5px] text-graphite outline-none transition-colors placeholder:text-slate focus:border-red focus:bg-white"
              />
            </label>

            <PromoCard onShop={shopRidingGear} />
          </aside>

          {/* ------------------------------------------------ right column */}
          <div ref={resultsRef} className="min-w-0 scroll-mt-28">
            <ChipRow>
              <GroupChip active={group === ALL} onClick={() => pickGroup(ALL)}>
                All
              </GroupChip>
              {groups.map((g) => (
                <GroupChip key={g.name} active={group === g.name} onClick={() => pickGroup(g.name)}>
                  {g.name}
                </GroupChip>
              ))}
              {saved.length > 0 && (
                <GroupChip active={group === SAVED} onClick={() => pickGroup(SAVED)}>
                  <HeartIcon size={15} filled className="text-current" /> Saved ({saved.length})
                </GroupChip>
              )}
            </ChipRow>

            {subCategories.length > 1 && (
              <ChipRow className="mt-3">
                {(collapsed ? chipPreview : subCategories).map((c) => (
                  <SubChip
                    key={c}
                    active={category === c}
                    onClick={() => setCategory((cur) => (cur === c ? ALL : c))}
                  >
                    {tidy(c)}
                  </SubChip>
                ))}
                {canCollapse && (
                  <button
                    type="button"
                    onClick={() => setShowAllChips((v) => !v)}
                    aria-expanded={!collapsed}
                    className="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-red hover:underline"
                  >
                    {collapsed ? `+${subCategories.length - chipPreview.length} more` : "Show less"}
                  </button>
                )}
              </ChipRow>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-slate">
              <span>
                {filtered.length} {filtered.length === 1 ? "product" : "products"}
              </span>
              {activeBrand && (
                <button
                  type="button"
                  onClick={() => setBrand(null)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red/10 px-3 py-1 font-semibold text-red hover:bg-red/15"
                >
                  {activeBrand.name} <span aria-hidden>×</span>
                  <span className="sr-only">Clear brand filter</span>
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
                <p className="text-[15px] font-semibold text-graphite">
                  {activeBrand ? `No ${activeBrand.name} items listed right now.` : "Nothing matches that."}
                </p>
                <p className="mt-1.5 text-[13.5px] text-slate">
                  {activeBrand
                    ? "We still stock the brand — ask us on WhatsApp what's available."
                    : "Try a different search or category."}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="rounded-full border border-line px-5 py-2.5 text-[13px] font-semibold text-graphite hover:border-red hover:text-red"
                  >
                    Show everything
                  </button>
                  {activeBrand && (
                    <a
                      href={whatsappLink(settings, `${activeBrand.name} accessories`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-red px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-red-dark"
                    >
                      Ask on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 2xl:grid-cols-4">
                  {visible.map((a) => (
                    <AccessoryCard
                      key={a.id}
                      accessory={a}
                      settings={settings}
                      saved={saved.includes(a.id)}
                      onToggleSaved={() => toggleSaved(a.id)}
                    />
                  ))}
                </ul>
                {hasMore && (
                  <div ref={sentinelRef} className="mt-8 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={loadMore}
                      className="rounded-full border border-line px-6 py-3 text-[13.5px] font-semibold text-graphite transition-colors hover:border-red hover:text-red"
                    >
                      Load more
                    </button>
                    <span className="text-[12px] text-slate">
                      Showing {visible.length} of {filtered.length}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------- brand strip --- */

/**
 * Auto-scrolling logo marquee. Pure CSS: the track holds the list twice and
 * slides left by exactly one copy (-50%), then loops — a compositor-only
 * transform, so it costs no main-thread work per frame. Pauses on hover,
 * touch and keyboard focus so a logo can actually be clicked; with
 * reduced-motion on it becomes a plain swipeable row instead.
 */
function BrandStrip({ active, onPick }: { active: string | null; onPick: (slug: string) => void }) {
  return (
    <div className="group/strip relative -mx-5 mt-6 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none] sm:mx-0 motion-reduce:[&::-webkit-scrollbar]:hidden">
      <div className="flex w-max animate-[brand-marquee_55s_linear_infinite] group-hover/strip:[animation-play-state:paused] group-focus-within/strip:[animation-play-state:paused] group-active/strip:[animation-play-state:paused] motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1 || undefined}
            className={`flex shrink-0 gap-3 pr-3 ${copy === 1 ? "motion-reduce:hidden" : "pl-5 sm:pl-0"}`}
          >
            {ACCESSORY_BRANDS.map((b) => (
              <BrandCard
                key={b.slug}
                brand={b}
                active={active === b.slug}
                onPick={() => onPick(b.slug)}
                hidden={copy === 1}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandCard({
  brand: b,
  active,
  onPick,
  hidden = false,
}: {
  brand: AccessoryBrand;
  active: boolean;
  onPick: () => void;
  /** The marquee's duplicate copy: clickable, but skipped by keyboard and screen readers. */
  hidden?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      tabIndex={hidden ? -1 : undefined}
      className={`flex h-[92px] w-[132px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border bg-white px-3 transition-[border-color,box-shadow] duration-200 sm:h-[96px] sm:w-[140px] ${
        active
          ? "border-red shadow-[0_0_0_1px_var(--color-red),0_6px_18px_rgba(213,13,46,0.15)]"
          : "border-line shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-graphite/25 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
      }`}
    >
      <span className="flex h-10 w-full items-center justify-center">
        <Image
          src={b.logo}
          alt=""
          width={b.width}
          height={b.height}
          sizes="120px"
          className="h-auto max-h-10 w-auto max-w-full object-contain"
        />
      </span>
      <span className="max-w-full truncate text-[11.5px] text-slate">{b.name}</span>
    </button>
  );
}

/* ------------------------------------------------------------ promo ----- */

function PromoCard({ onShop }: { onShop: () => void }) {
  return (
    <div className="relative mt-6 hidden overflow-hidden rounded-2xl bg-[radial-gradient(120%_90%_at_85%_10%,#2b2b30_0%,#121214_55%,#08080a_100%)] lg:block">
      <div className="relative aspect-[10/9]">
        <Image
          src="/bikes/s1000rr.webp"
          alt=""
          fill
          sizes="370px"
          className="translate-x-[16%] -translate-y-[8%] scale-[1.25] object-contain"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,10,0.96)_20%,rgba(8,8,10,0.55)_55%,rgba(8,8,10,0)_80%)]"
        />
        <div className="absolute inset-x-0 bottom-0 p-7">
          <p className="text-[12px] font-semibold uppercase tracking-[0.42em] text-white/70">Premium</p>
          <p className="display mt-1 text-[2.25rem] font-extrabold italic leading-none text-white">Riding Gear</p>
          <p className="mt-2 text-[14.5px] text-white/75">Top brands. Best performance.</p>
          <button
            type="button"
            onClick={onShop}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-graphite transition-colors hover:bg-red hover:text-white"
          >
            Shop Now <ArrowRightIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- card ----- */

function AccessoryCard({
  accessory: a,
  settings,
  saved,
  onToggleSaved,
}: {
  accessory: Accessory;
  settings: SiteSettings;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  const outOfStock = a.status === "out-of-stock";
  const brand = brandOf(haystack(a));

  return (
    <li
      className={`group flex flex-col rounded-2xl border border-line bg-white p-2.5 transition-shadow duration-200 hover:shadow-[0_14px_34px_rgba(0,0,0,0.08)] sm:p-3 ${
        outOfStock ? "opacity-70" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-mist">
        {a.image ? (
          <Image
            src={a.image}
            alt={tidy(a.name)}
            fill
            sizes="(min-width: 1536px) 18vw, (min-width: 1024px) 24vw, 46vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : brand ? (
          <div className="grid h-full place-items-center p-6">
            <Image
              src={brand.logo}
              alt=""
              width={brand.width}
              height={brand.height}
              sizes="160px"
              className="h-auto max-h-14 w-auto max-w-[75%] object-contain opacity-80"
            />
          </div>
        ) : (
          <div className="grid h-full place-items-center text-slate/70">
            <BoxIcon size={34} />
          </div>
        )}

        <button
          type="button"
          onClick={onToggleSaved}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${a.name} from saved` : `Save ${a.name}`}
          className={`absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-white/95 shadow-sm transition-colors ${
            saved ? "text-red" : "text-graphite hover:text-red"
          }`}
        >
          <HeartIcon size={18} filled={saved} />
        </button>

        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <h2 className="text-[14px] font-bold leading-snug text-graphite sm:text-[15px]">{tidy(a.name)}</h2>
        <p className="mt-0.5 truncate text-[12.5px] text-slate sm:text-[13px]">{brand?.name ?? tidy(a.category)}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <p className="text-[14px] font-bold text-graphite sm:text-[15px]">{formatPrice(a.priceINR)}</p>
          <a
            href={whatsappLink(settings, a.name)}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={outOfStock}
            className={`rounded-full px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-wide transition-colors sm:px-4 sm:text-[12px] ${
              outOfStock ? "pointer-events-none bg-mist text-slate" : "bg-red text-white hover:bg-red-dark"
            }`}
          >
            {outOfStock ? "Notify me" : "Enquire"}
          </a>
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------- chips ---- */

function ChipRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {children}
    </div>
  );
}

function GroupChip({
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
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-[14px] transition-colors ${
        active
          ? "bg-red font-semibold text-white lg:shadow-[0_6px_16px_rgba(213,13,46,0.25)]"
          : "bg-mist font-medium text-body hover:bg-line"
      }`}
    >
      {children}
    </button>
  );
}

function SubChip({
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
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
        active ? "border-red bg-red/5 font-semibold text-red" : "border-line bg-white text-body hover:border-red hover:text-red"
      }`}
    >
      {children}
    </button>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
