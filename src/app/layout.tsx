import type { Metadata } from "next";
import { Barlow, IBM_Plex_Mono, Saira_Condensed } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import SiteChrome from "@/components/SiteChrome";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContactRail from "@/components/ContactRail";
import { SITE } from "@/lib/site";
import { SITE_URL } from "@/lib/url";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { getCategories } from "@/lib/data/categories";
import { getSiteSettings } from "@/lib/data/settings";

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
};

/**
 * Categories and contact details are fetched once here and passed down to the
 * header, footer and floating contact rail — every page shares this one
 * request rather than each component re-fetching the same rows.
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <html
      lang="en"
      className={`${saira.variable} ${barlow.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-body">
        <SmoothScroll>
          <SiteChrome
            header={<SiteHeader categories={categories} />}
            footer={<SiteFooter categories={categories} settings={settings} />}
            rail={<ContactRail settings={settings} />}
            structuredData={<OrganizationJsonLd settings={settings} />}
          >
            {children}
          </SiteChrome>
        </SmoothScroll>
      </body>
    </html>
  );
}
