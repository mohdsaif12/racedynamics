"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { newStoragePath } from "@/lib/supabase/storage";
import type { AdminAccessory } from "@/lib/admin/accessories";
import { revalidateSite } from "../../actions";

type Props =
  | { mode: "create" }
  | { mode: "edit"; accessory: AdminAccessory };

const STATUS_OPTIONS = [
  { value: "in-stock", label: "In stock" },
  { value: "out-of-stock", label: "Out of stock" },
] as const;

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * One form for both adding and editing an accessory. A single cover photo,
 * not a gallery — see AccessoryForm's counterpart, BikeForm.tsx, for why a
 * bike gets several and this doesn't.
 */
export default function AccessoryForm(props: Props) {
  const router = useRouter();
  const editing = props.mode === "edit";
  const item = editing ? props.accessory : undefined;

  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item?.priceINR != null ? String(item.priceINR) : "");
  const [status, setStatus] = useState(item?.status ?? "in-stock");
  const [featured, setFeatured] = useState(item?.featured ?? false);

  const [existingPhoto, setExistingPhoto] = useState(item?.photoPath ?? null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(item?.photoUrl ?? null);
  const [newFile, setNewFile] = useState<{ file: File; previewUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (newFile) URL.revokeObjectURL(newFile.previewUrl);
    setNewFile({ file, previewUrl: URL.createObjectURL(file) });
  };

  const removeNewFile = () => {
    if (!newFile) return;
    URL.revokeObjectURL(newFile.previewUrl);
    setNewFile(null);
  };

  const deleteExistingPhoto = async () => {
    if (!existingPhoto || !item) return;
    if (!confirm("Remove this photo?")) return;
    setRemovingPhoto(true);

    const supabase = getSupabaseBrowser();
    await supabase.storage.from("accessories").remove([existingPhoto]);
    const { error: updateErr } = await supabase
      .from("accessories")
      .update({ photo_path: null })
      .eq("id", item.id);

    setRemovingPhoto(false);
    if (updateErr) {
      alert("Couldn't remove that photo. Try again.");
      return;
    }
    setExistingPhoto(null);
    setExistingPhotoUrl(null);
    await revalidateSite();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    const supabase = getSupabaseBrowser();

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price_inr: price.trim() ? Number(price) : null,
      status,
      featured,
    };

    let accessoryId = item?.id;

    if (editing) {
      const { error: updateErr } = await supabase
        .from("accessories")
        .update(payload)
        .eq("id", item!.id);
      if (updateErr) {
        setSaving(false);
        setError("Couldn't save. Check your connection and try again.");
        return;
      }
    } else {
      const base = slugify(name) || `accessory-${Date.now()}`;
      let slug = base;
      let insertedId: string | undefined;

      for (let attempt = 0; attempt < 3 && !insertedId; attempt++) {
        const { data, error: insertErr } = await supabase
          .from("accessories")
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
      accessoryId = insertedId;
    }

    if (newFile && accessoryId) {
      const path = newStoragePath(newFile.file);
      const { error: uploadErr } = await supabase.storage
        .from("accessories")
        .upload(path, newFile.file, { cacheControl: "31536000" });
      if (!uploadErr) {
        await supabase.from("accessories").update({ photo_path: path }).eq("id", accessoryId);
      }
    }

    await revalidateSite();
    setSaving(false);
    router.push("/admin/accessories");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl px-5 py-8 lg:px-10">
      <Link
        href="/admin/accessories"
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
        All accessories
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-graphite">
        {editing ? "Edit accessory" : "Add an accessory"}
      </h1>

      <Section title="Photo">
        <div className="flex flex-wrap gap-3">
          {existingPhotoUrl && (
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-mist">
              <Image src={existingPhotoUrl} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={deleteExistingPhoto}
                disabled={removingPhoto}
                aria-label="Remove photo"
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/80 text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>
          )}

          {newFile && (
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-mist">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={newFile.previewUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={removeNewFile}
                aria-label="Remove photo"
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/80 text-white"
              >
                ×
              </button>
            </div>
          )}

          {!existingPhotoUrl && !newFile && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="grid size-24 shrink-0 place-items-center rounded-xl border-2 border-dashed border-line text-slate transition-colors hover:border-red hover:text-red"
            >
              <span className="text-3xl leading-none">+</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => addFile(e.target.files)}
          />
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-slate">
          One photo, shown as a normal square product shot on the accessories
          page — no cut-out needed.
        </p>
      </Section>

      <Section title="Details">
        <Field label="Name">
          <Input value={name} onChange={setName} placeholder="AGV K3 Helmet" required />
        </Field>

        <Field label="Description" className="mt-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Size, colour, condition — whatever's worth knowing"
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Price & status">
        <Field label="Price (₹) — leave blank for &ldquo;On request&rdquo;">
          <Input value={price} onChange={setPrice} type="number" placeholder="4500" />
        </Field>

        <fieldset className="mt-5">
          <legend className="mb-2 text-[13px] font-semibold text-slate">Status</legend>
          <div className="grid grid-cols-2 gap-2">
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
            Show on the homepage
          </span>
        </label>
      </Section>

      {error && (
        <p className="mt-4 rounded-xl bg-red/10 px-4 py-3 text-sm text-red">{error}</p>
      )}

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
          onClick={() => router.push("/admin/accessories")}
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
