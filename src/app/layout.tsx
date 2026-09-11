import type { Metadata } from "next";
import { Barlow, IBM_Plex_Mono, Saira_Condensed } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContactRail from "@/components/ContactRail";
import { SITE } from "@/lib/site";
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

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — Pre-owned superbikes in ${SITE.city}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
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
          <SiteHeader categories={categories} />
          <main className="flex-1">{children}</main>
          <SiteFooter categories={categories} settings={settings} />
          <ContactRail settings={settings} />
        </SmoothScroll>
      </body>
    </html>
  );
}
