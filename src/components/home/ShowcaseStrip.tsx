"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import NextImage from "next/image";
import ShowcaseVideo from "@/components/home/ShowcaseVideo";

export type ShowcaseItem =
  | { kind: "video"; src: string }
  | { kind: "image"; src: string; alt: string };

/**
 * The tilted row of showcase cards, plus a full-screen viewer.
 *
 * Every card fits on screen at once, phone included — the row used to be a
 * sideways scroller of big cards with nothing to tell you it scrolled, so
 * most people only ever saw one or two. Tapping a card opens the viewer at
 * that card; from there you swipe (or use the arrows / arrow keys) through
 * the rest.
 */
export default function ShowcaseStrip({ items }: { items: ShowcaseItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const cols = Math.min(items.length, 5);

  return (
    <>
      <ul
        className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-2 px-3 sm:gap-5 sm:px-5 lg:px-10"
        style={{ "--cols": cols } as React.CSSProperties}
      >
        {items.map((item, i) => (
          <li
            key={item.src}
            className="w-[calc((100%_-_(var(--cols)_-_1)*0.5rem)/var(--cols))] sm:w-1/5 sm:max-w-56"
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open ${item.kind === "video" ? "video" : "photo"} ${i + 1} of ${items.length}`}
              className={`group relative grid aspect-[3/5] w-full -rotate-[8deg] place-items-center overflow-hidden bg-mist shadow-sm transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] ${
                i % 2 ? "translate-y-[14px] sm:translate-y-[34px]" : ""
              }`}
            >
              {item.kind === "video" ? (
                <ShowcaseVideo src={item.src} />
              ) : (
                <NextImage
                  src={item.src}
                  alt={item.alt}
                  width={1400}
                  height={900}
                  className="h-auto w-[165%] max-w-none"
                />
              )}
              <span
                aria-hidden
                className="absolute bottom-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-black/55 text-white transition-colors group-hover:bg-red sm:bottom-3 sm:right-3 sm:size-9"
              >
                {item.kind === "video" ? <PlayIcon /> : <ExpandIcon />}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open !== null && (
        <Viewer items={items} start={open} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

/* ------------------------------------------------------------- viewer --- */

function Viewer({
  items,
  start,
  onClose,
}: {
  items: ShowcaseItem[];
  start: number;
  onClose: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [index, setIndex] = useState(start);
  // Held in a ref so a parent re-render handing in a new function can't
  // re-run the mount effect below (which would snap back to `start`).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const go = useCallback(
    (to: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(items.length - 1, to));
      track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    },
    [items.length],
  );

  // Jump straight to the tapped card, lock the page behind, wire keys.
  useEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = start * track.clientWidth;

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [start]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  // Only the slide on screen plays; the rest pause and rewind.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        v.muted = false;
        v.play().catch(() => {
          // Browser refused sound without a fresh tap — play muted; the
          // controls let them unmute.
          v.muted = true;
          v.play().catch(() => {});
        });
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [index]);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== index) setIndex(i);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Showcase"
      data-lenis-prevent
      className="fixed inset-0 z-[100] flex flex-col bg-black"
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="figure-nums text-[13px] font-semibold tracking-[0.14em] text-white/70">
          {index + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-red"
        >
          <CloseIcon />
        </button>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div
            key={item.src}
            className="grid h-full w-full shrink-0 snap-center place-items-center px-3 pb-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            {item.kind === "video" ? (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                // Neighbours preload so a swipe lands on a ready video;
                // anything further away stays unloaded.
                src={Math.abs(i - index) <= 1 ? item.src : undefined}
                preload={Math.abs(i - index) <= 1 ? "auto" : "none"}
                loop
                playsInline
                controls
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload noremoteplayback noplaybackrate"
                onContextMenu={(e) => e.preventDefault()}
                className="max-h-full max-w-full bg-black object-contain"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element -- full
                 size view of an image the page already loaded. */
              <img src={item.src} alt={item.alt} className="max-h-full max-w-full object-contain" />
            )}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <NavButton side="left" disabled={index === 0} onClick={() => go(index - 1)} />
          <NavButton side="right" disabled={index === items.length - 1} onClick={() => go(index + 1)} />
          <div className="flex justify-center gap-2 pb-5">
            {items.map((item, i) => (
              <button
                key={item.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-red" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}

function NavButton({
  side,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous" : "Next"}
      className={`absolute top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-red disabled:pointer-events-none disabled:opacity-0 sm:grid ${
        side === "left" ? "left-4" : "right-4"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={side === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-0.5 size-3 sm:size-4">
      <path d="M7 4.5v15l13-7.5-13-7.5Z" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-3 sm:size-4">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
