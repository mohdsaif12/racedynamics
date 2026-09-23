import Link from "next/link";
import { getAccessoriesForAdmin } from "@/lib/admin/accessories";
import AccessoryRow from "./AccessoryRow";

export default async function AdminAccessoriesPage() {
  const accessories = await getAccessoriesForAdmin();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Accessories</h1>
          <p className="mt-1 text-[14px] text-slate">
            {accessories.length} {accessories.length === 1 ? "item" : "items"} on
            the site. Flip the switch to mark one out of stock.
          </p>
        </div>
        <Link
          href="/admin/accessories/new"
          className="rounded-full bg-red px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-red-dark"
        >
          + Add an accessory
        </Link>
      </div>

      {accessories.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center">
          <p className="text-lg font-bold text-graphite">No accessories yet</p>
          <p className="mt-1 text-[14px] text-slate">
            Add your first one to open the section on the site.
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {accessories.map((a) => (
            <AccessoryRow key={a.id} accessory={a} />
          ))}
        </ul>
      )}
    </div>
  );
}
