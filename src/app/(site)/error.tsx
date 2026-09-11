"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Catches render errors anywhere under the root layout — most plausibly a
 * Supabase outage during a page render. Without this the visitor gets Next's
 * unstyled default, which in production says only "Application error".
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60svh] max-w-[1400px] flex-col justify-center px-5 py-20 lg:px-10">
      <p className="eyebrow text-red">Something broke</p>
      <h1 className="mt-4 display text-[clamp(2rem,5vw,3.5rem)] text-graphite">
        This page didn&rsquo;t load
      </h1>
      <p className="mt-4 max-w-[48ch] text-[17px] text-body">
        Our end, not yours. Try again — and if it keeps happening, call us and
        we&rsquo;ll sort it out over the phone.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={reset} className="btn-red hover:bg-red-dark">
          Try again
        </button>
        <Link
          href="/"
          className="btn-dark border border-graphite/20 bg-transparent text-graphite hover:bg-graphite hover:text-white"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
