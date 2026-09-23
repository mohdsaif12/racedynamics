import { notFound } from "next/navigation";
import { getAccessoryForEdit } from "@/lib/admin/accessories";
import AccessoryForm from "../../AccessoryForm";

export default async function EditAccessoryPage({
  params,
}: PageProps<"/admin/accessories/[id]/edit">) {
  const { id } = await params;
  const accessory = await getAccessoryForEdit(id);

  if (!accessory) notFound();

  return <AccessoryForm mode="edit" accessory={accessory} />;
}
