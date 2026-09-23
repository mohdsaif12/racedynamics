import type { Metadata } from "next";
import InventoryBrowser from "@/components/inventory/InventoryBrowser";
import { getAllBikes } from "@/lib/data/bikes";
import { getCategories } from "@/lib/data/categories";
import { getSiteSettings } from "@/lib/data/settings";
import { SITE } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const bikes = await getAllBikes();
  return {
    title: "Inventory",
    description: `All ${bikes.length} pre-owned superbikes currently in stock at ${SITE.name}, ${SITE.city}. Filter by category or search by make, model and city.`,
    alternates: { canonical: "/inventory" },
  };
}

/**
 * One full-bleed showcase panel for the whole inventory. The heading is
 * screen-reader only — the panel is the page, exactly as in the reference.
 */
export default async function InventoryPage({
  searchParams,
}: PageProps<"/inventory">) {
  const { category, bike, search } = await searchParams;

  const [bikes, categories, settings] = await Promise.all([
    getAllBikes(),
    getCategories(),
    getSiteSettings(),
  ]);

  const slugs = new Set(categories.map((c) => c.slug));
  const cat =
    typeof category === "string" && slugs.has(category) ? category : "all";
  const initialBike = typeof bike === "string" ? bike : undefined;
  const initialSearch = typeof search === "string" ? search : undefined;

  return (
    <>
      <h1 className="sr-only">
        {SITE.name} inventory in {SITE.city} — {bikes.length} pre-owned superbikes in stock
      </h1>
      <InventoryBrowser
        bikes={bikes}
        categories={categories}
        settings={settings}
        initialCategory={cat}
        initialBike={initialBike}
        initialSearch={initialSearch}
      />
    </>
  );
}
