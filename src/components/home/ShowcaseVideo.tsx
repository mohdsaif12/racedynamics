"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A single autoplaying showcase-card video. Split out from Sections.tsx
 * (a Server Component) because onContextMenu is an event handler — Next.js
 * refuses to serialize a function prop on a native element rendered from a
 * Server Component, even a plain <video>.
 *
 * Lazy-gated on scroll position: a bare <video autoPlay> starts fetching and
 * decoding the instant it mounts, regardless of whether it's anywhere near
 * the viewport. With 5 of these on the homepage that meant 5 simultaneous
 * video downloads competing with everything else on first load. Instead, no
 * src is set (so nothing loads) until the card is within ~600px of the
 * viewport, and playback pauses again once it scrolls back out — so only the
 * cards actually on screen are ever decoding at once.
 */
export default function ShowcaseVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (inView) el.play().catch(() => {});
    else el.pause();
  }, [inView]);

  return (
    <video
      ref={ref}
      src={inView ? src : undefined}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
      onContextMenu={(e) => e.preventDefault()}
      aria-hidden
      className="pointer-events-none h-full w-full object-cover"
    />
  );
}
