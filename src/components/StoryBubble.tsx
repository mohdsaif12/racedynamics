"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "@/lib/supabase/env";
import { storyImageUrl } from "@/lib/supabase/storage";
import { InstagramIcon } from "@/components/icons";

type Story = { id: string; image: string; thumb: string; createdAt: string };

const SLIDE_MS = 5000;
const DOUBLE_TAP_MS = 260;
const HOLD_MS = 220;
const SEEN_KEY = "rd-stories-seen";

/**
 * Floating story button, bottom-right. Tap it and today's shop photos play
 * full-screen like an Instagram story:
 *
 *  - tap the right half → next photo, left half → previous
 *  - press and hold → pause
 *  - double-tap → open the shop's Instagram and close the viewer
 *  - each photo auto-advances after 5s; the last one closes the viewer
 *
 * Closing morphs the viewer back into the bubble (shared layoutId).
 *
 * Fetched from the browser, not the server: stories must vanish at exactly
 * 24 hours, and public pages are cached for a day (src/lib/data/cachePolicy.ts),
 * so a server-rendered list would keep showing — and linking to deleted —
 * photos for up to a day. The RLS policy only returns live rows, and the
 * request is a tiny JSON list; photos load only once the viewer opens.
 */
export default function StoryBubble({ instagramUrl }: { instagramUrl: string }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [seenUpTo, setSeenUpTo] = useState<string>("");
  const reduced = useReducedMotion();
  const bubbleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!hasSupabase) return;
    const ctrl = new AbortController();
    fetch(
      `${SUPABASE_URL}/rest/v1/stories?select=id,image_path,thumb_path,created_at&order=created_at.asc`,
      {
        headers: { apikey: SUPABASE_ANON_KEY!, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        signal: ctrl.signal,
      },
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { id: string; image_path: string; thumb_path: string | null; created_at: string }[]) => {
        try {
          setSeenUpTo(localStorage.getItem(SEEN_KEY) ?? "");
        } catch {}
        setStories(
          rows.map((r) => ({
            id: r.id,
            image: storyImageUrl(r.image_path),
            thumb: storyImageUrl(r.thumb_path ?? r.image_path),
            createdAt: r.created_at,
          })),
        );
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const markSeen = useCallback((s: Story) => {
    setSeenUpTo((prev) => {
      if (s.createdAt <= prev) return prev;
      try {
        localStorage.setItem(SEEN_KEY, s.createdAt);
      } catch {}
      return s.createdAt;
    });
  }, []);

  // Pop in on first appearance only; after a close the morph brings it back.
  const [opened, setOpened] = useState(false);

  const close = useCallback(() => {
    setOpen(null);
    // The bubble remounts after the morph; hand focus back to it.
    requestAnimationFrame(() => bubbleRef.current?.focus({ preventScroll: true }));
  }, []);

  if (stories.length === 0) return null;

  const latest = stories[stories.length - 1];
  const unseen = latest.createdAt > seenUpTo;
  const firstUnseen = stories.findIndex((s) => s.createdAt > seenUpTo);

  return (
    <>
      <AnimatePresence>
        {open === null && (
          <motion.button
            key="bubble"
            ref={bubbleRef}
            type="button"
            layoutId={reduced ? undefined : "story"}
            onClick={() => {
              setOpened(true);
              setOpen(firstUnseen === -1 ? 0 : firstUnseen);
            }}
            aria-label={`Watch today's stories (${stories.length})`}
            initial={opened ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ borderRadius: 9999 }}
            className="fixed right-4 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 size-[68px] p-[3px] shadow-lg shadow-black/25 sm:right-6 sm:bottom-6 sm:size-[74px]"
          >
            <span
              aria-hidden
              className={`absolute inset-0 rounded-full ${
                unseen
                  ? "bg-[conic-gradient(from_200deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)]"
                  : "bg-line"
              } ${unseen && !reduced ? "animate-[spin_6s_linear_infinite]" : ""}`}
            />
            <span className="relative block size-full overflow-hidden rounded-full border-[3px] border-white bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element -- 200px thumb, already tiny */}
              <img src={latest.thumb} alt="" className="size-full object-cover" />
            </span>
            {stories.length > 1 && (
              <span className="absolute -top-1 -left-1 grid min-w-5 place-items-center rounded-full bg-red px-1 text-[11px] leading-5 font-bold text-white">
                {stories.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open !== null && (
          <Viewer
            key="viewer"
            stories={stories}
            start={open}
            reduced={!!reduced}
            instagramUrl={instagramUrl}
            onSeen={markSeen}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function Viewer({
  stories,
  start,
  reduced,
  instagramUrl,
  onSeen,
  onClose,
}: {
  stories: Story[];
  start: number;
  reduced: boolean;
  instagramUrl: string;
  onSeen: (s: Story) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(start);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const closeRef = useRef<HTMLButtonElement>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pressStart = useRef(0);

  const story = stories[index];

  const next = useCallback(() => {
    if (index >= stories.length - 1) onClose();
    else setIndex(index + 1);
  }, [index, stories.length, onClose]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => onSeen(story), [story, onSeen]);

  // Warm the next photo so tapping forward doesn't flash black.
  useEffect(() => {
    const n = stories[index + 1];
    if (n) new Image().src = n.image;
  }, [index, stories]);

  // Lock the page behind the viewer and wire up the keyboard.
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      clearTimeout(tapTimer.current);
    };
  }, [next, prev, onClose]);

  const openInstagram = () => {
    window.open(instagramUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  const onPointerDown = () => {
    pressStart.current = Date.now();
    setPaused(true);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setPaused(false);
    if (Date.now() - pressStart.current > HOLD_MS) return; // that was a hold-to-pause

    if (tapTimer.current) {
      // Second tap inside the window → double-tap.
      clearTimeout(tapTimer.current);
      tapTimer.current = undefined;
      openInstagram();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const forward = e.clientX - rect.left > rect.width / 2;
    // Wait to see whether a second tap follows before moving.
    tapTimer.current = setTimeout(() => {
      tapTimer.current = undefined;
      if (forward) next();
      else prev();
    }, DOUBLE_TAP_MS);
  };

  const running = !paused && !!loaded[story.id];

  return (
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Today's stories"
      data-lenis-prevent
    >
      <motion.div
        className="absolute inset-0 bg-black/85"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        layoutId={reduced ? undefined : "story"}
        initial={reduced ? { opacity: 0 } : undefined}
        animate={reduced ? { opacity: 1 } : undefined}
        exit={reduced ? { opacity: 0 } : undefined}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        style={{ borderRadius: 16 }}
        className="relative h-svh w-full overflow-hidden bg-black sm:aspect-[9/16] sm:h-[min(88svh,860px)] sm:w-auto"
      >
        {/* tap / hold surface — sits under the header so the buttons stay clickable */}
        <div
          className="absolute inset-0 touch-manipulation select-none"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => setPaused(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized at upload; skip Vercel's optimiser */}
          <img
            key={story.id}
            src={story.image}
            alt=""
            draggable={false}
            onLoad={() => setLoaded((l) => ({ ...l, [story.id]: true }))}
            onError={next}
            className="size-full object-contain"
          />
          {!loaded[story.id] && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
        </div>

        {/* progress + header */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent px-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-8">
          <div className="flex gap-1">
            {stories.map((s, i) => (
              <span key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
                {i < index && <span className="block h-full w-full bg-white" />}
                {i === index && (
                  <span
                    key={`${s.id}-${index}`}
                    className="block h-full w-full origin-left bg-white"
                    style={{
                      animation: `story-progress ${SLIDE_MS}ms linear forwards`,
                      animationPlayState: running ? "running" : "paused",
                    }}
                    onAnimationEnd={next}
                  />
                )}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-red text-[11px] font-bold text-white">
              RD
            </span>
            <span className="text-[14px] font-semibold text-white">racedynamicslucknow</span>
            <span className="text-[13px] text-white/70">{ago(story.createdAt)}</span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close stories"
              className="pointer-events-auto ml-auto grid size-9 place-items-center rounded-full text-white hover:bg-white/15"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* footer — the button is for mouse users; on phones the double-tap does it */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/60 to-transparent px-3 pt-10 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={openInstagram}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-[13px] font-semibold text-white hover:bg-white/15"
          >
            <InstagramIcon size={16} />
            Double-tap to open Instagram
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ago(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h`;
}
