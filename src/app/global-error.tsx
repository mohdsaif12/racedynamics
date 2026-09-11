"use client";

import { useEffect } from "react";

/**
 * The outermost boundary. error.tsx renders *inside* the root layout, so it
 * cannot catch a failure in the layout itself — and this layout fetches
 * categories and site settings from Supabase on every request. If that throws,
 * this is the only thing standing between the visitor and a blank white page.
 *
 * It replaces the root layout entirely, so it has to bring its own <html> and
 * <body>, and it cannot rely on the fonts or CSS variables the layout sets up.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Nothing else will report this one — the layout that would have mounted
    // any error tracking is exactly what failed.
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          background: "#141414",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "2rem 1.25rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "34rem" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>
            The site is having a moment
          </h1>
          <p
            style={{
              marginTop: "0.9rem",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.72)",
            }}
          >
            Something went wrong at our end. Reloading usually fixes it.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.6rem",
              border: 0,
              borderRadius: "999px",
              background: "#e5132b",
              color: "#fff",
              padding: "0.85rem 2rem",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
