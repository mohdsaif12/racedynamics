"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

/**
 * Change the signed-in admin's own password. The current password is checked
 * first (by signing in with it) so an unlocked laptop left on the dashboard
 * isn't enough to lock the owner out of their own account.
 */
export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmNext, setConfirmNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);

    if (next.length < 8) return setError("Use at least 8 characters.");
    if (next !== confirmNext) return setError("The two new passwords don't match.");
    if (next === current) return setError("That's the same as your current password.");

    setBusy(true);
    const supabase = getSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      setBusy(false);
      return setError("Your session has expired. Sign in again and retry.");
    }

    const { error: checkErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current,
    });
    if (checkErr) {
      setBusy(false);
      return setError("Your current password is incorrect.");
    }

    const { error: updateErr } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (updateErr) {
      return setError(updateErr.message || "Couldn't change the password. Try again.");
    }

    setCurrent("");
    setNext("");
    setConfirmNext("");
    setDone(true);
  };

  return (
    <form
      id="password"
      onSubmit={onSubmit}
      className="mt-6 scroll-mt-6 rounded-2xl bg-white p-6 shadow-sm"
    >
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate">
        Change password
      </h2>
      <div className="mt-4 flex flex-col gap-4">
        <PasswordField
          label="Current password"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />
        <PasswordField
          label="New password (at least 8 characters)"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm new password"
          value={confirmNext}
          onChange={setConfirmNext}
          autoComplete="new-password"
        />
      </div>

      {error && <p className="mt-3 text-[13px] font-semibold text-red">{error}</p>}
      {done && (
        <p className="mt-3 text-[13px] font-semibold text-green-700">
          Password changed. Use the new one next time you sign in.
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !current || !next || !confirmNext}
        className="mt-5 rounded-full bg-ink px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-graphite disabled:opacity-50"
      >
        {busy ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-slate">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-graphite outline-none focus:border-red"
      />
    </label>
  );
}
