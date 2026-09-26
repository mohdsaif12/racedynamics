/**
 * The site's canonical origin, used for sitemap entries, canonical tags and
 * absolute Open Graph image URLs.
 *
 * Order matters. NEXT_PUBLIC_SITE_URL is what you set once the real domain
 * exists and is the only value that produces correct canonicals. VERCEL_URL is
 * the per-deployment hostname Vercel injects, which keeps preview builds
 * self-consistent instead of pointing every preview's OG tags at production.
 * The literal fallback only ever applies to local dev.
 */
const FALLBACK = "http://localhost:3000";

function resolve() {
  // Tolerate a bare domain ("www.example.com") — new URL() in the root
  // layout's metadataBase throws on anything without a scheme, which fails
  // the whole build.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    const withScheme = /^https?:\/\//i.test(explicit) ? explicit : `https://${explicit}`;
    return withScheme.replace(/\/+$/, "");
  }

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

  return FALLBACK;
}

export const SITE_URL = resolve();

/** True once a real domain is configured — production SEO depends on it. */
export const hasCanonicalHost = SITE_URL !== FALLBACK;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
