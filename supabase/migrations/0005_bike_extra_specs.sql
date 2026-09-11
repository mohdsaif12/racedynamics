-- Owner-defined spec rows per bike, run after 0004. Safe to re-run.
--
-- A jsonb array of {label, value} rather than its own table: these are always
-- read and written as one whole list belonging to one bike, never queried or
-- filtered across bikes, and the order is the order the owner typed them in.
-- A child table would buy joins and ordering columns that nothing would use,
-- and would turn "save this bike" into a delete-then-reinsert.

alter table bikes
  add column if not exists extra_specs jsonb not null default '[]'::jsonb;

-- Keeps a malformed write from reaching the page, where it would render as
-- blank cells. Anything that isn't a list of objects is rejected outright.
alter table bikes drop constraint if exists bikes_extra_specs_is_array;
alter table bikes add constraint bikes_extra_specs_is_array
  check (jsonb_typeof(extra_specs) = 'array' and jsonb_array_length(extra_specs) <= 20);
