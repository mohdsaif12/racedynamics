/**
 * Shown the instant a dashboard link is tapped, while the page's data loads.
 * Without it the old page sat there, apparently frozen, until the new one
 * arrived — most of why the dashboard felt laggy. It also lets <Link>
 * prefetch this shell for every section ahead of time.
 */
export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-5 py-8 lg:px-10" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="h-7 w-40 rounded-lg bg-line" />
      <div className="mt-3 h-4 w-64 rounded bg-line/70" />
      <div className="mt-8 h-12 rounded-full bg-white" />
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl bg-white p-4">
            <div className="size-16 shrink-0 rounded-xl bg-mist" />
            <div className="flex-1">
              <div className="h-4 w-1/2 rounded bg-mist" />
              <div className="mt-2 h-3 w-1/3 rounded bg-mist" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
