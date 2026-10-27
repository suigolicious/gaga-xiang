-- Deleting dishes from the library.
--
-- A dish served on a past day stays in the database, hidden, so the record of what
-- each day's lunchbox held (and later, what each order contained) stays complete.
-- To the family it's gone for good: it leaves the library and can't be used again.

alter table public.dishes add column deleted_at timestamptz;

comment on column public.dishes.deleted_at is
  'When the dish was deleted from the library. Set instead of deleting the row when '
  'past lunchboxes include the dish, so their record stays complete.';

-- Today in the business's time zone, the first day that isn't over yet.
create function public.business_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone settings.time_zone)::date
  from public.business_settings as settings;
$$;

-- Deletes a dish from the library. Refuses while the dish is in today's or a later
-- lunchbox: it has to be taken out of those first. Returns the path of the dish's
-- photo when the dish was erased entirely, so the app can remove the file (Storage
-- files can't be deleted from SQL); null otherwise.
create function public.delete_dish(dish_id uuid)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  photo text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can delete dishes' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.lunchbox_dishes as used
    where used.dish_id = delete_dish.dish_id
      and used.delivery_date >= public.business_today()
  ) then
    raise exception 'The dish is in an upcoming lunchbox' using errcode = '23503';
  end if;

  if exists (
    select 1 from public.lunchbox_dishes as used where used.dish_id = delete_dish.dish_id
  ) then
    update public.dishes set deleted_at = now()
    where id = delete_dish.dish_id and deleted_at is null;
    return null;
  end if;

  delete from public.dishes where id = delete_dish.dish_id
  returning photo_path into photo;
  return photo;
end;
$$;

revoke execute on function public.delete_dish(uuid) from public;
grant execute on function public.delete_dish(uuid) to authenticated;

-- Same as before, plus: deleted dishes can't go in a lunchbox, and "today" comes from
-- business_today().
create or replace function public.save_lunchbox(day date, dish_ids uuid[], sides_en text, sides_zh text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can change lunchboxes' using errcode = '42501';
  end if;

  if day < public.business_today() then
    raise exception 'Past lunchboxes can''t be changed' using errcode = '22023';
  end if;

  if coalesce(cardinality(dish_ids), 0) = 0 then
    raise exception 'A lunchbox needs at least one dish' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.dishes where id = any (dish_ids) and deleted_at is not null
  ) then
    raise exception 'Deleted dishes can''t be added to a lunchbox' using errcode = '22023';
  end if;

  -- Parameters are qualified with the function name where a column has the same name.
  insert into public.lunchboxes (delivery_date, sides_en, sides_zh)
  values (day, save_lunchbox.sides_en, save_lunchbox.sides_zh)
  on conflict (delivery_date) do update
    set sides_en = excluded.sides_en, sides_zh = excluded.sides_zh;

  delete from public.lunchbox_dishes where delivery_date = day;
  insert into public.lunchbox_dishes (delivery_date, dish_id, position)
  select day, chosen.dish_id, chosen.ordinal - 1
  from unnest(dish_ids) with ordinality as chosen (dish_id, ordinal);
end;
$$;
