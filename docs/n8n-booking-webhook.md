# n8n booking webhook

The admin dashboard POSTs JSON to one n8n webhook URL whenever staff book or
change an appointment. The URL is set under **Admin → Site settings → n8n
booking webhook**, and editing it requires re-entering the admin's login
password (enforced in the database — see
`supabase/migrations/0011_appointments_n8n_webhook.sql`).

Requests are sent server-side (no CORS needed), `Content-Type:
application/json`, 10-second timeout. Any 2xx counts as success.

Branch on `event` in n8n with a Switch node.

## `booking_requested` — staff made a new booking

The dashboard has no insert permission on `appointments` (the agent owns
creation), so **n8n must create the lead + appointment** with its service-role
key, then confirm with the customer on WhatsApp. It shows on the calendar
once the row exists.

```json
{
  "event": "booking_requested",
  "source": "admin_dashboard",
  "business": "Race Dynamics",
  "sent_at": "2026-09-26T10:15:00.000Z",
  "appointment": {
    "phone": "919876543210",
    "customer_name": "Rahul Verma",
    "appt_type": "test_ride",
    "bike_id": "uuid-or-null",
    "bike_label": "Fat Bob 114 (2022)",
    "appt_date": "2026-09-28",
    "appt_time": "5 PM",
    "notes": "Wants to compare with the Fat Boy"
  }
}
```

`appt_type`: `showroom_visit` | `test_ride` | `call`. `appt_date` may be
`null` (date not fixed yet). Remember the one-open-appointment-per-phone rule:
if the customer already has a `requested`/`confirmed` row, update it rather
than inserting a second one.

## `appointment_updated` — staff changed status, date, time or notes

Already saved in the database before this is sent; n8n only needs to message
the customer.

```json
{
  "event": "appointment_updated",
  "source": "admin_dashboard",
  "business": "Race Dynamics",
  "sent_at": "2026-09-26T10:15:00.000Z",
  "appointment": {
    "id": "uuid",
    "phone": "919876543210",
    "customer_name": "Rahul Verma",
    "appt_type": "showroom_visit",
    "bike_id": "uuid-or-null",
    "bike_label": "Fat Bob 114 (2022)",
    "appt_date": "2026-09-28",
    "appt_time": "5 PM",
    "notes": null,
    "status": "confirmed"
  }
}
```

`status`: `requested` | `confirmed` | `done` | `cancelled` | `no_show`.
