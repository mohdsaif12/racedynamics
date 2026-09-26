"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminAppointment, AppointmentStatus } from "@/lib/appointments";
import { formatDay, monthGrid, monthKey, monthLabel } from "@/lib/calendar";
import AppointmentCard, { STATUS_DOT } from "./AppointmentCard";
import NewBookingForm from "./NewBookingForm";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Statuses that still count as booked time in the day badges. */
const isLive = (a: AdminAppointment) => a.status !== "cancelled" && a.status !== "no_show";

const LEGEND: { status: AppointmentStatus; label: string }[] = [
  { status: "requested", label: "Requested" },
  { status: "confirmed", label: "Confirmed" },
  { status: "done", label: "Done" },
  { status: "cancelled", label: "Cancelled / no-show" },
];

export default function AppointmentCalendar({
  year,
  month,
  today,
  appointments,
  undated,
  bikes,
  webhookConfigured,
}: {
  year: number;
  month: number;
  today: string;
  appointments: AdminAppointment[];
  undated: AdminAppointment[];
  bikes: { id: string; label: string }[];
  webhookConfigured: boolean;
}) {
  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const isCurrentMonth = monthKey(year, month) === today.slice(0, 7);
  const [selected, setSelected] = useState(
    isCurrentMonth ? today : cells.find((c) => c.inMonth)!.iso,
  );
  const [booking, setBooking] = useState(false);

  const byDay = useMemo(() => {
    const map = new Map<string, AdminAppointment[]>();
    for (const a of appointments) {
      if (!a.date) continue;
      const list = map.get(a.date);
      if (list) list.push(a);
      else map.set(a.date, [a]);
    }
    return map;
  }, [appointments]);

  const selectedList = byDay.get(selected) ?? [];
  const upcomingOpen = appointments.filter(
    (a) => a.date && a.date >= today && (a.status === "requested" || a.status === "confirmed"),
  ).length;

  return (
    <>
      {/* -------------------------------------------------------- header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Appointments</h1>
          <p className="mt-1 text-[14px] text-slate">
            Showroom visits, test rides and calls booked by the WhatsApp agent
            {upcomingOpen > 0 && ` · ${upcomingOpen} upcoming this view`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBooking(true)}
          className="rounded-full bg-red px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-red-dark"
        >
          + New booking
        </button>
      </div>

      {!webhookConfigured && (
        <div className="mt-5 rounded-2xl border border-lamp/50 bg-lamp/10 px-5 py-4 text-[14px] text-graphite">
          No n8n webhook is set, so new bookings and changes won&apos;t reach
          the customer on WhatsApp.{" "}
          <Link href="/admin/settings#n8n" className="font-bold text-red underline">
            Add it in Site settings
          </Link>
          .
        </div>
      )}

      {booking && (
        <NewBookingForm
          bikes={bikes}
          defaultDate={selected >= today ? selected : ""}
          onClose={() => setBooking(false)}
        />
      )}

      {/* ---------------------------------------------------- month nav */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-graphite">{monthLabel(year, month)}</h2>
        <div className="flex items-center gap-2">
          <MonthLink href={`?month=${monthKey(year, month - 1)}`} label="Previous month">
            <Chevron dir="left" />
          </MonthLink>
          <Link
            href="/admin/appointments"
            onClick={() => isCurrentMonth && setSelected(today)}
            className="rounded-full border border-line bg-white px-4 py-2 text-[14px] font-semibold text-graphite hover:border-graphite"
          >
            Today
          </Link>
          <MonthLink href={`?month=${monthKey(year, month + 1)}`} label="Next month">
            <Chevron dir="right" />
          </MonthLink>
        </div>
      </div>

      {/* --------------------------------------------------------- grid */}
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white p-3 shadow-sm">
        <div className="min-w-[42rem]">
          <div className="grid grid-cols-7 gap-1.5 pb-1.5">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[11px] font-bold uppercase tracking-wider text-slate"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((cell) => {
              const list = byDay.get(cell.iso) ?? [];
              const live = list.filter(isLive);
              const isToday = cell.iso === today;
              const isSelected = cell.iso === selected;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => setSelected(cell.iso)}
                  aria-pressed={isSelected}
                  aria-label={`${formatDay(cell.iso)}, ${live.length} appointments`}
                  className={`flex h-24 flex-col gap-1 rounded-xl border p-1.5 text-left transition-colors ${
                    cell.inMonth
                      ? "border-line bg-white hover:bg-mist"
                      : "border-transparent bg-mist/60 text-slate/60"
                  } ${isToday ? "border-red/50 bg-red/5" : ""} ${
                    isSelected ? "ring-2 ring-red ring-offset-1" : ""
                  }`}
                >
                  <span className="flex items-center justify-between px-0.5">
                    <span
                      className={`text-[13px] font-bold ${
                        isToday ? "text-red" : cell.inMonth ? "text-graphite" : "text-slate/60"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {live.length > 0 && (
                      <span className="rounded-full bg-red px-1.5 text-[11px] font-bold text-white">
                        {live.length}
                      </span>
                    )}
                  </span>
                  <span className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                    {list.slice(0, 2).map((a) => (
                      <span
                        key={a.id}
                        className="flex items-center gap-1 truncate text-[11px] text-graphite"
                        title={`${a.time} — ${a.customerName}`}
                      >
                        <span className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[a.status]}`} />
                        <span className="truncate">
                          {a.time && `${a.time} `}
                          {a.customerName.split(" ")[0]}
                        </span>
                      </span>
                    ))}
                    {list.length > 2 && (
                      <span className="px-1 text-[10px] font-semibold text-slate">
                        +{list.length - 2} more
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- legend */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 px-1">
        {LEGEND.map((l) => (
          <span key={l.status} className="flex items-center gap-1.5 text-[12px] font-semibold text-slate">
            <span className={`size-2 rounded-full ${STATUS_DOT[l.status]}`} />
            {l.label}
          </span>
        ))}
      </div>

      {/* ------------------------------------------------ selected day */}
      <section className="mt-8">
        <h3 className="text-lg font-bold text-graphite">
          {selected === today ? "Today" : formatDay(selected)}
          <span className="ml-2 text-[14px] font-normal text-slate">
            ({selectedList.length} {selectedList.length === 1 ? "appointment" : "appointments"})
          </span>
        </h3>
        {selectedList.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-line p-8 text-center text-[14px] text-slate">
            Nothing booked on this day.
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {selectedList.map((a) => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------ undated */}
      {undated.length > 0 && (
        <section className="mt-10">
          <h3 className="text-lg font-bold text-graphite">
            Needs a call
            <span className="ml-2 text-[14px] font-normal text-slate">
              — agreed to visit, no date fixed yet
            </span>
          </h3>
          <div className="mt-3 flex flex-col gap-3">
            {undated.map((a) => (
              <AppointmentCard key={a.id} appointment={a} highlight />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function MonthLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="grid size-10 place-items-center rounded-full border border-line bg-white text-graphite hover:border-graphite"
    >
      {children}
    </Link>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
