import type { MetadataRoute } from "next";
import { getAllBikes } from "@/lib/data/bikes";
import { getCategories } from "@/lib/data/categories";
import { absoluteUrl } from "@/lib/url";

/** Re-generated hourly, so a bike added in the dashboard shows up in the
 *  sitemap without a redeploy. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [bikes, categories] = await Promise.all([getAllBikes(), getCategories()]);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/inventory"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/sell"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.1 },
  ];

  return [
    ...staticPages,
    ...categories.map((c) => ({
      url: absoluteUrl(`/inventory/${c.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...bikes.map((b) => ({
      url: absoluteUrl(`/bike/${b.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
