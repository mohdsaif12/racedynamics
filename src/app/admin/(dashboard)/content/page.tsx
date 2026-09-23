import { getAllSiteContentBlocksForAdmin } from "@/lib/admin/siteContent";
import { getCategoriesForAdmin } from "@/lib/admin/categories";
import WebsiteContentManager from "./WebsiteContentManager";

export default async function AdminContentPage() {
  const [blocks, categories] = await Promise.all([
    getAllSiteContentBlocksForAdmin(),
    getCategoriesForAdmin(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-bold text-graphite">Website content</h1>
      <p className="mt-1 text-[14px] text-slate">
        Homepage images and copy that aren&rsquo;t tied to any bike, review or
        listing — editing these here can&rsquo;t change anything else on the
        site, and leaving one blank just keeps what it launched with.
      </p>
      <WebsiteContentManager blocks={blocks} initialCategories={categories} />
    </div>
  );
}
