import { getCategoriesForAdmin } from "@/lib/admin/categories";
import CategoryManager from "./CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesForAdmin();
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-bold text-graphite">Categories</h1>
      <p className="mt-1 text-[14px] text-slate">
        These show up as the tabs across the top of the Inventory page and the
        circles on the homepage. Press <strong>Edit</strong> on a category to
        add or change its photo.
      </p>
      <CategoryManager initial={categories} />
    </div>
  );
}
