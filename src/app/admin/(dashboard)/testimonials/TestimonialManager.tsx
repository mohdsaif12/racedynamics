"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { newStoragePath } from "@/lib/supabase/storage";
import type { AdminTestimonial } from "@/lib/admin/testimonials";
import { revalidateSite } from "../../actions";

export default function TestimonialManager({
  initial,
}: {
  initial: AdminTestimonial[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [quote, setQuote] = useState("");
  const [name, setName] = useState("");
  const [bikeBought, setBikeBought] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    await revalidateSite();
    router.refresh();
  };

  const addTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim() || !name.trim()) return;
    setBusy(true);

    const supabase = getSupabaseBrowser();
    let photoPath: string | null = null;

    if (file) {
      const path = newStoragePath(file);
      const { error: uploadErr } = await supabase.storage
        .from("owners")
        .upload(path, file, { cacheControl: "31536000" });
      if (!uploadErr) photoPath = path;
    }

    const nextOrder = items.length;
    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        quote: quote.trim(),
        name: name.trim(),
        bike_bought: bikeBought.trim(),
        photo_path: photoPath,
        sort_order: nextOrder,
      })
      .select("id, quote, name, bike_bought, photo_path")
      .single();

    setBusy(false);
    if (error || !data) {
      alert("Couldn't save that review. Try again.");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: data.id,
        quote: data.quote,
        name: data.name,
        bikeBought: data.bike_bought,
        photoPath: data.photo_path,
        photoUrl: null,
      },
    ]);
    setQuote("");
    setName("");
    setBikeBought("");
    setFile(null);
    await refresh();
  };

  const deleteTestimonial = async (t: AdminTestimonial) => {
    if (!confirm(`Remove the review from ${t.name}?`)) return;
    const supabase = getSupabaseBrowser();
    if (t.photoPath) await supabase.storage.from("owners").remove([t.photoPath]);
    await supabase.from("testimonials").delete().eq("id", t.id);
    setItems((prev) => prev.filter((x) => x.id !== t.id));
    await refresh();
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      {items.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm"
        >
          {t.photoUrl ? (
            <Image
              src={t.photoUrl}
              alt=""
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-mist text-[11px] text-slate">
              No photo
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[14px] leading-relaxed text-graphite">
              &ldquo;{t.quote}&rdquo;
            </p>
            <p className="mt-2 text-[13px] font-bold text-red">
              {t.name}
              {t.bikeBought && (
                <span className="ml-1 font-normal text-slate">· {t.bikeBought}</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => deleteTestimonial(t)}
            className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[12px] font-bold text-graphite hover:border-red hover:text-red"
          >
            Delete
          </button>
        </div>
      ))}

      <form
        onSubmit={addTestimonial}
        className="mt-3 rounded-2xl border-2 border-dashed border-line bg-white p-5"
      >
        <p className="text-[13px] font-bold uppercase tracking-wide text-slate">
          Add a review
        </p>
        <div className="mt-3 flex flex-col gap-3">
          <textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="What the customer said"
            required
            rows={3}
            className="rounded-xl border border-line px-4 py-3 text-[15px] outline-none focus:border-red"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer name"
              required
              className="rounded-xl border border-line px-4 py-3 text-[15px] outline-none focus:border-red"
            />
            <input
              value={bikeBought}
              onChange={(e) => setBikeBought(e.target.value)}
              placeholder="Bike they bought (optional)"
              className="rounded-xl border border-line px-4 py-3 text-[15px] outline-none focus:border-red"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-[13px] text-slate"
          />
          <button
            type="submit"
            disabled={busy}
            className="self-start rounded-full bg-red px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-red-dark disabled:opacity-60"
          >
            {busy ? "Adding…" : "Add review"}
          </button>
        </div>
      </form>
    </div>
  );
}
