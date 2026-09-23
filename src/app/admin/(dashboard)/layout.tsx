import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/admin/auth";
import { hasSupabase } from "@/lib/supabase/env";
import SignOutButton from "./SignOutButton";

const NAV = [
  { href: "/admin/bikes", label: "Bikes", icon: BikeIcon },
  { href: "/admin/accessories", label: "Accessories", icon: BoxIcon },
  { href: "/admin/enquiries", label: "Enquiries", icon: InboxIcon },
  { href: "/admin/categories", label: "Categories", icon: TagIcon },
  { href: "/admin/testimonials", label: "Reviews", icon: StarIcon },
  { href: "/admin/settings", label: "Site settings", icon: GearIcon },
] as const;

/**
 * Every page under /admin (except /admin/login) is wrapped in this. It's the
 * one place that actually enforces "only staff can be here" — requireAdmin()
 * redirects to /admin/login if there's no session, or back with an error if
 * the signed-in account isn't in admin_users.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasSupabase) {
    return (
      <div className="grid min-h-svh place-items-center bg-ink px-5">
        <div className="max-w-lg rounded-2xl border border-white/10 bg-ink-3 p-8 text-center">
          <h1 className="text-xl font-bold text-white">Database not connected</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            The admin dashboard needs a Supabase project before it can store
            anything. See <code className="rounded bg-white/10 px-1.5 py-0.5">docs/admin-setup.md</code> for
            the one-time setup — it takes about ten minutes.
          </p>
        </div>
      </div>
    );
  }

  await requireAdmin();

  return (
    <div className="flex min-h-svh bg-mist">
      {/* ---------------------------------------------------------- sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-ink lg:flex">
        <Link href="/admin" className="flex items-center gap-2 px-6 py-6">
          <Image
            src="/brand/racedynamics.webp"
            alt="RaceDynamics"
            width={1800}
            height={477}
            unoptimized
            className="h-6 w-auto"
          />
        </Link>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalIcon />
            View live site
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* ------------------------------------------------------- mobile nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-line bg-white lg:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold text-graphite"
          >
            <item.icon />
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
    </div>
  );
}

function InboxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 13h4l1.5 3h7L17 13h4M3 13l2.5-7h13L21 13v6H3v-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function BikeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="5.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 17.5 10 8h5l3.5 9.5M10 8l2 4.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3.5 8 12 4l8.5 4-8.5 4-8.5-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3.5 8v8l8.5 4 8.5-4V8M12 12v8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 12.5 12.5 20 4 11.5V4h7.5L20 12.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.4 9.9l6-.9L12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19 12a7 7 0 0 0-.15-1.4l2-1.5-2-3.4-2.4.9a7 7 0 0 0-2.4-1.4L13.6 3h-3.2l-.45 2.2a7 7 0 0 0-2.4 1.4l-2.4-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .48.05.95.15 1.4l-2 1.5 2 3.4 2.4-.9a7 7 0 0 0 2.4 1.4l.45 2.2h3.2l.45-2.2a7 7 0 0 0 2.4-1.4l2.4.9 2-3.4-2-1.5c.1-.45.15-.92.15-1.4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function ExternalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 5h5v5M19 5l-8 8M8 5H5v14h14v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
