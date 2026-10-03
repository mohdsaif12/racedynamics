"use client";

import type { AdminAccessory } from "@/lib/admin/accessories";
import AccessoryRow from "./AccessoryRow";
import { FilterTabs, NoResults, Pagination, SearchBox, useListControls } from "../ListControls";

export default function AccessoriesList({ accessories }: { accessories: AdminAccessory[] }) {
  const list = useListControls<AdminAccessory, AdminAccessory["status"]>({
    items: accessories,
    matches: (a, q) => [a.name, a.category, a.description].join(" ").toLowerCase().includes(q),
    filterOf: (a) => a.status,
  });

  return (
    <>
      <div className="mt-6 flex flex-col gap-3">
        <SearchBox
          value={list.query}
          onChange={list.setQuery}
          placeholder="Search by name or category…"
        />
        <FilterTabs<AdminAccessory["status"]>
          tabs={[
            { value: "all", label: "All" },
            { value: "in-stock", label: "In stock" },
            { value: "out-of-stock", label: "Out of stock" },
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
          {list.visible.map((a) => (
            <AccessoryRow key={a.id} accessory={a} />
          ))}
        </ul>
      )}

      <Pagination page={list.page} pageCount={list.pageCount} onChange={list.setPage} />
    </>
  );
}
