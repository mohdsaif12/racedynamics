import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata = { title: "Page not found" };

/** Shown for any unmatched URL, and by notFound() on a bike slug that no
 *  longer exists — which will happen in normal use, since sold bikes get
 *  deleted while their links live on in WhatsApp threads. */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60svh] max-w-[1400px] flex-col justify-center px-5 py-20 lg:px-10">
      <p className="eyebrow text-red">404</p>
      <h1 className="mt-4 display text-[clamp(2rem,5vw,3.5rem)] text-graphite">
        That page has gone
      </h1>
      <p className="mt-4 max-w-[48ch] text-[17px] text-body">
        If you followed a link to a bike, it has probably been sold. The rest of
        the stock is still here.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/inventory" className="btn-red hover:bg-red-dark">
          Browse the collection
        </Link>
        <Link
          href="/"
          className="btn-dark border border-graphite/20 bg-transparent text-graphite hover:bg-graphite hover:text-white"
        >
          {SITE.name} home
        </Link>
      </div>
    </div>
  );
}
