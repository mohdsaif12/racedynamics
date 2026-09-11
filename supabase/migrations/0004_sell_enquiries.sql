-- Sell-us enquiries, run after 0003_seed.sql. Safe to re-run.
--
-- This is the one table the public can WRITE to, so it is deliberately narrow:
-- an insert-only policy, no select for anonymous visitors. A seller can submit
-- a bike, but cannot read back anyone else's submission — including their own,
-- which is why the form confirms success from the insert result rather than
-- by re-fetching the row.

create table if not exists sell_enquiries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text not null,
  email         text not null default '',
  bike          text not null,               -- "2019 Ducati Monster 821"
  year          int,
  km            int,
  expected_inr  int,
  notes         text not null default '',
  status        text not null default 'new'
                  check (status in ('new','contacted','closed')),
  created_at    timestamptz not null default now()
);

create index if not exists sell_enquiries_status_idx
  on sell_enquiries(status, created_at desc);

alter table sell_enquiries enable row level security;

-- Anyone may submit. No `using` clause is possible on an insert policy, so the
-- check is what constrains it: the row must look like a real enquiry, which
-- stops an empty-payload flood from being free.
drop policy if exists "public submit sell enquiries" on sell_enquiries;
create policy "public submit sell enquiries" on sell_enquiries
  for insert with check (
    length(trim(name))  between 2 and 80
    and length(trim(phone)) between 6 and 20
    and length(trim(bike))  between 2 and 120
    and length(notes) <= 2000
    and status = 'new'
  );

-- Only staff can read or manage them.
drop policy if exists "admins read sell enquiries" on sell_enquiries;
create policy "admins read sell enquiries" on sell_enquiries
  for select using (
    exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins update sell enquiries" on sell_enquiries;
create policy "admins update sell enquiries" on sell_enquiries
  for update using (
    exists (select 1 from admin_users where user_id = auth.uid())
  );

drop policy if exists "admins delete sell enquiries" on sell_enquiries;
create policy "admins delete sell enquiries" on sell_enquiries
  for delete using (
    exists (select 1 from admin_users where user_id = auth.uid())
  );
