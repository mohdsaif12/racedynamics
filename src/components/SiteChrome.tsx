"use client";

import { usePathname } from "next/navigation";

/**
 * Public-site chrome — header, footer, floating contact rail — which the
 * dashboard must not have. /admin lives under the root layout (it needs the
 * same <html>, fonts and CSS), so without this the marketing nav renders above
 * the dashboard sidebar, the footer below it, and the floating WhatsApp rail
 * on top of the admin forms.
 *
 * Split out as a Client Component purely because the decision needs the
 * pathname. The header and footer themselves are still rendered on the server
 * and passed in as props, so no extra work moves to the browser — and because
 * usePathname resolves during SSR too, the dashboard never flashes the chrome
 * before hydration removes it.
 */
export default function SiteChrome({
  header,
  footer,
  rail,
  structuredData,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  rail: React.ReactNode;
  structuredData: React.ReactNode;
  children: React.ReactNode;
}) {
  if (usePathname().startsWith("/admin")) return <>{children}</>;

  return (
    <>
      {header}
      <main className="flex-1">{children}</main>
      {footer}
      {rail}
      {structuredData}
    </>
  );
}
