"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { formatPrice } from "@/lib/format";
import type { AdminAccessory } from "@/lib/admin/accessories";
import { revalidateSite } from "../../actions";

/** One row per accessory. Flip the switch to mark in / out of stock. */
export default function AccessoryRow({ accessory }: { accessory: AdminAccessory }) {
  const [outOfStock, setOutOfStock] = useState(accessory.status === "out-of-stock");
  const [busy, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const toggleStock = () => {
    const next = !outOfStock;
    setOutOfStock(next);
    startTransition(async () => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("accessories")
        .update({ status: next ? "out-of-stock" : "in-stock" })
        .eq("id", accessory.id);

      if (error) {
        setOutOfStock(!next);
        alert("Couldn't save that — check your connection and try again.");
        return;
      }
      await revalidateSite();
    });
  };

  const onDelete = () => {
    if (!confirm(`Remove ${accessory.name} from the site? This can't be undone.`)) {
      return;
    }
    setDeleting(true);
    startTransition(async () => {
      const supabase = getSupabaseBrowser();
      if (accessory.photoPath) {
        await supabase.storage.from("accessories").remove([accessory.photoPath]);
      }
      const { error } = await supabase.from("accessories").delete().eq("id", accessory.id);
      if (error) {
        setDeleting(false);
        alert("Couldn't delete that — check your connection and try again.");
        return;
      }
      await revalidateSite();
    });
  };

  return (
    <li
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-white p-3 shadow-sm transition-opacity sm:flex-nowrap sm:p-4 ${
        deleting ? "pointer-events-none opacity-40" : ""
      }`}
    >
      <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-mist sm:h-20 sm:w-20">
        {accessory.photoUrl ? (
          <Image src={accessory.photoUrl} alt="" fill sizes="80px" className="object-cover" />
        ) : (
          <span className="text-[10px] text-slate">No photo</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-graphite">{accessory.name}</p>
        <p className="mt-0.5 text-[13px] text-slate">
          {accessory.category || "Uncategorised"}
          {accessory.featured && <span className="ml-2 font-semibold text-red">Featured on homepage</span>}
        </p>
        <p className="mt-0.5 text-[14px] font-bold text-graphite">
          {formatPrice(accessory.priceINR)}
        </p>
      </div>

      {/* Phones: controls drop to their own line so the name and details
          get the full width instead of being squeezed to a few letters. */}
      <div className="flex w-full items-center gap-3 border-t border-line pt-3 sm:w-auto sm:shrink-0 sm:gap-5 sm:border-0 sm:pt-0">
        <label className="mr-auto flex items-center gap-2 sm:mr-0 sm:flex-col sm:gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate">
            {outOfStock ? "Out" : "In stock"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={!outOfStock}
            aria-label={outOfStock ? "Mark in stock" : "Mark out of stock"}
            onClick={toggleStock}
            disabled={busy}
            className={`relative h-8 w-14 rounded-full transition-colors disabled:opacity-60 ${
              outOfStock ? "bg-slate/40" : "bg-red"
            }`}
          >
            <span
              className={`absolute top-1 size-6 rounded-full bg-white shadow transition-transform ${
                outOfStock ? "left-1" : "left-7"
              }`}
            />
          </button>
        </label>

        <Link
          href={`/admin/accessories/${accessory.id}/edit`}
          className="rounded-full border border-line px-4 py-2 text-[13px] font-bold text-graphite transition-colors hover:border-red hover:text-red"
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete accessory"
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
