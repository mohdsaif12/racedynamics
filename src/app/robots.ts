import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The dashboard is behind auth anyway; this keeps it out of the index
      // and stops crawlers burning requests on redirects to the login page.
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
