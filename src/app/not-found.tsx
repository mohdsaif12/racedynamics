import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCategories } from "@/lib/data/categories";
import { getSiteSettings } from "@/lib/data/settings";
import { SITE } from "@/lib/site";

export const metadata = { title: "Page not found" };

/**
 * Shown for any unmatched URL, and by notFound() on a bike slug that no longer
 * exists — which happens in normal use, since sold bikes get deleted while
 * their links live on in WhatsApp threads.
 *
 * It brings its own header and footer. Next renders this file against the
 * ROOT layout, not the (site) one, so an unmatched URL never passes through
 * the group that supplies the chrome — and a 404 with no way to navigate
 * anywhere is how you turn a wrong link into a lost customer.
 */
export default async function NotFound() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <>
      <SiteHeader categories={categories} />
      <main className="mx-auto flex min-h-[60svh] w-full max-w-[1400px] flex-1 flex-col justify-center px-5 py-20 lg:px-10">
      <p className="eyebrow text-red">404</p>
      <h1 className="mt-4 display text-[clamp(2rem,5vw,3.5rem)] text-graphite">
        That page has gone
      </h1>
      <p className="mt-4 max-w-[48ch] text-[17px] text-body">
        If you followed a link to a bike, it has probably been sold. The rest of
        the stock is still here.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/inventory" className="btn-red hover:bg-red-dark">
          Browse the collection
        </Link>
        <Link
          href="/"
          className="btn-dark border border-graphite/20 bg-transparent text-graphite hover:bg-graphite hover:text-white"
        >
          {SITE.name} home
        </Link>
      </div>
      </main>
      <SiteFooter settings={settings} aboutBody={null} />
    </>
  );
}
