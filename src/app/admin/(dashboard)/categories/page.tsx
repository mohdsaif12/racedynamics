import { getCategoriesForAdmin } from "@/lib/admin/categories";
import CategoryManager from "./CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesForAdmin();
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-bold text-graphite">Categories</h1>
      <p className="mt-1 text-[14px] text-slate">
        These show up as the tabs across the top of the Inventory page and the
        circles on the homepage. To change a circle&rsquo;s photo, go to{" "}
        <a href="/admin/content" className="font-semibold text-red hover:underline">
          Website content
        </a>
        .
      </p>
      <CategoryManager initial={categories} />
    </div>
  );
}
