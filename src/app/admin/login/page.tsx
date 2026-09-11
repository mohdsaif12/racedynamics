import Image from "next/image";
import { hasSupabase } from "@/lib/supabase/env";
import LoginForm from "./LoginForm";

const NOT_ADMIN_MESSAGE =
  "That account signed in fine, but it isn't in the admin_users table yet — so the dashboard won't open it. See docs/admin-setup.md, step 5.";

/**
 * Sign-in for the client's staff. There's no self-signup here on purpose —
 * accounts are created once by whoever set up the database (Supabase
 * dashboard → Authentication → Add user), and their email is added to the
 * admin_users table. See docs/admin-setup.md.
 *
 * This is a Server Component so `?error=` is read server-side; the form
 * itself is the client half.
 */
export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const { error } = await searchParams;
  const initialError = error === "not-an-admin" ? NOT_ADMIN_MESSAGE : null;

  return (
    <Shell>
      {hasSupabase ? (
        <>
          <h1 className="text-xl font-bold text-white">Sign in</h1>
          <p className="mt-2 text-sm text-white/60">
            Manage your bikes and website
          </p>
          <LoginForm initialError={initialError} />
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold text-white">Database not connected</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            The admin dashboard needs a Supabase project before anyone can sign
            in. See{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-[13px]">
              docs/admin-setup.md
            </code>{" "}
            for the one-time setup steps.
          </p>
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh place-items-center bg-ink px-5">
      <div className="w-full max-w-sm">
        <Image
          src="/brand/racedynamics.webp"
          alt="RaceDynamics"
          width={1800}
          height={477}
          unoptimized
          className="mx-auto h-8 w-auto"
        />
        <div className="mt-10 rounded-2xl border border-white/10 bg-ink-3 p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
