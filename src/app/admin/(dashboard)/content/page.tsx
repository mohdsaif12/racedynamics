import { getSiteContentBlockForAdmin } from "@/lib/admin/siteContent";
import { getCategoriesForAdmin } from "@/lib/admin/categories";
import WebsiteContentManager from "./WebsiteContentManager";

export default async function AdminContentPage() {
  const [sellBlock, categories] = await Promise.all([
    getSiteContentBlockForAdmin("planning_to_sell"),
    getCategoriesForAdmin(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-bold text-graphite">Website content</h1>
      <p className="mt-1 text-[14px] text-slate">
        Homepage images and text that aren&rsquo;t tied to any bike — editing
        these here can&rsquo;t change anything else on the site, and leaving
        one blank just keeps the photo it launched with.
      </p>
      <WebsiteContentManager
        initialSellBlock={sellBlock}
        initialCategories={categories}
      />
    </div>
  );
}
