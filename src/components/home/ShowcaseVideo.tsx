"use client";

/**
 * A single autoplaying showcase-card video. Split out from Sections.tsx
 * (a Server Component) because onContextMenu is an event handler — Next.js
 * refuses to serialize a function prop on a native element rendered from a
 * Server Component, even a plain <video>.
 */
export default function ShowcaseVideo({ src }: { src: string }) {
  return (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      disableRemotePlayback
      controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
      onContextMenu={(e) => e.preventDefault()}
      aria-hidden
      className="pointer-events-none h-full w-full object-cover"
    />
  );
}
