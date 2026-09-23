import { notFound } from "next/navigation";
import { getAccessoryForEdit, getAccessoryCategories } from "@/lib/admin/accessories";
import AccessoryForm from "../../AccessoryForm";

export default async function EditAccessoryPage({
  params,
}: PageProps<"/admin/accessories/[id]/edit">) {
  const { id } = await params;
  const [accessory, existingCategories] = await Promise.all([
    getAccessoryForEdit(id),
    getAccessoryCategories(),
  ]);

  if (!accessory) notFound();

  return (
    <AccessoryForm mode="edit" accessory={accessory} existingCategories={existingCategories} />
  );
}
