"use client";

import { useState, useTransition } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { AdminEnquiry, EnquiryStatus } from "@/lib/admin/enquiries";

const STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: "new", label: "To call" },
  { value: "contacted", label: "Called" },
  { value: "closed", label: "Done" },
];

const inr = new Intl.NumberFormat("en-IN");

/** A single lead, with the two things the client actually needs: a way to ring
 *  them, and a way to mark that they did. The list owns the rows, so changes
 *  are reported up instead of re-fetching the whole page. */
export default function EnquiryCard({
  enquiry,
  onStatusChange,
  onDeleted,
}: {
  enquiry: AdminEnquiry;
  onStatusChange: (status: EnquiryStatus) => void;
  onDeleted: () => void;
}) {
  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status);
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const setTo = (next: EnquiryStatus) => {
    if (next === status) return;
    const previous = status;
    setStatus(next); // optimistic

    startTransition(async () => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("sell_enquiries")
        .update({ status: next })
        .eq("id", enquiry.id);

      if (error) {
        setStatus(previous);
        alert("Couldn't update that. Check your connection and try again.");
        return;
      }
      onStatusChange(next);
    });
  };

  const remove = () => {
    if (!confirm(`Delete the enquiry from ${enquiry.name} (${enquiry.bike})? This can't be undone.`)) {
      return;
    }
    setDeleting(true);
    startTransition(async () => {
      const { error } = await getSupabaseBrowser()
        .from("sell_enquiries")
        .delete()
        .eq("id", enquiry.id);
      if (error) {
        setDeleting(false);
        alert("Couldn't delete that. Check your connection and try again.");
        return;
      }
      onDeleted();
    });
  };

  const when = new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const facts = [
    enquiry.year ? String(enquiry.year) : null,
    enquiry.km != null ? `${inr.format(enquiry.km)} km` : null,
    enquiry.expectedInr != null ? `wants ₹${inr.format(enquiry.expectedInr)}` : null,
  ].filter(Boolean);

  return (
    <article
      className={`rounded-2xl bg-white p-5 shadow-sm transition-opacity sm:p-6 ${
        pending || deleting ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold text-graphite">{enquiry.bike}</h2>
          <p className="mt-0.5 text-[14px] text-slate">
            {enquiry.name} · {when}
          </p>
        </div>
        {status === "new" && (
          <span className="shrink-0 rounded-full bg-red/10 px-3 py-1 text-[12px] font-bold text-red">
            New
          </span>
        )}
      </div>

      {facts.length > 0 && (
        <p className="mt-3 text-[14px] text-graphite">{facts.join(" · ")}</p>
      )}

      {enquiry.notes && (
        <p className="mt-3 whitespace-pre-line border-l-2 border-line pl-3 text-[14px] leading-relaxed text-slate">
          {enquiry.notes}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={`tel:${enquiry.phone}`}
          className="rounded-full bg-red px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-red-dark"
        >
          Call {enquiry.phone}
        </a>
        <a
          href={`https://wa.me/${enquiry.phone.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line px-5 py-2.5 text-[14px] font-bold text-graphite transition-colors hover:border-slate"
        >
          WhatsApp
        </a>
        {enquiry.email && (
          <a
            href={`mailto:${enquiry.email}`}
            className="rounded-full border border-line px-5 py-2.5 text-[14px] font-bold text-graphite transition-colors hover:border-slate"
          >
            Email
          </a>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setTo(s.value)}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
              status === s.value
                ? "bg-graphite text-white"
                : "text-slate hover:bg-mist"
            }`}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={remove}
          className="ml-auto flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-slate transition-colors hover:bg-red/10 hover:text-red"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Delete
        </button>
      </div>
    </article>
  );
}
