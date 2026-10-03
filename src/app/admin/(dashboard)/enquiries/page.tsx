import { getEnquiries } from "@/lib/admin/enquiries";
import EnquiriesList from "./EnquiriesList";

export const metadata = { title: "Sell enquiries" };

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-bold text-graphite">Sell enquiries</h1>

      {enquiries.length === 0 ? (
        <>
          <p className="mt-1 text-[14px] text-slate">
            People who fill in the &ldquo;Sell your bike&rdquo; form land here.
          </p>
          <div className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center">
            <p className="text-[15px] font-semibold text-graphite">No enquiries yet</p>
            <p className="mx-auto mt-2 max-w-[38ch] text-[14px] text-slate">
              When someone submits the form on the Sell your bike page, their
              details show up here with a button to call them.
            </p>
          </div>
        </>
      ) : (
        <EnquiriesList initial={enquiries} />
      )}
    </div>
  );
}
