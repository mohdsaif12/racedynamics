import { getAccessoryCategories } from "@/lib/admin/accessories";
import AccessoryForm from "../AccessoryForm";

export default async function NewAccessoryPage() {
  const existingCategories = await getAccessoryCategories();
  return <AccessoryForm mode="create" existingCategories={existingCategories} />;
}
