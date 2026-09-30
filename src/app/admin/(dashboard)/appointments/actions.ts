"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { getAppointmentsBetween, type AdminAppointment } from "@/lib/admin/appointments";
import { monthGrid } from "@/lib/calendar";

/**
 * One month's grid worth of appointments (including the padding days from
 * the neighbouring months), so the calendar can switch months client-side
 * without a full page navigation.
 */
export async function getMonthAppointments(key: string): Promise<AdminAppointment[]> {
  await requireAdmin();
  const m = key.match(/^(\d{4})-(\d{2})$/);
  if (!m) return [];
  const cells = monthGrid(Number(m[1]), Number(m[2]) - 1);
  return getAppointmentsBetween(cells[0].iso, cells[cells.length - 1].iso);
}
