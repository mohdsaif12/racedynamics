import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — pre-owned superbikes in ${SITE.city}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated rather than a static file so it never goes stale against the brand
 * config, and so there's no binary to hand over at launch. Deliberately typo-
 * graphic: a photo here would be one of the stand-in bike images, and those
 * aren't cleared for use.
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 50% 120%, #2a2a2a 0%, #0a0a0a 55%)",
          padding: "80px",
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#e5132b",
            fontWeight: 700,
          }}
        >
          {SITE.city}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 120,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          {SITE.name.toUpperCase()}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 40,
            color: "rgba(255,255,255,0.72)",
            maxWidth: 900,
          }}
        >
          {SITE.tagline}
        </div>
        <div
          style={{
            marginTop: 56,
            height: 6,
            width: 160,
            background: "#e5132b",
          }}
        />
      </div>
    ),
    size,
  );
}
