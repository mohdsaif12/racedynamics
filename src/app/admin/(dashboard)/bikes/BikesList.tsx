"use client";

import type { Bike, Category } from "@/lib/data/types";
import BikeRow from "./BikeRow";
import { FilterTabs, NoResults, Pagination, SearchBox, useListControls } from "../ListControls";

type Tab = "live" | "sold";

export default function BikesList({
  bikes,
  categories,
}: {
  bikes: Bike[];
  categories: Category[];
}) {
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? "";

  const list = useListControls<Bike, Tab>({
    items: bikes,
    matches: (b, q) =>
      [b.brand, b.fullName, b.model, categoryName(b.category), String(b.year), b.location]
        .join(" ")
        .toLowerCase()
        .includes(q),
    filterOf: (b) => (b.status === "sold" || b.status === "booked" ? "sold" : "live"),
  });

  return (
    <>
      <div className="mt-6 flex flex-col gap-3">
        <SearchBox
          value={list.query}
          onChange={list.setQuery}
          placeholder="Search by brand, model, year, category…"
        />
        <FilterTabs<Tab>
          tabs={[
            { value: "all", label: "All" },
            { value: "live", label: "Live" },
            { value: "sold", label: "Sold" },
          ]}
          value={list.filter}
          onChange={list.setFilter}
          counts={list.counts}
        />
      </div>

      {list.total === 0 ? (
        <NoResults
          onClear={() => {
            list.setQuery("");
            list.setFilter("all");
          }}
        />
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {list.visible.map((bike) => (
            <BikeRow key={bike.id} bike={bike} categories={categories} />
          ))}
        </ul>
      )}

      <Pagination page={list.page} pageCount={list.pageCount} onChange={list.setPage} />
    </>
  );
}
