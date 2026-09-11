"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

/**
 * The interactive half of the login page. The initial error (if the visitor
 * was bounced here by requireAdmin) is resolved on the server and handed down
 * as a prop — reading it from window.location on the client instead would
 * render a banner the server didn't, which is a hydration mismatch.
 */
export default function LoginForm({
  initialError,
}: {
  initialError: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = getSupabaseBrowser();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.session) {
      // Surfaced verbatim on purpose — "Invalid login credentials" and
      // "Email not confirmed" need different fixes, and guessing which one
      // happened from a generic message wastes everyone's time.
      setError(signInError?.message ?? "Sign-in failed. Try again.");
      setBusy(false);
      return;
    }

    router.push("/admin/bikes");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-white/80">Email</span>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-red"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-white/80">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-red"
        />
      </label>

      {error && (
        <p className="rounded-lg bg-red/10 px-4 py-3 text-sm text-red">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-2 rounded-lg bg-red px-4 py-3 text-base font-bold text-white transition-colors hover:bg-red-dark disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
