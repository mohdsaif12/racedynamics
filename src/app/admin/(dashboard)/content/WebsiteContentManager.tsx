"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { newStoragePath } from "@/lib/supabase/storage";
import { hasTransparency } from "@/lib/admin/transparency";
import type { AdminSiteContent } from "@/lib/admin/siteContent";
import type { AdminCategory } from "@/lib/admin/categories";
import { revalidateSite } from "../../actions";

const DEFAULT_SELL_IMAGE = "/bikes/diavel-1260s-2021.webp";

export default function WebsiteContentManager({
  initialSellBlock,
  initialCategories,
}: {
  initialSellBlock: AdminSiteContent | null;
  initialCategories: AdminCategory[];
}) {
  return (
    <div className="mt-6 flex flex-col gap-8">
      <SellSection initial={initialSellBlock} />
      <CategoryTiles initial={initialCategories} />
    </div>
  );
}

/* ---------------------------------------------------- Planning to sell --- */

function SellSection({ initial }: { initial: AdminSiteContent | null }) {
  const router = useRouter();
  const [heading, setHeading] = useState(initial?.heading ?? "");
  const [subheading, setSubheading] = useState(initial?.subheading ?? "");
  const [imagePath, setImagePath] = useState(initial?.imagePath ?? null);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? null);
  const [newFile, setNewFile] = useState<{ file: File; previewUrl: string; cutout: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const refresh = async () => {
    await revalidateSite();
    router.refresh();
  };

  const addFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (newFile) URL.revokeObjectURL(newFile.previewUrl);
    setNewFile({ file, previewUrl: URL.createObjectURL(file), cutout: await hasTransparency(file) });
  };

  const removeNewFile = () => {
    if (!newFile) return;
    URL.revokeObjectURL(newFile.previewUrl);
    setNewFile(null);
  };

  const removeCurrentPhoto = async () => {
    if (!imagePath) return;
    if (!confirm("Remove this photo and go back to the default?")) return;
    const supabase = getSupabaseBrowser();
    await supabase.storage.from("site-content").remove([imagePath]);
    await supabase
      .from("site_content")
      .update({ image_path: null })
      .eq("key", "planning_to_sell");
    setImagePath(null);
    setImageUrl(null);
    await refresh();
  };

  const onSave = async () => {
    setSaving(true);
    setSaved(false);
    const supabase = getSupabaseBrowser();

    let path = imagePath;
    if (newFile) {
      path = newStoragePath(newFile.file);
      const { error: uploadErr } = await supabase.storage
        .from("site-content")
        .upload(path, newFile.file, { cacheControl: "31536000" });
      if (uploadErr) {
        setSaving(false);
        alert("Couldn't upload that photo. Try again.");
        return;
      }
      // the old file is orphaned rather than deleted — harmless, same trade-off
      // documented for bike photos in docs/admin-setup.md.
    }

    const { error } = await supabase
      .from("site_content")
      .update({
        heading: heading.trim() || null,
        subheading: subheading.trim() || null,
        image_path: path,
      })
      .eq("key", "planning_to_sell");

    setSaving(false);
    if (error) {
      alert("Couldn't save. Check your connection and try again.");
      return;
    }
    if (newFile) {
      setImagePath(path);
      setImageUrl(newFile.previewUrl);
      setNewFile(null);
    }
    setSaved(true);
    await refresh();
  };

  const preview = newFile?.previewUrl ?? imageUrl ?? DEFAULT_SELL_IMAGE;
  const usingDefault = !imageUrl && !newFile;

  return (
    <Section
      title="Homepage — “Planning to sell?”"
      description="The photo and headline in the sell-your-bike panel near the top of the homepage."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative size-32 shrink-0 overflow-hidden rounded-xl bg-mist">
          <Image src={preview} alt="" fill sizes="128px" className="object-contain p-1" />
          {newFile && (
            <button
              type="button"
              onClick={removeNewFile}
              aria-label="Discard new photo"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/80 text-white"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex-1">
          <p className="text-[13px] leading-relaxed text-slate">
            {usingDefault
              ? "Using the default photo. Upload one to replace it."
              : "Custom photo set."}{" "}
            Needs a <strong className="text-graphite">cut-out with no background</strong> —
            a PNG or WebP where the area around the bike is see-through — to
            float the way it does now.
          </p>
          {newFile && !newFile.cutout && (
            <p className="mt-2 rounded-lg bg-red/10 px-3 py-2 text-[12.5px] text-red">
              That photo still has its background — it will show as a rectangle
              instead of floating.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-line px-4 py-2 text-[13px] font-bold text-graphite transition-colors hover:border-red hover:text-red"
            >
              {usingDefault ? "Upload a photo" : "Replace photo"}
            </button>
            {!usingDefault && (
              <button
                type="button"
                onClick={removeCurrentPhoto}
                className="rounded-full border border-line px-4 py-2 text-[13px] font-bold text-graphite transition-colors hover:border-red hover:text-red"
              >
                Remove (use default)
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => addFile(e.target.files)}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Headline">
          <input
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Planning to sell?"
            className={inputClass}
          />
        </Field>
        <Field label="Subheading">
          <input
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
            placeholder="Sell us your bike"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-red px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-red-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-[13px] font-semibold text-red">Saved.</span>}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------- Category tiles --- */

function CategoryTiles({ initial }: { initial: AdminCategory[] }) {
  return (
    <Section
      title="Homepage — category circles"
      description="One photo per category. A category with no photo set keeps the default it launched with — nothing goes blank."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {initial.map((c) => (
          <CategoryTile key={c.id} category={c} />
        ))}
      </div>
    </Section>
  );
}

function CategoryTile({ category }: { category: AdminCategory }) {
  const router = useRouter();
  const [photoPath, setPhotoPath] = useState(category.photoPath);
  const [photoUrl, setPhotoUrl] = useState(category.photoUrl);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    await revalidateSite();
    router.refresh();
  };

  const onPick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);

    const supabase = getSupabaseBrowser();
    const path = newStoragePath(file);
    const { error: uploadErr } = await supabase.storage
      .from("site-content")
      .upload(path, file, { cacheControl: "31536000" });

    if (uploadErr) {
      setBusy(false);
      alert("Couldn't upload that photo. Try again.");
      return;
    }

    const oldPath = photoPath;
    const { error: updateErr } = await supabase
      .from("categories")
      .update({ photo_path: path })
      .eq("id", category.id);

    setBusy(false);
    if (updateErr) {
      alert("Couldn't save that photo. Try again.");
      return;
    }
    if (oldPath) await supabase.storage.from("site-content").remove([oldPath]);
    setPhotoPath(path);
    setPhotoUrl(URL.createObjectURL(file));
    await refresh();
  };

  const onRemove = async () => {
    if (!photoPath) return;
    if (!confirm(`Remove ${category.name}'s photo and go back to the default?`)) return;
    setBusy(true);

    const supabase = getSupabaseBrowser();
    await supabase.storage.from("site-content").remove([photoPath]);
    const { error } = await supabase
      .from("categories")
      .update({ photo_path: null })
      .eq("id", category.id);

    setBusy(false);
    if (error) {
      alert("Couldn't remove that photo. Try again.");
      return;
    }
    setPhotoPath(null);
    setPhotoUrl(null);
    await refresh();
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-mist">
        {photoUrl ? (
          <Image src={photoUrl} alt="" fill sizes="64px" className="object-contain p-1" />
        ) : (
          <div className="grid h-full place-items-center text-[9px] text-slate">Default</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-graphite">{category.name}</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="text-[12.5px] font-bold text-red hover:underline disabled:opacity-60"
          >
            {photoUrl ? "Replace" : "Upload"}
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="text-[12.5px] font-bold text-slate hover:underline disabled:opacity-60"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files)}
        />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- shared --- */

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-graphite outline-none focus:border-red";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-slate">{label}</span>
      {children}
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-[15px] font-bold text-graphite">{title}</h2>
      <p className="mt-1 text-[13px] text-slate">{description}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}
