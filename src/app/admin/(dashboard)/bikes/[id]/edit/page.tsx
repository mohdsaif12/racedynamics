import { notFound } from "next/navigation";
import { getBikeForEdit } from "@/lib/admin/bikes";
import { getCategoriesForAdmin } from "@/lib/admin/categories";
import BikeForm from "../../BikeForm";

export default async function EditBikePage({
  params,
}: PageProps<"/admin/bikes/[id]/edit">) {
  const { id } = await params;
  const [bike, categories] = await Promise.all([
    getBikeForEdit(id),
    getCategoriesForAdmin(),
  ]);

  if (!bike) notFound();

  return <BikeForm mode="edit" bike={bike} categories={categories} />;
}
