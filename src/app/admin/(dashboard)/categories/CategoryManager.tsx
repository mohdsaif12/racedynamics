"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { newStoragePath } from "@/lib/supabase/storage";
import type { AdminCategory } from "@/lib/admin/categories";
import { revalidateSite } from "../../actions";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoryManager({ initial }: { initial: AdminCategory[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState("");
  const [blurb, setBlurb] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    await revalidateSite();
    router.refresh();
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);

    const supabase = getSupabaseBrowser();
    const slug = slugify(name);
    const nextOrder = Math.max(0, ...categories.map((c) => c.sortOrder)) + 1;

    const { data, error: insertErr } = await supabase
      .from("categories")
      .insert({ slug, name: name.trim(), blurb: blurb.trim(), sort_order: nextOrder })
      .select("id, slug, name, blurb, sort_order")
      .single();

    setBusy(false);
    if (insertErr || !data) {
      setError(
        insertErr?.code === "23505"
          ? "A category with a similar name already exists."
          : "Couldn't add that category. Try again.",
      );
      return;
    }

    setCategories((prev) => [
      ...prev,
      {
        id: data.id,
        slug: data.slug,
        name: data.name,
        blurb: data.blurb,
        sortOrder: data.sort_order,
        photoPath: null,
        photoUrl: null,
      },
    ]);
    setName("");
    setBlurb("");
    await refresh();
  };

  const updateCategory = async (id: string, name: string, blurb: string) => {
    const supabase = getSupabaseBrowser();
    await supabase.from("categories").update({ name, blurb }).eq("id", id);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, blurb } : c)),
    );
    await refresh();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Remove this category?")) return;
    const supabase = getSupabaseBrowser();
    const { error: delErr } = await supabase.from("categories").delete().eq("id", id);
    if (delErr) {
      alert(
        "Can't remove a category that still has bikes in it. Move or delete those bikes first.",
      );
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await refresh();
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      {categories.map((c) => (
        <CategoryRow
          key={c.id}
          category={c}
          onSave={(name, blurb) => updateCategory(c.id, name, blurb)}
          onDelete={() => deleteCategory(c.id)}
          onPhotoChange={async (photoPath, photoUrl) => {
            setCategories((prev) =>
              prev.map((x) => (x.id === c.id ? { ...x, photoPath, photoUrl } : x)),
            );
            await refresh();
          }}
        />
      ))}

      <form
        onSubmit={addCategory}
        className="mt-3 rounded-2xl border-2 border-dashed border-line bg-white p-5"
      >
        <p className="text-[13px] font-bold uppercase tracking-wide text-slate">
          Add a category
        </p>
        <div className="mt-3 flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Naked"
            required
            className="rounded-xl border border-line px-4 py-3 text-[15px] outline-none focus:border-red"
          />
          <input
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            placeholder="Short description shown on the site"
            className="rounded-xl border border-line px-4 py-3 text-[15px] outline-none focus:border-red"
          />
          {error && <p className="text-[13px] text-red">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="self-start rounded-full bg-red px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-red-dark disabled:opacity-60"
          >
            {busy ? "Adding…" : "Add category"}
          </button>
        </div>
      </form>
    </div>
  );
}

function CategoryRow({
  category,
  onSave,
  onDelete,
  onPhotoChange,
}: {
  category: AdminCategory;
  onSave: (name: string, blurb: string) => void;
  onDelete: () => void;
  onPhotoChange: (photoPath: string | null, photoUrl: string | null) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [blurb, setBlurb] = useState(category.blurb);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Photos save immediately rather than waiting on "Save" — same as the
     category tiles on /admin/content, which edit the same column. */
  const onPickPhoto = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setPhotoBusy(true);

    const supabase = getSupabaseBrowser();
    const path = newStoragePath(file);
    const { error: uploadErr } = await supabase.storage
      .from("site-content")
      .upload(path, file, { cacheControl: "31536000" });
    if (uploadErr) {
      setPhotoBusy(false);
      alert("Couldn't upload that photo. Try again.");
      return;
    }

    const { error: updateErr } = await supabase
      .from("categories")
      .update({ photo_path: path })
      .eq("id", category.id);
    if (updateErr) {
      await supabase.storage.from("site-content").remove([path]);
      setPhotoBusy(false);
      alert("Couldn't save that photo. Try again.");
      return;
    }

    if (category.photoPath) {
      await supabase.storage.from("site-content").remove([category.photoPath]);
    }
    await onPhotoChange(path, URL.createObjectURL(file));
    setPhotoBusy(false);
  };

  const onRemovePhoto = async () => {
    if (!category.photoPath) return;
    if (!confirm(`Remove ${category.name}'s photo and go back to the default?`)) return;
    setPhotoBusy(true);

    const supabase = getSupabaseBrowser();
    const { error } = await supabase
      .from("categories")
      .update({ photo_path: null })
      .eq("id", category.id);
    if (error) {
      setPhotoBusy(false);
      alert("Couldn't remove that photo. Try again.");
      return;
    }
    await supabase.storage.from("site-content").remove([category.photoPath]);
    await onPhotoChange(null, null);
    setPhotoBusy(false);
  };

  if (editing) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <Thumb url={category.photoUrl} size="size-20" />
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-slate">
              Photo on the homepage circle
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoBusy}
                className="rounded-full border border-line px-4 py-1.5 text-[13px] font-bold text-graphite hover:border-red hover:text-red disabled:opacity-60"
              >
                {photoBusy ? "Uploading…" : category.photoUrl ? "Change photo" : "Add photo"}
              </button>
              {category.photoUrl && (
                <button
                  type="button"
                  onClick={onRemovePhoto}
                  disabled={photoBusy}
                  className="rounded-full px-3 py-1.5 text-[13px] font-bold text-slate hover:text-red disabled:opacity-60"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onPickPhoto(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-line px-4 py-2.5 text-[15px] outline-none focus:border-red"
          />
          <input
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            className="rounded-xl border border-line px-4 py-2.5 text-[15px] outline-none focus:border-red"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              onSave(name, blurb);
              setEditing(false);
            }}
            className="rounded-full bg-red px-5 py-2 text-[13px] font-bold text-white"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-full border border-line px-5 py-2 text-[13px] font-bold text-graphite"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <Thumb url={category.photoUrl} size="size-12" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-graphite">{category.name}</p>
        {category.blurb && (
          <p className="mt-0.5 truncate text-[13px] text-slate">{category.blurb}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full border border-line px-4 py-2 text-[13px] font-bold text-graphite hover:border-red hover:text-red"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full border border-line px-4 py-2 text-[13px] font-bold text-graphite hover:border-red hover:text-red"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function Thumb({ url, size }: { url: string | null; size: string }) {
  return (
    <div className={`relative ${size} shrink-0 overflow-hidden rounded-full bg-mist`}>
      {url ? (
        <Image src={url} alt="" fill unoptimized className="object-contain p-1" />
      ) : (
        <div className="grid h-full place-items-center text-[9px] text-slate">Default</div>
      )}
    </div>
  );
}
