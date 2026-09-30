import {
  getAppointmentsBetween,
  getBookableBikes,
  getUndatedAppointments,
} from "@/lib/admin/appointments";
import { getAgentStats } from "@/lib/admin/agentStats";
import { getN8nBookingWebhook } from "@/lib/admin/integrations";
import { monthGrid, parseMonth, todayIST } from "@/lib/calendar";
import AgentStats from "./AgentStats";
import AppointmentCalendar from "./AppointmentCalendar";

export const metadata = { title: "Appointments" };

export default async function AdminAppointmentsPage({
  searchParams,
}: PageProps<"/admin/appointments">) {
  const { month: monthParam } = await searchParams;
  const today = todayIST();
  const { year, month } = parseMonth(typeof monthParam === "string" ? monthParam : undefined, today);
  const cells = monthGrid(year, month);

  const [appointments, undated, bikes, webhook, stats] = await Promise.all([
    getAppointmentsBetween(cells[0].iso, cells[cells.length - 1].iso),
    getUndatedAppointments(),
    getBookableBikes(),
    getN8nBookingWebhook(),
    getAgentStats(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10">
      <AppointmentCalendar
        year={year}
        month={month}
        today={today}
        appointments={appointments}
        undated={undated}
        bikes={bikes}
        webhookConfigured={Boolean(webhook)}
        stats={stats && <AgentStats stats={stats} />}
      />
    </div>
  );
}
