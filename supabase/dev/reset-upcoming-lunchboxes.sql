-- Development only: resets upcoming lunchboxes to a realistic few days, the way the
-- family actually plans (2-3 days ahead, rarely more).
--
-- Clears every lunchbox after today, then posts the next 5 days with two dishes each,
-- cycling through the dish library in name order. Today and earlier days are left
-- alone. Dates are relative to today in the business's time zone, so it can be rerun
-- any time.
--
-- Run it in the Supabase dashboard's SQL editor, which bypasses row-level security.
-- It fails, changing nothing, if any of the cleared days already has orders.

begin;

delete from public.lunchboxes
where delivery_date > (
  select (now() at time zone time_zone)::date from public.business_settings
);

insert into public.lunchboxes (delivery_date, sides_en, sides_zh)
select (now() at time zone settings.time_zone)::date + days_ahead,
  'Served with steamed rice', '配白米饭'
from public.business_settings as settings
cross join generate_series(1, 5) as days_ahead;

-- Day 1 gets dishes 1 and 2, day 2 gets dishes 3 and 4, and so on, wrapping around.
with
  today as (
    select (now() at time zone time_zone)::date as day from public.business_settings
  ),
  library as (
    select id, row_number() over (order by name) - 1 as idx, count(*) over () as total
    from public.dishes
    where deleted_at is null
  )
insert into public.lunchbox_dishes (delivery_date, dish_id, position)
select today.day + days_ahead, library.id, slot
from today
cross join generate_series(1, 5) as days_ahead
cross join generate_series(0, 1) as slot
join library on library.idx = ((days_ahead - 1) * 2 + slot) % library.total;

commit;

-- What's posted now:
select lunchboxes.delivery_date, string_agg(dishes.name, ' + ' order by position) as dishes
from public.lunchboxes
join public.lunchbox_dishes using (delivery_date)
join public.dishes on dishes.id = lunchbox_dishes.dish_id
where lunchboxes.delivery_date >= (
  select (now() at time zone time_zone)::date from public.business_settings
)
group by lunchboxes.delivery_date
order by lunchboxes.delivery_date;
