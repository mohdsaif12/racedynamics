import Link from "next/link";
import { getAllBikes } from "@/lib/data/bikes";
import { getCategories } from "@/lib/data/categories";
import BikeRow from "./BikeRow";

export default async function AdminBikesPage() {
  const [bikes, categories] = await Promise.all([getAllBikes(), getCategories()]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Bikes</h1>
          <p className="mt-1 text-[14px] text-slate">
            {bikes.length} {bikes.length === 1 ? "bike" : "bikes"} on the site.
            Flip the switch to mark one sold.
          </p>
        </div>
        <Link
          href="/admin/bikes/new"
          className="rounded-full bg-red px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-red-dark"
        >
          + Add a bike
        </Link>
      </div>

      {bikes.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center">
          <p className="text-lg font-bold text-graphite">No bikes yet</p>
          <p className="mt-1 text-[14px] text-slate">
            Add your first one to get the site started.
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {bikes.map((bike) => (
            <BikeRow key={bike.id} bike={bike} categories={categories} />
          ))}
        </ul>
      )}
    </div>
  );
}
