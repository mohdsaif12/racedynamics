import SmoothScroll from "@/components/SmoothScroll";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContactRail from "@/components/ContactRail";
import ClosedBanner from "@/components/ClosedBanner";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/JsonLd";
import { getCategories } from "@/lib/data/categories";
import { getSiteSettings } from "@/lib/data/settings";
import { getSiteContentBlock } from "@/lib/data/siteContent";

/**
 * The public site: smooth scrolling, header, footer, floating contact rail.
 *
 * This is a route group, so "(site)" never appears in a URL — the home page is
 * still "/". Its only job is to draw a line between the two halves of the
 * project. Everything here is the public site's, and the dashboard under
 * /admin renders none of it: no Lenis fighting the dashboard for the scroll
 * wheel, no marketing nav above the sidebar, and no categories/settings
 * queries on a page that never shows either.
 *
 * Categories and contact details are fetched once here and passed down, so
 * every public page shares one request rather than each component re-fetching
 * the same rows.
 */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [categories, settings, footerAbout] = await Promise.all([
    getCategories(),
    getSiteSettings(),
    getSiteContentBlock("footer_about"),
  ]);

  return (
    <SmoothScroll>
      <ClosedBanner settings={settings} />
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} aboutBody={footerAbout?.body ?? null} />
      <ContactRail settings={settings} />
      <OrganizationJsonLd settings={settings} />
      <WebSiteJsonLd />
    </SmoothScroll>
  );
}
