-- WhatsApp AI sales agent — dashboard-facing tables, run after 0005. Safe to
-- re-run.
--
-- The agent itself (n8n) already writes to these tables using the service
-- role key, which bypasses RLS — so the tables work today with zero policies.
-- This migration exists so the admin dashboard (a signed-in admin_users
-- session, anon key only) can read and update them too. Everything here is
-- additive: it does not touch bikes/categories/site_settings/testimonials/
-- admin_users/sell_enquiries from earlier migrations.
--
-- Guiding rule: the database is the source of truth, not the AI. The bot has
-- deterministic guards that override its own output whenever it contradicts
-- inventory. The dashboard must follow the same rule — show DB state, never
-- re-derive or re-guess it (e.g. lead_status is bot-computed; the dashboard
-- may override it as an explicit admin action, but must never auto-recompute
-- it from the transcript).

-- ---------------------------------------------------------------------- leads
-- One row per customer phone number (digits only, with country code, no "+",
-- e.g. "917905581778"). phone is the primary key here — not an id.
create table if not exists leads (
  phone                text primary key,
  wa_profile_name      text,
  customer_name        text,
  interested_bike      text,
  bike_id              uuid references bikes(id) on delete set null,
  manufacturer         text,
  model                text,
  variant              text,
  preferred_year       text,
  budget_inr           int,
  budget_text          text,
  city                 text,
  usage                text,
  purchase_timeline    text,
  finance_or_cash      text
                         check (finance_or_cash in ('cash','finance','undecided')),
  exchange             boolean,
  exchange_vehicle     text,
  intent_signals       text[] not null default '{}',
  buying_intent        text
                         check (buying_intent in ('low','medium','high')),
  lead_status          text not null default 'COLD'
                         check (lead_status in ('COLD','WARM','HOT','LOST','SPAM')),
  status_reason        text,
  handoff_requested    boolean not null default false,
  handoff_reason       text,
  appointment_requested boolean not null default false,
  appointment_date     date,
  appointment_time     text,
  salesperson          text,   -- dashboard-only; the bot never writes this
  summary              text,
  sales_notified_at    timestamptz,
  last_message_at      timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists leads_last_message_idx on leads(last_message_at desc nulls last);
create index if not exists leads_status_idx on leads(lead_status);
create index if not exists leads_bike_idx on leads(bike_id);

drop trigger if exists leads_touch on leads;
create trigger leads_touch before update on leads
  for each row execute function set_updated_at();

-- --------------------------------------------------------------- appointments
-- Showroom visits / calls / test rides. One phone may have at most one row
-- in ('requested','confirmed') at a time — enforced below — so move a row to
-- done/cancelled/no_show before a new one can be booked for that phone.
create table if not exists appointments (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null references leads(phone) on delete cascade,
  bike_id     uuid references bikes(id) on delete set null,
  bike_label  text,   -- denormalised name, survives bike deletion
  appt_type   text not null default 'showroom_visit'
                check (appt_type in ('showroom_visit','call','test_ride')),
  appt_date   date,   -- null: customer agreed to visit but never fixed a date
  appt_time   text,
  notes       text,
  lead_status text,
  status      text not null default 'requested'
                check (status in ('requested','confirmed','done','cancelled','no_show')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists appointments_phone_idx on appointments(phone);
create index if not exists appointments_date_idx on appointments(appt_date);

-- Partial unique index, not a check constraint: only rows currently open
-- ('requested' or 'confirmed') count toward the one-per-phone limit.
create unique index if not exists appointments_one_open_per_phone
  on appointments(phone) where status in ('requested','confirmed');

drop trigger if exists appointments_touch on appointments;
create trigger appointments_touch before update on appointments
  for each row execute function set_updated_at();

-- -------------------------------------------------------------- wa_messages
-- Full inbound/outbound transcript. Read-only from the dashboard's side —
-- the bot (service role) is the only writer, enforced by RLS below, not just
-- by convention.
create table if not exists wa_messages (
  id          bigint generated always as identity primary key,
  phone       text not null references leads(phone) on delete cascade,
  direction   text not null check (direction in ('in','out')),
  msg_type    text not null default 'text',
  body        text,
  status      text,
  error       text,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists wa_messages_phone_idx on wa_messages(phone, created_at);
create index if not exists wa_messages_failed_idx on wa_messages(status) where status = 'failed';

-- ----------------------------------------------------------- wa_conversations
-- Per-phone runtime state. paused_until in the future = the bot stays silent
-- for that customer; this is how a human takes over from the dashboard.
-- locked_until / lock_token are internal concurrency control for the bot —
-- the dashboard must never write to them.
create table if not exists wa_conversations (
  phone         text primary key references leads(phone) on delete cascade,
  paused_until  timestamptz,
  pause_reason  text,
  locked_until  timestamptz,
  lock_token    text,
  updated_at    timestamptz not null default now()
);

drop trigger if exists wa_conversations_touch on wa_conversations;
create trigger wa_conversations_touch before update on wa_conversations
  for each row execute function set_updated_at();

-- ------------------------------------------------------------------- RLS
-- These tables are written by the bot's service role key today (which
-- bypasses RLS), so enabling RLS with zero policies does not break it — it
-- only closes the door for the anon key, then the policies below reopen a
-- narrow admin-only path for the dashboard.
--
-- Two things have to be true for `authenticated` to see a row, not just one:
-- a table-level GRANT (below) AND a passing RLS policy. RLS alone is not
-- enough — without the GRANT, an admin still gets zero rows with no error,
-- same symptom as missing policies. This bit the first draft of this
-- migration; the GRANTs below are what actually make it work.
alter table leads enable row level security;
alter table appointments enable row level security;
alter table wa_messages enable row level security;
alter table wa_conversations enable row level security;

-- Helper: is the current signed-in user an admin? security definer so it can
-- read admin_users regardless of the caller's own row-level access to it.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users a where a.user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Base table privileges. RLS still filters row-by-row on top of these.
grant select, update on public.leads            to authenticated;
grant select, update on public.appointments     to authenticated;
grant select, update on public.wa_conversations to authenticated;
grant select          on public.wa_messages     to authenticated;

-- leads: admins read + update. No insert/delete from the dashboard — the
-- bot owns lead creation, and a lead is never manually deleted.
drop policy if exists leads_admin_read on public.leads;
drop policy if exists leads_admin_update on public.leads;
create policy leads_admin_read on public.leads for select to authenticated
  using (public.is_admin());
create policy leads_admin_update on public.leads for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- appointments: admins read + update. Insert stays with the bot; the
-- dashboard only transitions status / edits date, time, notes on an
-- appointment the bot already created.
drop policy if exists appt_admin_read on public.appointments;
drop policy if exists appt_admin_update on public.appointments;
create policy appt_admin_read on public.appointments for select to authenticated
  using (public.is_admin());
create policy appt_admin_update on public.appointments for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- wa_conversations: admins read + update (this is how "take over chat" /
-- "hand back to bot" work — see docs/agent-dashboard-handoff.md).
drop policy if exists conv_admin_read on public.wa_conversations;
drop policy if exists conv_admin_update on public.wa_conversations;
create policy conv_admin_read on public.wa_conversations for select to authenticated
  using (public.is_admin());
create policy conv_admin_update on public.wa_conversations for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- wa_messages: admins read only. The transcript must never be editable from
-- the dashboard, so there is deliberately no update/insert/delete policy or
-- grant.
drop policy if exists msg_admin_read on public.wa_messages;
create policy msg_admin_read on public.wa_messages for select to authenticated
  using (public.is_admin());

-- No policies or grants at all for the anon (public website) role on any of
-- the four tables above — an unauthenticated visitor gets zero rows, no
-- error, same as every other admin-only table in this schema.

notify pgrst, 'reload schema';
