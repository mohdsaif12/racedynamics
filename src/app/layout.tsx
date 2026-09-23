import type { Metadata } from "next";
import { Barlow, IBM_Plex_Mono, Saira_Condensed } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { SITE_URL } from "@/lib/url";

/* Bold condensed display + a workmanlike grotesk for body, matching the
   reference site's voice. Mono is kept only for the showcase index rail. */
const saira = Saira_Condensed({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const TITLE = `${SITE.name} — Pre-owned superbikes in ${SITE.city}`;

export const metadata: Metadata = {
  // Without metadataBase, every relative Open Graph image URL below resolves
  // against nothing and social platforms silently drop the preview.
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: TITLE,
    description: SITE.description,
    url: "/",
    locale: "en_IN",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Proves ownership to Search Console / Bing Webmaster Tools, which is what
  // actually gets this site crawled, indexed and eligible to rank in the
  // first place — see docs/seo-checklist.md for where these codes come from
  // and what to do with them once verified. Both env vars are optional; an
  // unset one is simply omitted rather than rendering an empty meta tag.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

/**
 * The document shell, and nothing else.
 *
 * Both halves of this project live under it — the public site in (site), the
 * dashboard in admin — because both need the same <html>, fonts and CSS. Every
 * other thing that used to be here (smooth scrolling, the header, footer,
 * contact rail, and the two Supabase queries that fed them) belongs to the
 * public site alone and now lives in (site)/layout.tsx. The dashboard no
 * longer pays for any of it.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${saira.variable} ${barlow.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-body">
        {children}
      </body>
    </html>
  );
}
