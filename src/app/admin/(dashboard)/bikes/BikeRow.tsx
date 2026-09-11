"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { formatKm, formatPrice } from "@/lib/format";
import type { Bike, Category } from "@/lib/data/types";
import { revalidateSite } from "../../actions";

/**
 * One row per bike. The whole point of this screen: flip the switch, the
 * bike is sold — no dialog, no confirmation, no navigating away.
 */
export default function BikeRow({
  bike,
  categories,
}: {
  bike: Bike;
  categories: Category[];
}) {
  const router = useRouter();
  const [sold, setSold] = useState(bike.status === "sold" || bike.status === "booked");
  const [busy, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const category = categories.find((c) => c.slug === bike.category);

  const toggleSold = () => {
    const next = !sold;
    setSold(next); // optimistic — flips instantly, no spinner wait
    startTransition(async () => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("bikes")
        .update({ status: next ? "sold" : "available" })
        .eq("id", bike.id);

      if (error) {
        setSold(!next); // roll back on failure
        alert("Couldn't save that — check your connection and try again.");
        return;
      }
      await revalidateSite();
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!confirm(`Remove ${bike.brand} ${bike.fullName} from the site? This can't be undone.`)) {
      return;
    }
    setDeleting(true);
    startTransition(async () => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.from("bikes").delete().eq("id", bike.id);
      if (error) {
        setDeleting(false);
        alert("Couldn't delete that — check your connection and try again.");
        return;
      }
      await revalidateSite();
      router.refresh();
    });
  };

  return (
    <li
      className={`flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm transition-opacity sm:p-4 ${
        deleting ? "pointer-events-none opacity-40" : ""
      }`}
    >
      <div className="relative grid h-16 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-mist sm:h-20 sm:w-28">
        {bike.image ? (
          <Image
            src={bike.image}
            alt=""
            fill
            sizes="112px"
            className="object-contain p-1"
          />
        ) : (
          <span className="text-[10px] text-slate">No photo</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-graphite">
          {bike.brand} {bike.fullName}
        </p>
        <p className="mt-0.5 text-[13px] text-slate">
          {category?.name ?? "Uncategorised"} · {bike.year} · {formatKm(bike.km)}
        </p>
        <p className="mt-0.5 text-[14px] font-bold text-graphite">
          {formatPrice(bike.priceINR)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <label className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate">
            {sold ? "Sold" : "Live"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={!sold}
            aria-label={sold ? "Mark available" : "Mark sold"}
            onClick={toggleSold}
            disabled={busy}
            className={`relative h-8 w-14 rounded-full transition-colors disabled:opacity-60 ${
              sold ? "bg-slate/40" : "bg-red"
            }`}
          >
            <span
              className={`absolute top-1 size-6 rounded-full bg-white shadow transition-transform ${
                sold ? "left-1" : "left-7"
              }`}
            />
          </button>
        </label>

        <Link
          href={`/admin/bikes/${bike.id}/edit`}
          className="rounded-full border border-line px-4 py-2 text-[13px] font-bold text-graphite transition-colors hover:border-red hover:text-red"
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete bike"
          className="grid size-9 place-items-center rounded-full text-slate transition-colors hover:bg-red/10 hover:text-red"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </li>
  );
}
