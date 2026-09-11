"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { SiteSettings } from "@/lib/data/types";
import { whatsappLink } from "@/lib/data/links";

/**
 * Lead capture for the sell-us page. Writes straight to sell_enquiries, which
 * the client sees under /admin/enquiries.
 *
 * No photo upload here on purpose. It would mean an anonymous-writable storage
 * bucket, which is a standing invitation to fill the client's quota with
 * whatever strangers feel like uploading. Photos go over WhatsApp instead —
 * which is how the sellers actually behave anyway — and the success state
 * hands them that link the moment the enquiry lands.
 */
export default function SellForm({ settings }: { settings: SiteSettings }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bike, setBike] = useState("");
  const [year, setYear] = useState("");
  const [km, setKm] = useState("");
  const [expected, setExpected] = useState("");
  const [notes, setNotes] = useState("");
  // Bots fill every field they find; people never see this one.
  const [website, setWebsite] = useState("");

  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (website) return; // honeypot tripped — silently drop
    setError(null);

    if (name.trim().length < 2 || phone.trim().length < 6 || bike.trim().length < 2) {
      setError("Please fill in your name, phone number and which bike it is.");
      return;
    }

    setBusy(true);
    const supabase = getSupabaseBrowser();
    const { error: insertError } = await supabase.from("sell_enquiries").insert({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      bike: bike.trim(),
      year: year.trim() ? Number(year) : null,
      km: km.trim() ? Number(km) : null,
      expected_inr: expected.trim() ? Number(expected) : null,
      notes: notes.trim(),
      status: "new",
    });
    setBusy(false);

    if (insertError) {
      setError(
        "That didn't send. Please try again, or message us on WhatsApp — the link is below.",
      );
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="border border-line p-8">
        <h2 className="display text-2xl text-graphite">Got it — thank you.</h2>
        <p className="mt-3 max-w-[46ch] text-[15px] text-body">
          We&rsquo;ll call you on <strong>{phone}</strong> within 24 hours with a
          number. Send photos over WhatsApp in the meantime and we can quote
          faster — both sides, the clocks, and anything you&rsquo;d want to see
          if you were buying it.
        </p>
        <a
          href={whatsappLink(settings, bike)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-red mt-6 hover:bg-red-dark"
        >
          Send photos on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-line p-6 sm:p-8">
      <h2 className="eyebrow text-body">Get a quote</h2>
      <p className="mt-3 max-w-[46ch] text-sm text-body">
        Takes a minute. We&rsquo;ll come back with one real number within 24
        hours.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required>
          <Input value={name} onChange={setName} autoComplete="name" required />
        </Field>
        <Field label="Phone" required>
          <Input
            value={phone}
            onChange={setPhone}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+91 90000 00000"
            required
          />
        </Field>
      </div>

      <Field label="Email (optional)" className="mt-5">
        <Input value={email} onChange={setEmail} type="email" autoComplete="email" />
      </Field>

      <Field label="Which bike?" className="mt-5" required>
        <Input
          value={bike}
          onChange={setBike}
          placeholder="Ducati Monster 821"
          required
        />
      </Field>

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <Field label="Year">
          <Input value={year} onChange={setYear} type="number" inputMode="numeric" placeholder="2019" />
        </Field>
        <Field label="Odometer (km)">
          <Input value={km} onChange={setKm} type="number" inputMode="numeric" placeholder="14000" />
        </Field>
        <Field label="Price you want (₹)">
          <Input value={expected} onChange={setExpected} type="number" inputMode="numeric" placeholder="650000" />
        </Field>
      </div>

      <Field label="Anything we should know? (optional)" className="mt-5">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Service history, accident history, modifications, pending work…"
          className={inputClass}
        />
      </Field>

      {/* Honeypot. Hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {error && (
        <p className="mt-5 border-l-2 border-red bg-red/5 px-4 py-3 text-sm text-red">
          {error}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="btn-red hover:bg-red-dark disabled:opacity-60"
        >
          {busy ? "Sending…" : "Get my quote"}
        </button>
        <a
          href={whatsappLink(settings)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-body underline underline-offset-4 hover:text-red"
        >
          or message us on WhatsApp
        </a>
      </div>
    </form>
  );
}

const inputClass =
  "w-full border border-line bg-white px-4 py-3 text-[15px] text-graphite outline-none transition-colors focus:border-red";

function Input({
  value,
  onChange,
  type = "text",
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  return (
    <input
      {...rest}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  );
}

function Field({
  label,
  children,
  className = "",
  required,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-body">
        {label}
        {required && <span className="text-red"> *</span>}
      </span>
      {children}
    </label>
  );
}
