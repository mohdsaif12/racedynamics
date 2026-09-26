"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveN8nWebhook, verifyWebhookPassword } from "../../n8n-actions";

/**
 * The n8n booking webhook URL, locked until the admin re-enters their login
 * password. The lock is real, not cosmetic: the database only accepts a new
 * URL through set_n8n_booking_webhook(), which checks the password itself
 * (migration 0011). Unlocking here just checks it early so the admin isn't
 * told "wrong password" only after typing a new URL.
 */
export default function N8nWebhookForm({ initialUrl }: { initialUrl: string }) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const unlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await verifyWebhookPassword(password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setUnlocked(true);
    });
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await saveN8nWebhook(password, url);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      lock();
      setSaved(true);
      router.refresh();
    });
  };

  const lock = () => {
    setUnlocked(false);
    setPassword("");
  };

  const cancel = () => {
    setUrl(initialUrl);
    setError("");
    lock();
  };

  return (
    <div id="n8n" className="mt-6 scroll-mt-6 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate">
          n8n booking webhook
        </h2>
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold ${
            unlocked ? "bg-emerald-600/10 text-emerald-700" : "bg-mist text-slate"
          }`}
        >
          <LockIcon open={unlocked} />
          {unlocked ? "Unlocked" : "Locked"}
        </span>
      </div>
      <p className="mt-2 text-[14px] text-slate">
        New bookings and appointment changes from the Appointments tab are sent
        here as JSON, so n8n can create the booking and message the customer
        on WhatsApp.
      </p>

      <form onSubmit={unlocked ? save : unlock} className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-slate">Webhook URL</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            readOnly={!unlocked}
            placeholder="https://your-n8n.app/webhook/racedynamics-booking"
            className={`${inputClass} ${unlocked ? "" : "cursor-not-allowed bg-mist text-slate"}`}
          />
        </label>

        {!unlocked && (
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-slate">
              Your admin password (to edit)
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </label>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-red px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-red-dark disabled:opacity-60"
          >
            {pending ? "Checking…" : unlocked ? "Save webhook" : "Unlock to edit"}
          </button>
          {unlocked && (
            <button
              type="button"
              onClick={cancel}
              className="rounded-full border border-line px-6 py-3 text-[14px] font-semibold text-graphite"
            >
              Cancel
            </button>
          )}
          {error && <span className="text-[14px] font-semibold text-red">{error}</span>}
          {saved && <span className="text-[14px] font-semibold text-red">Saved.</span>}
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-graphite outline-none focus:border-red";

function LockIcon({ open }: { open: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="1.6" stroke="currentColor" strokeWidth="2" />
      <path
        d={open ? "M8 11V8a4 4 0 0 1 7.5-2" : "M8 11V8a4 4 0 0 1 8 0v3"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
