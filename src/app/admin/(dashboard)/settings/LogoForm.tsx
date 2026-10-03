"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { newStoragePath } from "@/lib/supabase/storage";
import { revalidateSite } from "../../actions";

const DEFAULT_LOGO = "/brand/racedynamics-full.svg";

/**
 * Header logo. Saves the moment a file is picked, like the category photos
 * on /admin/content — there's nothing else on this card to batch it with.
 * The file goes in the "site-content" bucket; the bundled logo is the
 * fallback whenever none is set.
 */
export default function LogoForm({
  initialPath,
  initialUrl,
}: {
  initialPath?: string;
  initialUrl?: string;
}) {
  const router = useRouter();
  const [path, setPath] = useState(initialPath ?? null);
  const [url, setUrl] = useState(initialUrl ?? null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const save = async (nextPath: string | null) => {
    const supabase = getSupabaseBrowser();
    const { error } = await supabase
      .from("site_settings")
      .update({ logo_path: nextPath })
      .eq("id", 1);
    if (error) {
      alert(
        error.message.includes("logo_path")
          ? "The database needs updating before a logo can be saved (supabase/migrations/0014_phone_groups_and_logo.sql)."
          : "Couldn't save the logo. Try again.",
      );
      return false;
    }
    return true;
  };

  const onPick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);

    const supabase = getSupabaseBrowser();
    const newPath = newStoragePath(file);
    const { error: uploadErr } = await supabase.storage
      .from("site-content")
      .upload(newPath, file, { cacheControl: "31536000" });
    if (uploadErr) {
      setBusy(false);
      alert("Couldn't upload that file. Try again.");
      return;
    }

    if (!(await save(newPath))) {
      await supabase.storage.from("site-content").remove([newPath]);
      setBusy(false);
      return;
    }
    if (path) await supabase.storage.from("site-content").remove([path]);
    setPath(newPath);
    setUrl(URL.createObjectURL(file));
    setBusy(false);
    await revalidateSite();
    router.refresh();
  };

  const onReset = async () => {
    if (!path || !confirm("Go back to the original logo?")) return;
    setBusy(true);
    if (await save(null)) {
      await getSupabaseBrowser().storage.from("site-content").remove([path]);
      setPath(null);
      setUrl(null);
      await revalidateSite();
      router.refresh();
    }
    setBusy(false);
  };

  return (
    <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate">
        Header logo
      </h2>
      <p className="mt-1 text-[13px] text-slate">
        Shown at the top of every page. A PNG with a transparent background
        works best — it sits on the black header bar.
      </p>

      <div className="mt-4 grid h-24 place-items-center rounded-xl bg-ink px-6">
        {/* eslint-disable-next-line @next/next/no-img-element -- preview of
            a local object URL or a storage file; nothing to optimise. */}
        <img src={url ?? DEFAULT_LOGO} alt="Current logo" className="max-h-16 w-auto" />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-full bg-red px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-red-dark disabled:opacity-60"
        >
          {busy ? "Saving…" : "Upload new logo"}
        </button>
        {path && (
          <button
            type="button"
            onClick={onReset}
            disabled={busy}
            className="rounded-full border border-line px-6 py-2.5 text-[14px] font-bold text-graphite hover:border-red hover:text-red disabled:opacity-60"
          >
            Use original
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/webp,image/svg+xml,image/jpeg"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
