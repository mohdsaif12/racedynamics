import type { Metadata } from "next";

/**
 * Covers both admin/(dashboard) and admin/login — robots.txt already
 * disallows /admin, but that only stops crawling, not indexing a URL Google
 * discovers some other way (a stray external link, browser history sync).
 * This is the actual "never show this in search results" signal.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
