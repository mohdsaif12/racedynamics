"use client";

import { useState, useTransition } from "react";
import { APPOINTMENT_TYPES, type AppointmentType } from "@/lib/appointments";
import { sendBookingToN8n } from "../../n8n-actions";

/**
 * Staff-made booking (a walk-in, a phone call). This doesn't write to the
 * database directly — it posts the booking to the n8n webhook, and n8n
 * creates the appointment and confirms with the customer on WhatsApp. So it
 * appears on the calendar once n8n has processed it.
 */
export default function NewBookingForm({
  bikes,
  defaultDate,
  onClose,
}: {
  bikes: { id: string; label: string }[];
  defaultDate: string;
  onClose: () => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("91");
  const [type, setType] = useState<AppointmentType>("showroom_visit");
  const [bikeId, setBikeId] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await sendBookingToN8n({ customerName, phone, type, bikeId, date, time, notes });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  };

  return (
    <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate">New booking</h2>
        <button type="button" onClick={onClose} className="text-[13px] font-semibold text-slate hover:text-graphite">
          Close
        </button>
      </div>

      {sent ? (
        <div className="mt-4">
          <p className="text-[15px] font-semibold text-graphite">Booking sent to n8n.</p>
          <p className="mt-1 text-[14px] text-slate">
            It&apos;ll show on the calendar once n8n has created it — refresh in a moment.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded-full bg-red px-6 py-2.5 text-[14px] font-bold text-white hover:bg-red-dark"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Customer name">
            <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="WhatsApp number (with country code)">
            <input
              required
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="919876543210"
              className={inputClass}
            />
          </Field>
          <Field label="Type">
            <select value={type} onChange={(e) => setType(e.target.value as AppointmentType)} className={inputClass}>
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Bike (optional)">
            <select value={bikeId} onChange={(e) => setBikeId(e.target.value)} className={inputClass}>
              <option value="">— None —</option>
              {bikes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Time">
            <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="5 PM" className={inputClass} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
          </Field>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-red px-8 py-3 text-[15px] font-bold text-white hover:bg-red-dark disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send booking"}
            </button>
            {error && <span className="text-[14px] font-semibold text-red">{error}</span>}
          </div>
        </form>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-graphite outline-none focus:border-red";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[13px] font-semibold text-slate">{label}</span>
      {children}
    </label>
  );
}
