import Link from "next/link";
import { getAllBikes } from "@/lib/data/bikes";

export default async function AdminHome() {
  const bikes = await getAllBikes();
  const available = bikes.filter((b) => b.status === "available").length;
  const sold = bikes.filter((b) => b.status === "sold" || b.status === "booked").length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-10">
      <h1 className="text-2xl font-bold text-graphite">Welcome back</h1>
      <p className="mt-1 text-[15px] text-slate">
        Here&rsquo;s what&rsquo;s on the site right now.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-3">
        <Stat value={bikes.length} label="Total bikes" />
        <Stat value={available} label="Available" />
        <Stat value={sold} label="Sold / booked" />
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <BigButton
          href="/admin/bikes/new"
          title="Add a bike"
          body="Photos, price, and details — takes about a minute."
        />
        <BigButton
          href="/admin/bikes"
          title="Manage bikes"
          body="Edit prices, mark bikes sold, add photos."
        />
        <BigButton
          href="/admin/categories"
          title="Categories"
          body="Sport, Cruiser, Adventure and the rest."
        />
        <BigButton
          href="/admin/settings"
          title="Site settings"
          body="Phone numbers, address, and social links."
        />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
      <p className="text-3xl font-bold text-graphite">{value}</p>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-slate">
        {label}
      </p>
    </div>
  );
}

function BigButton({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="text-lg font-bold text-graphite">{title}</p>
      <p className="mt-1 text-[14px] text-slate">{body}</p>
    </Link>
  );
}
