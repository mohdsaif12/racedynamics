import type { Metadata } from "next";
import InventoryBrowser from "@/components/inventory/InventoryBrowser";
import { BIKES, CATEGORIES } from "@/lib/inventory";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Inventory",
  description: `All ${BIKES.length} pre-owned superbikes currently in stock at ${SITE.name}, ${SITE.city}. Filter by category or search by make, model and city.`,
};

const SLUGS = new Set<string>(CATEGORIES.map((c) => c.slug));

/**
 * One full-bleed showcase panel for the whole inventory. The heading is
 * screen-reader only — the panel is the page, exactly as in the reference.
 */
export default async function InventoryPage({
  searchParams,
}: PageProps<"/inventory">) {
  const { category, bike } = await searchParams;

  const cat = typeof category === "string" && SLUGS.has(category) ? category : "all";
  const initialBike = typeof bike === "string" ? bike : undefined;

  return (
    <>
      <h1 className="sr-only">
        {SITE.name} inventory — {BIKES.length} superbikes in stock
      </h1>
      <InventoryBrowser
        initialCategory={cat as never}
        initialBike={initialBike}
      />
    </>
  );
}
