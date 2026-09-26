-- Appointments calendar + n8n booking webhook, run after 0010. Safe to re-run.
--
-- 1. integration_settings: a single admin-only row holding the n8n webhook
--    URL the dashboard POSTs booking data to. Deliberately NOT a column on
--    site_settings — that table is publicly readable, and a webhook URL is
--    effectively a credential (anyone holding it can inject bookings).
--
-- 2. Changing the URL requires re-entering the admin's own login password.
--    That is enforced here in the database, not just in the UI: authenticated
--    users get SELECT only, and the one write path is a security-definer
--    function that checks the password against auth.users first. Calling
--    Supabase directly from the browser console can't skip it.

create extension if not exists pgcrypto with schema extensions;

-- ------------------------------------------------------ integration_settings
create table if not exists integration_settings (
  id                      int primary key default 1 check (id = 1),
  n8n_booking_webhook_url text,
  updated_at              timestamptz not null default now()
);

insert into integration_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists integration_settings_touch on integration_settings;
create trigger integration_settings_touch before update on integration_settings
  for each row execute function set_updated_at();

alter table integration_settings enable row level security;

-- Read-only for admins. No insert/update/delete grant: writes go through
-- set_n8n_booking_webhook() below, which checks the password.
revoke all on public.integration_settings from anon, authenticated;
grant select on public.integration_settings to authenticated;

drop policy if exists integration_admin_read on public.integration_settings;
create policy integration_admin_read on public.integration_settings
  for select to authenticated using (public.is_admin());

-- ------------------------------------------------------ password check
-- True when p_password is the signed-in admin's own Supabase Auth password.
-- Used to unlock the webhook field in Settings before it becomes editable.
create or replace function public.verify_admin_password(p_password text)
returns boolean
language plpgsql stable security definer
set search_path = public, extensions
as $$
begin
  if not public.is_admin() then
    return false;
  end if;

  return exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and u.encrypted_password is not null
      and u.encrypted_password = extensions.crypt(p_password, u.encrypted_password)
  );
end;
$$;

revoke all on function public.verify_admin_password(text) from public, anon;
grant execute on function public.verify_admin_password(text) to authenticated;

-- ------------------------------------------------------ webhook write path
create or replace function public.set_n8n_booking_webhook(p_password text, p_url text)
returns void
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  clean text := nullif(btrim(coalesce(p_url, '')), '');
begin
  if not public.verify_admin_password(p_password) then
    raise exception 'Incorrect password' using errcode = '28P01';
  end if;

  if clean is not null and clean !~* '^https?://' then
    raise exception 'Webhook URL must start with http:// or https://'
      using errcode = '22023';
  end if;

  update public.integration_settings
     set n8n_booking_webhook_url = clean
   where id = 1;
end;
$$;

revoke all on function public.set_n8n_booking_webhook(text, text) from public, anon;
grant execute on function public.set_n8n_booking_webhook(text, text) to authenticated;

notify pgrst, 'reload schema';
