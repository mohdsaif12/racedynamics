import { getEnquiries } from "@/lib/admin/enquiries";
import EnquiryCard from "./EnquiryCard";

export const metadata = { title: "Sell enquiries" };

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();
  const fresh = enquiries.filter((e) => e.status === "new").length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-bold text-graphite">Sell enquiries</h1>
      <p className="mt-1 text-[14px] text-slate">
        {enquiries.length === 0
          ? "People who fill in the “Sell your bike” form land here."
          : `${enquiries.length} total · ${fresh} still to call`}
      </p>

      {enquiries.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="text-[15px] font-semibold text-graphite">
            No enquiries yet
          </p>
          <p className="mx-auto mt-2 max-w-[38ch] text-[14px] text-slate">
            When someone submits the form on the Sell your bike page, their
            details show up here with a button to call them.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {enquiries.map((e) => (
            <EnquiryCard key={e.id} enquiry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
