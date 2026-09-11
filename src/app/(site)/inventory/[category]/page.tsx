import { permanentRedirect } from "next/navigation";
import { getCategories } from "@/lib/data/categories";

/**
 * The inventory now lives on a single page, so a category URL becomes a
 * pre-filtered view of it rather than a route of its own. Redirecting keeps
 * every existing link — header flyout, footer, breadcrumbs, anything already
 * shared — pointing somewhere real.
 */
export default async function CategoryRedirect({
  params,
}: PageProps<"/inventory/[category]">) {
  const { category } = await params;
  const categories = await getCategories();
  const found = categories.find((c) => c.slug === category);
  permanentRedirect(found ? `/inventory?category=${found.slug}` : "/inventory");
}
