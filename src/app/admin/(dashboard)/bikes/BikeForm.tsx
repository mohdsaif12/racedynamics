"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { newStoragePath } from "@/lib/supabase/storage";
import type { AdminCategory } from "@/lib/admin/categories";
import type { EditableBike } from "@/lib/admin/bikes";
import type { ExtraSpec } from "@/lib/data/types";
import { revalidateSite } from "../../actions";
import { hasTransparency } from "@/lib/admin/transparency";

type Props =
  | { mode: "create"; categories: AdminCategory[] }
  | { mode: "edit"; categories: AdminCategory[]; bike: EditableBike };

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "booked", label: "Booked" },
  { value: "sold", label: "Sold" },
  { value: "on-request", label: "Price on request" },
] as const;

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * One form for both adding and editing a bike. Existing photos delete
 * instantly (their own button, own request) since that's a distinct action;
 * everything else — text fields and any newly-added photos — saves together
 * when "Save" is pressed.
 */
export default function BikeForm(props: Props) {
  const router = useRouter();
  const editing = props.mode === "edit";
  const bike = editing ? props.bike : undefined;

  const [brand, setBrand] = useState(bike?.brand ?? "");
  const [model, setModel] = useState(bike?.model ?? "");
  const [fullName, setFullName] = useState(bike?.fullName ?? "");
  const [categoryId, setCategoryId] = useState(
    bike?.categoryId ?? props.categories[0]?.id ?? "",
  );
  const [year, setYear] = useState(String(bike?.year ?? new Date().getFullYear()));
  const [km, setKm] = useState(String(bike?.km ?? 0));
  const [location, setLocation] = useState(bike?.location ?? "");
  const [engineCc, setEngineCc] = useState(String(bike?.engineCc ?? ""));
  const [price, setPrice] = useState(bike?.priceINR != null ? String(bike.priceINR) : "");
  const [status, setStatus] = useState(bike?.status ?? "available");
  const [featured, setFeatured] = useState(bike?.featured ?? false);
  const [extraSpecs, setExtraSpecs] = useState<ExtraSpec[]>(
    bike?.extraSpecs ?? [],
  );

  const [existingImages, setExistingImages] = useState(bike?.images ?? []);
  // The preview URL is created once, when a file is added, and stored
  // alongside it — calling URL.createObjectURL(file) fresh on every render
  // (as a plain `newFiles: File[]` would need to, for the <img src>) leaks a
  // new blob URL every time this component re-renders.
  const [newFiles, setNewFiles] = useState<
    { file: File; previewUrl: string; cutout: boolean }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const added = await Promise.all(
      Array.from(files).map(async (file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        cutout: await hasTransparency(file),
      })),
    );
    setNewFiles((prev) => [...prev, ...added]);
  };

  /* The cover is whatever sits first overall: an already-saved photo if there
     is one, otherwise the first newly-added file. We can only inspect files
     added in this session, so a bike that already has photos is left alone. */
  const coverNeedsCutout =
    existingImages.length === 0 && newFiles.length > 0 && !newFiles[0].cutout;

  const removeNewFile = (i: number) => {
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[i].previewUrl);
      return prev.filter((_, n) => n !== i);
    });
  };

  const deleteExistingImage = async (imageId: string, path: string) => {
    if (!confirm("Remove this photo?")) return;
    setDeletingImageId(imageId);

    const supabase = getSupabaseBrowser();
    await supabase.storage.from("bikes").remove([path]);
    const { error: delErr } = await supabase.from("bike_images").delete().eq("id", imageId);

    setDeletingImageId(null);
    if (delErr) {
      alert("Couldn't remove that photo. Try again.");
      return;
    }
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    await revalidateSite();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!brand.trim() || !model.trim() || !fullName.trim() || !categoryId) {
      setError("Brand, model, full name and category are all required.");
      return;
    }

    setSaving(true);
    const supabase = getSupabaseBrowser();

    const payload = {
      brand: brand.trim(),
      model: model.trim(),
      full_name: fullName.trim(),
      category_id: categoryId,
      year: Number(year) || new Date().getFullYear(),
      km: Number(km) || 0,
      location: location.trim(),
      engine_cc: Number(engineCc) || 0,
      price_inr: price.trim() ? Number(price) : null,
      status,
      featured,
      // Blank rows are dropped rather than saved — someone who adds a row and
      // changes their mind shouldn't get an empty cell on the live site.
      extra_specs: extraSpecs
        .map((r) => ({ label: r.label.trim(), value: r.value.trim() }))
        .filter((r) => r.label && r.value),
    };

    let bikeId = bike?.id;

    if (editing) {
      const { error: updateErr } = await supabase
        .from("bikes")
        .update(payload)
        .eq("id", bike!.id);
      if (updateErr) {
        setSaving(false);
        setError("Couldn't save. Check your connection and try again.");
        return;
      }
    } else {
      // Slug must be unique — try the plain version first, then fall back to
      // one with a short random suffix if it collides.
      const base = slugify(`${brand}-${fullName}-${year}`) || `bike-${Date.now()}`;
      let slug = base;
      let insertedId: string | undefined;

      for (let attempt = 0; attempt < 3 && !insertedId; attempt++) {
        const { data, error: insertErr } = await supabase
          .from("bikes")
          .insert({ ...payload, slug })
          .select("id")
          .single();

        if (!insertErr && data) {
          insertedId = data.id;
        } else if (insertErr?.code === "23505") {
          slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
        } else {
          setSaving(false);
          setError("Couldn't save. Check your connection and try again.");
          return;
        }
      }

      if (!insertedId) {
        setSaving(false);
        setError("Couldn't save — please try again.");
        return;
      }
      bikeId = insertedId;
    }

    // Upload any newly-added photos and attach them to the bike.
    if (newFiles.length > 0 && bikeId) {
      const startOrder = existingImages.length;
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i].file;
        const path = newStoragePath(file);
        const { error: uploadErr } = await supabase.storage
          .from("bikes")
          .upload(path, file, { cacheControl: "31536000" });
        if (uploadErr) continue;

        await supabase
          .from("bike_images")
          .insert({ bike_id: bikeId, path, sort_order: startOrder + i });
      }
    }

    await revalidateSite();
    setSaving(false);
    router.push("/admin/bikes");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl px-5 py-8 lg:px-10">
      {/* The sidebar is hidden on mobile, so without this there's no way back
          to the list from here at all. */}
      <Link
        href="/admin/bikes"
        className="-ml-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[14px] font-semibold text-slate transition-colors hover:text-red"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 5l-7 7 7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        All bikes
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-graphite">
        {editing ? "Edit bike" : "Add a bike"}
      </h1>

      {/* ------------------------------------------------------------ photos */}
      <Section title="Photos">
        <div className="flex flex-wrap gap-3">
          {existingImages.map((img) => (
            <div key={img.id} className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-mist">
              <Image src={img.url} alt="" fill sizes="96px" className="object-contain p-1" />
              <button
                type="button"
                onClick={() => deleteExistingImage(img.id, img.path)}
                disabled={deletingImageId === img.id}
                aria-label="Remove photo"
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/80 text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>
          ))}

          {newFiles.map((f, i) => (
            <div key={i} className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-mist">
              {/* A blob: preview URL — next/image only accepts remote
                  http(s) sources or local /public paths, so this stays a
                  plain <img>. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.previewUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-contain p-1"
              />
              <button
                type="button"
                onClick={() => removeNewFile(i)}
                aria-label="Remove photo"
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/80 text-white"
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="grid size-24 shrink-0 place-items-center rounded-xl border-2 border-dashed border-line text-slate transition-colors hover:border-red hover:text-red"
          >
            <span className="text-3xl leading-none">+</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
        <div className="mt-4 rounded-xl bg-mist p-4">
          <p className="text-[13px] font-bold text-graphite">
            The first photo is the cover
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate">
            It floats on the dark stage with no frame around it, so it needs a{" "}
            <strong className="text-graphite">cut-out with no background</strong>{" "}
            — a PNG or WebP where the area around the bike is see-through. Any
            photos after the first are shown as normal photographs, so those can
            be ordinary pictures straight off your phone.
          </p>
          <a
            href="https://www.remove.bg/upload"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-block text-[13px] font-bold text-red underline underline-offset-2"
          >
            Free tool to cut out a background →
          </a>
        </div>

        {coverNeedsCutout && (
          <p className="mt-3 rounded-xl bg-red/10 px-4 py-3 text-[13px] leading-relaxed text-red">
            <strong>That cover photo still has its background.</strong> You can
            save it and it will work — but on the stage it will show as a
            rectangle instead of floating. Cut it out first if you can.
          </p>
        )}
      </Section>

      {/* --------------------------------------------------------- details */}
      <Section title="Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand">
            <Input value={brand} onChange={setBrand} placeholder="Ducati" required />
          </Field>
          <Field label="Model (short name)">
            <Input value={model} onChange={setModel} placeholder="Panigale" required />
          </Field>
        </div>

        <Field label="Full name" className="mt-4">
          <Input
            value={fullName}
            onChange={setFullName}
            placeholder="Panigale V4"
            required
          />
        </Field>

        <Field label="Category" className="mt-4">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className={inputClass}
          >
            {props.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Year">
            <Input value={year} onChange={setYear} type="number" required />
          </Field>
          <Field label="Odometer (km)">
            <Input value={km} onChange={setKm} type="number" />
          </Field>
          <Field label="Engine (cc)">
            <Input value={engineCc} onChange={setEngineCc} type="number" />
          </Field>
        </div>

        <Field label="Location / city" className="mt-4">
          <Input value={location} onChange={setLocation} placeholder="Lucknow" />
        </Field>
      </Section>

      {/* ----------------------------------------------------- price/status */}
      <Section title="Price & status">
        <Field label="Price (₹) — leave blank for &ldquo;On request&rdquo;">
          <Input value={price} onChange={setPrice} type="number" placeholder="1580000" />
        </Field>

        <fieldset className="mt-5">
          <legend className="mb-2 text-[13px] font-semibold text-slate">Status</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`rounded-xl border px-3 py-3 text-[13px] font-bold transition-colors ${
                  status === opt.value
                    ? "border-red bg-red/10 text-red"
                    : "border-line text-slate hover:border-slate"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mt-5 flex items-center gap-3">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="size-5 rounded border-line accent-red"
          />
          <span className="text-[14px] text-graphite">
            Show in the homepage &ldquo;Popular bikes&rdquo; showroom
          </span>
        </label>
      </Section>

      {/* --------------------------------------------------- extra details */}
      <Section title="Extra details">
        <p className="-mt-1 mb-4 text-[13px] leading-relaxed text-slate">
          Anything else worth listing for this bike — owners, services done,
          insurance, tyres. These show up in the details table on the website,
          in the order you put them here. Leave it empty and nothing changes.
        </p>

        {extraSpecs.length > 0 && (
          <div className="flex flex-col gap-3">
            {extraSpecs.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={row.label}
                  onChange={(e) =>
                    setExtraSpecs((prev) =>
                      prev.map((r, n) =>
                        n === i ? { ...r, label: e.target.value } : r,
                      ),
                    )
                  }
                  placeholder="Owners"
                  aria-label={`Detail ${i + 1} name`}
                  maxLength={40}
                  className={`${inputClass} flex-1`}
                />
                <input
                  value={row.value}
                  onChange={(e) =>
                    setExtraSpecs((prev) =>
                      prev.map((r, n) =>
                        n === i ? { ...r, value: e.target.value } : r,
                      ),
                    )
                  }
                  placeholder="2"
                  aria-label={`Detail ${i + 1} value`}
                  maxLength={60}
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setExtraSpecs((prev) => prev.filter((_, n) => n !== i))
                  }
                  aria-label={`Remove ${row.label || `detail ${i + 1}`}`}
                  className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-slate transition-colors hover:border-red hover:text-red"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {extraSpecs.length < 20 && (
          <button
            type="button"
            onClick={() =>
              setExtraSpecs((prev) => [...prev, { label: "", value: "" }])
            }
            className={`rounded-xl border-2 border-dashed border-line px-5 py-3 text-[14px] font-bold text-slate transition-colors hover:border-red hover:text-red ${
              extraSpecs.length > 0 ? "mt-3" : ""
            }`}
          >
            + Add a detail
          </button>
        )}
      </Section>

      {error && (
        <p className="mt-4 rounded-xl bg-red/10 px-4 py-3 text-sm text-red">{error}</p>
      )}

      {/* Sticky so Save is always on screen — the form is long enough that a
          plain button at the end reads as "there is no save button" until you
          scroll all the way down. Offset above the mobile tab bar, which is
          fixed to the bottom of the viewport. */}
      <div className="sticky bottom-16 z-30 -mx-5 mt-8 flex gap-3 border-t border-line bg-mist/95 px-5 py-4 backdrop-blur lg:bottom-0 lg:-mx-10 lg:px-10">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-red px-8 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-red-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/bikes")}
          className="rounded-full border border-line px-8 py-3.5 text-[15px] font-bold text-graphite"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-graphite outline-none focus:border-red";

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={inputClass}
    />
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span
        className="text-[13px] font-semibold text-slate"
        dangerouslySetInnerHTML={{ __html: label }}
      />
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
