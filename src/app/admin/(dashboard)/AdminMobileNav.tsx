"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Phone bottom bar. Eight sections don't fit side by side on a phone — the
 * labels ran into each other — so this scrolls sideways with short labels,
 * and keeps the current section highlighted and scrolled into view.
 */
export default function AdminMobileNav({
  items,
}: {
  items: { href: string; label: string; icon: React.ReactNode }[];
}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>("[aria-current=page]");
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav
      ref={navRef}
      aria-label="Dashboard"
      className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-line bg-white pb-[env(safe-area-inset-bottom)] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-w-[76px] flex-1 shrink-0 flex-col items-center gap-1 whitespace-nowrap px-2 py-2.5 text-[11px] font-semibold ${
              active ? "text-red" : "text-graphite"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
