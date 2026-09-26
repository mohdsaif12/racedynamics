import {
  getAppointmentsBetween,
  getBookableBikes,
  getUndatedAppointments,
} from "@/lib/admin/appointments";
import { getN8nBookingWebhook } from "@/lib/admin/integrations";
import { monthGrid, parseMonth, todayIST } from "@/lib/calendar";
import AppointmentCalendar from "./AppointmentCalendar";

export const metadata = { title: "Appointments" };

export default async function AdminAppointmentsPage({
  searchParams,
}: PageProps<"/admin/appointments">) {
  const { month: monthParam } = await searchParams;
  const today = todayIST();
  const { year, month } = parseMonth(typeof monthParam === "string" ? monthParam : undefined, today);
  const cells = monthGrid(year, month);

  const [appointments, undated, bikes, webhook] = await Promise.all([
    getAppointmentsBetween(cells[0].iso, cells[cells.length - 1].iso),
    getUndatedAppointments(),
    getBookableBikes(),
    getN8nBookingWebhook(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10">
      <AppointmentCalendar
        // Remount on month change so the selected day resets sensibly.
        key={`${year}-${month}`}
        year={year}
        month={month}
        today={today}
        appointments={appointments}
        undated={undated}
        bikes={bikes}
        webhookConfigured={Boolean(webhook)}
      />
    </div>
  );
}
