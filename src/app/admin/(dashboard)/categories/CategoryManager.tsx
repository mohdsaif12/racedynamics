"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
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
}: {
  category: AdminCategory;
  onSave: (name: string, blurb: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [blurb, setBlurb] = useState(category.blurb);

  if (editing) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm">
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
      <div className="min-w-0">
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
