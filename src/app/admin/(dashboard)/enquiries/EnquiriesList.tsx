"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { AdminEnquiry, EnquiryStatus } from "@/lib/admin/enquiries";
import EnquiryCard from "./EnquiryCard";
import { FilterTabs, NoResults, Pagination, SearchBox, useListControls } from "../ListControls";

/** Holds the enquiries in local state so status changes and deletes show
 *  instantly, with no page re-fetch. */
export default function EnquiriesList({ initial }: { initial: AdminEnquiry[] }) {
  const [enquiries, setEnquiries] = useState(initial);
  const [clearing, setClearing] = useState(false);

  const list = useListControls<AdminEnquiry, EnquiryStatus>({
    items: enquiries,
    matches: (e, q) =>
      [e.name, e.phone, e.email, e.bike, e.notes, e.year ?? ""].join(" ").toLowerCase().includes(q),
    filterOf: (e) => e.status,
    pageSize: 15,
  });

  const done = enquiries.filter((e) => e.status === "closed");
  const fresh = enquiries.filter((e) => e.status === "new").length;

  const clearDone = async () => {
    if (!done.length) return;
    const noun = done.length === 1 ? "enquiry" : "enquiries";
    if (!confirm(`Delete all ${done.length} ${noun} marked Done? This can't be undone.`)) return;

    setClearing(true);
    const ids = done.map((e) => e.id);
    const { error } = await getSupabaseBrowser().from("sell_enquiries").delete().in("id", ids);
    setClearing(false);
    if (error) {
      alert("Couldn't delete those. Check your connection and try again.");
      return;
    }
    setEnquiries((prev) => prev.filter((e) => !ids.includes(e.id)));
  };

  return (
    <>
      <p className="mt-1 text-[14px] text-slate">
        {enquiries.length} total · {fresh} still to call
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <SearchBox
          value={list.query}
          onChange={list.setQuery}
          placeholder="Search by name, phone or bike…"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs<EnquiryStatus>
            tabs={[
              { value: "all", label: "All" },
              { value: "new", label: "To call" },
              { value: "contacted", label: "Called" },
              { value: "closed", label: "Done" },
            ]}
            value={list.filter}
            onChange={list.setFilter}
            counts={list.counts}
          />
          {done.length > 0 && (
            <button
              type="button"
              onClick={clearDone}
              disabled={clearing}
              className="rounded-full border border-line bg-white px-4 py-2 text-[13px] font-bold text-graphite transition-colors hover:border-red hover:text-red disabled:opacity-60"
            >
              {clearing ? "Deleting…" : `Delete all done (${done.length})`}
            </button>
          )}
        </div>
      </div>

      {list.total === 0 ? (
        <NoResults
          onClear={() => {
            list.setQuery("");
            list.setFilter("all");
          }}
        />
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {list.visible.map((e) => (
            <EnquiryCard
              key={e.id}
              enquiry={e}
              onStatusChange={(status) =>
                setEnquiries((prev) => prev.map((x) => (x.id === e.id ? { ...x, status } : x)))
              }
              onDeleted={() => setEnquiries((prev) => prev.filter((x) => x.id !== e.id))}
            />
          ))}
        </div>
      )}

      <Pagination page={list.page} pageCount={list.pageCount} onChange={list.setPage} />
    </>
  );
}
