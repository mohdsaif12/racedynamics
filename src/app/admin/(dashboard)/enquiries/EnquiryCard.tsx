"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { AdminEnquiry, EnquiryStatus } from "@/lib/admin/enquiries";

const STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: "new", label: "To call" },
  { value: "contacted", label: "Called" },
  { value: "closed", label: "Done" },
];

const inr = new Intl.NumberFormat("en-IN");

/** A single lead, with the two things the client actually needs: a way to ring
 *  them, and a way to mark that they did. */
export default function EnquiryCard({ enquiry }: { enquiry: AdminEnquiry }) {
  const router = useRouter();
  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status);
  const [pending, startTransition] = useTransition();

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
      router.refresh();
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
        pending ? "opacity-60" : ""
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

      <div className="mt-4 flex gap-2 border-t border-line pt-4">
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
      </div>
    </article>
  );
}
