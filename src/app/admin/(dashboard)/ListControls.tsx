"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Search + filter + pagination for the dashboard lists, done in the browser.
 *
 * The lists are small (tens to a few hundred rows) and already loaded in
 * full, so filtering here is instant — no server round trip per keystroke —
 * while paging keeps the DOM, and the number of thumbnails loading at once,
 * short.
 *
 * The query, filter and page are mirrored into the URL with
 * history.replaceState (which Next keeps in sync with useSearchParams, without
 * a server request), so going into Edit and pressing back lands on the same
 * search and page instead of the top of an unfiltered list.
 */
export function useListControls<T, F extends string>({
  items,
  matches,
  filterOf,
  defaultFilter,
  pageSize = 20,
}: {
  items: T[];
  /** Does this row match the lower-cased, trimmed search text? */
  matches: (item: T, q: string) => boolean;
  /** Which filter tab a row belongs to, if the list has tabs. */
  filterOf?: (item: T) => F;
  defaultFilter?: F | "all";
  pageSize?: number;
}) {
  const params = useSearchParams();
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [filter, setFilter] = useState<F | "all">(
    () => (params.get("f") as F | null) ?? defaultFilter ?? "all",
  );
  const [page, setPage] = useState(() => Math.max(1, Number(params.get("p")) || 1));

  const q = query.trim().toLowerCase();

  const searched = useMemo(
    () => (q ? items.filter((it) => matches(it, q)) : items),
    // `matches` is a fresh closure every render; the result only depends on
    // the items and the text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, q],
  );

  const filtered = useMemo(
    () =>
      filter === "all" || !filterOf ? searched : searched.filter((it) => filterOf(it) === filter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searched, filter],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);

  useEffect(() => {
    const url = new URL(window.location.href);
    const set = (k: string, v: string | null) =>
      v ? url.searchParams.set(k, v) : url.searchParams.delete(k);
    set("q", query.trim() || null);
    set("f", filter !== (defaultFilter ?? "all") ? filter : null);
    set("p", current > 1 ? String(current) : null);
    if (url.href !== window.location.href) window.history.replaceState(null, "", url);
  }, [query, filter, current, defaultFilter]);

  /** Row counts per tab, for the current search. */
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: searched.length };
    if (filterOf) for (const it of searched) c[filterOf(it)] = (c[filterOf(it)] ?? 0) + 1;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searched]);

  return {
    query,
    setQuery: (v: string) => {
      setQuery(v);
      setPage(1);
    },
    filter,
    setFilter: (v: F | "all") => {
      setFilter(v);
      setPage(1);
    },
    page: current,
    setPage: (p: number) => {
      setPage(p);
      window.scrollTo({ top: 0 });
    },
    pageCount,
    visible,
    total: filtered.length,
    counts,
  };
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate"
      >
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-4 text-[15px] text-graphite outline-none focus:border-red"
      />
    </div>
  );
}

export function FilterTabs<F extends string>({
  tabs,
  value,
  onChange,
  counts,
}: {
  tabs: { value: F | "all"; label: string }[];
  value: F | "all";
  onChange: (v: F | "all") => void;
  counts: Record<string, number>;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
            value === t.value ? "bg-graphite text-white" : "bg-white text-slate hover:text-graphite"
          }`}
        >
          {t.label} <span className="opacity-60">{counts[t.value] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  if (pageCount <= 1) return null;

  // First, last, and two either side of the current page, with gaps.
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  const btn =
    "grid h-10 min-w-10 place-items-center rounded-full px-3 text-[14px] font-bold transition-colors";

  return (
    <nav aria-label="Pages" className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${btn} bg-white text-graphite hover:text-red disabled:opacity-40`}
      >
        ‹ Prev
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-slate">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} ${p === page ? "bg-red text-white" : "bg-white text-graphite hover:text-red"}`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        className={`${btn} bg-white text-graphite hover:text-red disabled:opacity-40`}
      >
        Next ›
      </button>
    </nav>
  );
}

export function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="mt-6 rounded-2xl bg-white p-10 text-center">
      <p className="text-[15px] font-semibold text-graphite">Nothing matches that search</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 text-[14px] font-bold text-red hover:underline"
      >
        Clear search
      </button>
    </div>
  );
}
