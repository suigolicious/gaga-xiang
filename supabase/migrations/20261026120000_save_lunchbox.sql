-- Saving a day's lunchbox from the admin lunchbox editor.

-- Sets the sides and dishes (in display order) for a delivery day, posting it if it's
-- new. One call runs in one transaction, so customers never load a lunchbox halfway
-- through a change, e.g. with its old dishes removed and the new ones not yet added.
-- Security invoker: row-level security still decides who may change lunchboxes; the
-- admin check up front only gives a clearer error.
create function public.save_lunchbox(day date, dish_ids uuid[], sides_en text, sides_zh text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  today date;
begin
  if not public.is_admin() then
    raise exception 'Only admins can change lunchboxes' using errcode = '42501';
  end if;

  select (now() at time zone settings.time_zone)::date into today
  from public.business_settings as settings;
  if day < today then
    raise exception 'Past lunchboxes can''t be changed' using errcode = '22023';
  end if;

  if coalesce(cardinality(dish_ids), 0) = 0 then
    raise exception 'A lunchbox needs at least one dish' using errcode = '22023';
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

revoke execute on function public.save_lunchbox(date, uuid[], text, text) from public;
grant execute on function public.save_lunchbox(date, uuid[], text, text) to authenticated;
