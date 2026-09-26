/**
 * Appointment types and labels shared by server code and Client Components.
 * Kept free of server-only imports so the admin calendar can use them.
 */

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "done"
  | "cancelled"
  | "no_show";

export type AppointmentType = "showroom_visit" | "call" | "test_ride";

export type AdminAppointment = {
  id: string;
  phone: string;
  customerName: string;
  bikeLabel: string;
  type: AppointmentType;
  /** YYYY-MM-DD, or null when the customer agreed to visit but never fixed a day. */
  date: string | null;
  time: string;
  notes: string;
  status: AppointmentStatus;
  createdAt: string;
};

export const APPOINTMENT_STATUSES: { value: AppointmentStatus; label: string }[] = [
  { value: "requested", label: "Requested" },
  { value: "confirmed", label: "Confirmed" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

export const APPOINTMENT_TYPES: { value: AppointmentType; label: string }[] = [
  { value: "showroom_visit", label: "Showroom visit" },
  { value: "test_ride", label: "Test ride" },
  { value: "call", label: "Call" },
];
