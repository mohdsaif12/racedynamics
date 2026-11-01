"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { storyImageUrl } from "@/lib/supabase/storage";
import { STORY_LIFETIME_MS, type AdminStory } from "@/lib/stories";

/**
 * Upload several phone photos at once. Each is shrunk in the browser before
 * upload: a phone photo is 3–8 MB, every visitor who opens the story
 * downloads it from Supabase, and Supabase bills that egress. A 1080px-wide
 * WebP looks identical on a phone screen at roughly a tenth of the size.
 */
export default function StoryManager({ initial }: { initial: AdminStory[] }) {
  const [items, setItems] = useState(initial);
  const [progress, setProgress] = useState<string | null>(null);
  const now = useNow();

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const supabase = getSupabaseBrowser();
    const list = Array.from(files);
    const failed: string[] = [];

    for (const [i, file] of list.entries()) {
      setProgress(`Uploading ${i + 1} of ${list.length}…`);
      try {
        const { full, thumb } = await prepare(file);
        const id = crypto.randomUUID();
        const imagePath = `${id}.${extOf(full)}`;
        const thumbPath = `${id}-thumb.${extOf(thumb)}`;

        const up = await supabase.storage
          .from("stories")
          .upload(imagePath, full, { contentType: full.type, cacheControl: "86400" });
        if (up.error) throw up.error;
        await supabase.storage
          .from("stories")
          .upload(thumbPath, thumb, { contentType: thumb.type, cacheControl: "86400" });

        const { data, error } = await supabase
          .from("stories")
          .insert({ image_path: imagePath, thumb_path: thumbPath })
          .select("id, image_path, thumb_path, created_at")
          .single();
        if (error || !data) {
          await supabase.storage.from("stories").remove([imagePath, thumbPath]);
          throw error;
        }

        setItems((prev) => [
          ...prev,
          {
            id: data.id,
            imagePath: data.image_path,
            thumbPath: data.thumb_path,
            imageUrl: storyImageUrl(data.image_path),
            createdAt: data.created_at,
          },
        ]);
      } catch {
        failed.push(file.name);
      }
    }

    setProgress(null);
    if (failed.length) {
      alert(
        `Couldn't upload: ${failed.join(", ")}.\n\nIf these are iPhone HEIC photos, ` +
          "upload them from the iPhone itself, or save them as JPG first.",
      );
    }
  };

  const remove = async (s: AdminStory) => {
    if (!confirm("Remove this story now?")) return;
    const supabase = getSupabaseBrowser();
    await supabase.storage
      .from("stories")
      .remove(s.thumbPath ? [s.imagePath, s.thumbPath] : [s.imagePath]);
    await supabase.from("stories").delete().eq("id", s.id);
    setItems((prev) => prev.filter((x) => x.id !== s.id));
  };

  const live = items.filter((s) => timeLeft(s, now) > 0);

  return (
    <div className="mt-6">
      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-white px-5 py-10 text-center transition-colors hover:border-red ${
          progress ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <span className="grid size-12 place-items-center rounded-full bg-red text-2xl leading-none text-white">
          +
        </span>
        <span className="text-[15px] font-bold text-graphite">
          {progress ?? "Add today’s photos"}
        </span>
        <span className="text-[13px] text-slate">
          Pick one or many. Upright (portrait) photos look best.
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            upload(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      <p className="mt-6 text-[13px] font-bold uppercase tracking-wide text-slate">
        Live now · {live.length}
      </p>
      {live.length === 0 ? (
        <p className="mt-2 text-[14px] text-slate">
          No stories right now — the story button is hidden on the website
          until you add one.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {live.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- already sized for the screen; skip Vercel's optimiser */}
              <img
                src={s.imageUrl}
                alt=""
                className="aspect-[9/16] w-full bg-mist object-cover"
              />
              <div className="flex items-center justify-between gap-1 px-2 py-2">
                <span className="text-[12px] text-slate">
                  {formatLeft(timeLeft(s, now))} left
                </span>
                <button
                  type="button"
                  onClick={() => remove(s)}
                  className="text-[12px] font-bold text-graphite hover:text-red"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function timeLeft(s: AdminStory, now: number) {
  return new Date(s.createdAt).getTime() + STORY_LIFETIME_MS - now;
}

function formatLeft(ms: number) {
  const mins = Math.max(1, Math.round(ms / 60_000));
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

/** Re-renders once a minute so the countdowns stay honest. */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/** A screen-sized WebP for the viewer and a small square one for the bubble. */
async function prepare(file: File) {
  // `from-image` applies the phone's EXIF rotation, so portrait shots stay upright.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, 1080 / bitmap.width, 1920 / bitmap.height);
    const full = await draw(
      bitmap,
      Math.round(bitmap.width * scale),
      Math.round(bitmap.height * scale),
      0, 0, bitmap.width, bitmap.height,
      0.82,
    );

    const side = Math.min(bitmap.width, bitmap.height);
    const thumb = await draw(
      bitmap,
      200, 200,
      (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side,
      0.7,
    );
    return { full, thumb };
  } finally {
    bitmap.close();
  }
}

function extOf(blob: Blob) {
  return blob.type === "image/webp" ? "webp" : "jpg";
}

async function draw(
  bitmap: ImageBitmap,
  w: number, h: number,
  sx: number, sy: number, sw: number, sh: number,
  quality: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, sx, sy, sw, sh, 0, 0, w, h);
  const encode = (type: string) =>
    new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("encode failed"))),
        type,
        quality,
      ),
    );
  // Browsers that can't write WebP (older Safari) silently hand back a huge
  // PNG instead — catch that and use JPEG.
  const webp = await encode("image/webp");
  return webp.type === "image/webp" ? webp : encode("image/jpeg");
}
