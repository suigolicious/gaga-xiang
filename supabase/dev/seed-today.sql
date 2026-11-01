-- Development only: fills in today so the prep sheet shows a final count. Posts
-- today's lunchbox if there isn't one (the first two dishes in the library, by name),
-- then adds 5 confirmed lunchboxes for today: 3 at the first pickup location and 2 at
-- the second, both ordered by the first admin.
--
-- Run it in the Supabase dashboard's SQL editor, which bypasses row-level security.
-- Undo the orders with clear-orders.sql. Running it twice adds 5 more.

begin;

insert into public.lunchboxes (delivery_date, sides_en, sides_zh)
values (public.business_today(), 'Served with steamed rice', '配白米饭')
on conflict (delivery_date) do nothing;

-- Only if today's lunchbox has no dishes yet.
insert into public.lunchbox_dishes (delivery_date, dish_id, position)
select public.business_today(), id, row_number() over (order by name) - 1
from public.dishes
where deleted_at is null
  and not exists (
    select 1 from public.lunchbox_dishes where delivery_date = public.business_today()
  )
order by name
limit 2;

with
  admin as (
    select id from public.profiles where role = 'admin' order by created_at limit 1
  ),
  places as (
    select id, row_number() over (order by sort_order) as rank
    from public.pickup_locations
    where active
  ),
  wanted (rank, quantity) as (values (1, 3), (2, 2))
insert into public.orders (
  customer_id, delivery_date, location_id, quantity,
  unit_price_cents, subtotal_cents, tax_cents, total_cents,
  status, confirmed_at
)
select
  admin.id, public.business_today(), places.id, wanted.quantity,
  settings.lunchbox_price_cents,
  settings.lunchbox_price_cents * wanted.quantity,
  round(settings.lunchbox_price_cents * wanted.quantity * settings.sales_tax_basis_points / 10000.0),
  settings.lunchbox_price_cents * wanted.quantity
    + round(settings.lunchbox_price_cents * wanted.quantity * settings.sales_tax_basis_points / 10000.0),
  'confirmed', now()
from wanted
join places using (rank)
cross join admin
cross join public.business_settings as settings;

commit;

-- What today looks like now. (Not from the lunchbox_sales view: it only answers
-- signed-in admins, and the SQL editor isn't signed in.)
select
  public.business_today() as today,
  (
    select string_agg(dishes.name, ' + ' order by position)
    from public.lunchbox_dishes
    join public.dishes on dishes.id = lunchbox_dishes.dish_id
    where delivery_date = public.business_today()
  ) as dishes,
  (
    select sum(quantity) from public.orders
    where delivery_date = public.business_today() and status = 'confirmed'
  ) as lunchboxes;
