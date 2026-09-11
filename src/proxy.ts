import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "@/lib/supabase/env";

/**
 * Keeps the Supabase auth cookie fresh on every request, and bounces signed-out
 * visitors away from /admin/* before any page code runs.
 *
 * This is the cheap first line of defence — "is there a session at all". The
 * authoritative check ("is this session actually one of our admins") lives in
 * src/app/admin/layout.tsx, which can afford a database round trip since it
 * only runs for the handful of people who reach this far.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!request.nextUrl.pathname.startsWith("/admin")) return response;
  if (request.nextUrl.pathname === "/admin/login") return response;

  if (!hasSupabase) {
    // No project configured yet — the admin layout renders setup
    // instructions instead of a login wall, so let the request through.
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
