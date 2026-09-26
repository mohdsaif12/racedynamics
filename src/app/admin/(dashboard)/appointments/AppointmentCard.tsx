"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  type AdminAppointment,
  type AppointmentStatus,
} from "@/lib/appointments";
import { formatDay } from "@/lib/calendar";
import { notifyAppointmentUpdated } from "../../n8n-actions";

export const STATUS_DOT: Record<AppointmentStatus, string> = {
  requested: "bg-amber-500",
  confirmed: "bg-emerald-600",
  done: "bg-graphite",
  cancelled: "bg-slate/50",
  no_show: "bg-slate/50",
};

const TYPE_LABEL = Object.fromEntries(APPOINTMENT_TYPES.map((t) => [t.value, t.label]));

/**
 * One appointment: who, when, what bike, and the two things staff do with
 * it — move its status along, or reschedule. Either change is written to
 * Supabase first, then n8n is told so it can message the customer. An n8n
 * failure never rolls back the change; it's shown as a notice instead.
 */
export default function AppointmentCard({
  appointment: a,
  highlight = false,
}: {
  appointment: AdminAppointment;
  highlight?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(a.status);
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(a.date ?? "");
  const [time, setTime] = useState(a.time);
  const [notes, setNotes] = useState(a.notes);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const save = (patch: Record<string, string | null>, rollback?: () => void) => {
    setNotice(null);
    startTransition(async () => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.from("appointments").update(patch).eq("id", a.id);
      if (error) {
        rollback?.();
        setNotice({
          ok: false,
          text:
            error.code === "23505"
              ? "This customer already has another open appointment. Close that one first."
              : "Couldn't save. Check your connection and try again.",
        });
        return;
      }
      setEditing(false);
      const sent = await notifyAppointmentUpdated(a.id);
      setNotice(
        sent.ok
          ? { ok: true, text: "Saved and sent to n8n." }
          : { ok: false, text: `Saved, but not sent to WhatsApp: ${sent.error}` },
      );
      router.refresh();
    });
  };

  const changeStatus = (next: AppointmentStatus) => {
    if (next === status) return;
    const previous = status;
    setStatus(next); // optimistic
    save({ status: next }, () => setStatus(previous));
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    save({ appt_date: date || null, appt_time: time.trim() || null, notes: notes.trim() || null });
  };

  return (
    <article
      className={`rounded-2xl bg-white p-5 shadow-sm transition-opacity ${
        highlight ? "border-l-4 border-lamp" : ""
      } ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-slate">
            <span className={`size-2 rounded-full ${STATUS_DOT[status]}`} />
            {TYPE_LABEL[a.type]}
            {a.date ? ` · ${formatDay(a.date)}` : " · date not fixed"}
            {a.time && ` · ${a.time}`}
          </p>
          <h4 className="mt-1 text-[17px] font-bold text-graphite">{a.customerName}</h4>
          {a.bikeLabel && <p className="mt-0.5 text-[14px] text-body">{a.bikeLabel}</p>}
        </div>
        <a
          href={`https://wa.me/${a.phone}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full bg-whatsapp px-4 py-2 text-[13px] font-bold text-white"
        >
          WhatsApp +{a.phone}
        </a>
      </div>

      {a.notes && !editing && (
        <p className="mt-3 rounded-xl bg-mist px-4 py-3 text-[14px] text-body">{a.notes}</p>
      )}

      {editing ? (
        <form onSubmit={saveEdit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-slate">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-slate">Time</span>
            <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="5 PM" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-[13px] font-semibold text-slate">Notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-red px-6 py-2.5 text-[14px] font-bold text-white hover:bg-red-dark disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-line px-6 py-2.5 text-[14px] font-semibold text-graphite"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {APPOINTMENT_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              disabled={pending}
              onClick={() => changeStatus(s.value)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                status === s.value
                  ? "bg-graphite text-white"
                  : "border border-line text-graphite hover:border-graphite"
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="ml-auto text-[13px] font-bold text-red hover:underline"
          >
            Reschedule / edit
          </button>
        </div>
      )}

      {notice && (
        <p className={`mt-3 text-[13px] font-semibold ${notice.ok ? "text-emerald-700" : "text-red"}`}>
          {notice.text}
        </p>
      )}
    </article>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-graphite outline-none focus:border-red";
