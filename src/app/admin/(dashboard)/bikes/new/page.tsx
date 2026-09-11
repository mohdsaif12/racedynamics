import { getCategoriesForAdmin } from "@/lib/admin/categories";
import BikeForm from "../BikeForm";

export default async function NewBikePage() {
  const categories = await getCategoriesForAdmin();

  if (categories.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <p className="text-lg font-bold text-graphite">Add a category first</p>
        <p className="mt-2 text-[14px] text-slate">
          Every bike needs a category (Sport, Cruiser, and so on) before it can
          be added.
        </p>
      </div>
    );
  }

  return <BikeForm mode="create" categories={categories} />;
}
