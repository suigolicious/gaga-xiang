-- Lunchbox sales per day for the prep sheet and its history, and a test checkout
-- that places an order without payment until real payment exists.

-- ---------------------------------------------------------------------------
-- Sales per day
-- ---------------------------------------------------------------------------

-- One row per posted lunchbox: what was in it, how many were sold (confirmed orders,
-- which is also how many get made), and how many were picked up. Admins only.
-- Security invoker: row-level security on orders still applies to whoever queries it.
create view public.lunchbox_sales
with (security_invoker = true)
as
select
  lunchboxes.delivery_date,
  array(
    select dishes.name
    from public.lunchbox_dishes
    join public.dishes on dishes.id = lunchbox_dishes.dish_id
    where lunchbox_dishes.delivery_date = lunchboxes.delivery_date
    order by lunchbox_dishes.position
  ) as dish_names,
  lunchboxes.sides_en,
  lunchboxes.sides_zh,
  coalesce(sum(orders.quantity) filter (where orders.status = 'confirmed'), 0)::integer as sold,
  coalesce(
    sum(orders.quantity) filter (
      where orders.status = 'confirmed' and orders.picked_up_at is not null
    ),
    0
  )::integer as picked_up
from public.lunchboxes
left join public.orders on orders.delivery_date = lunchboxes.delivery_date
where (select public.is_admin())
group by lunchboxes.delivery_date;

revoke all on public.lunchbox_sales from anon, public;
grant select on public.lunchbox_sales to authenticated;

-- ---------------------------------------------------------------------------
-- Test checkout (temporary)
-- ---------------------------------------------------------------------------

-- Places a confirmed order for tomorrow with no payment, so ordering can be tried end
-- to end before payment is set up. Admins only, so nobody gets free lunchboxes, and
-- it skips the cutoff so it works at any hour. Otherwise it follows the real rules:
-- a posted lunchbox, an active location, and the daily cap. Replace it with the real
-- checkout once payment exists.
--
-- Security definer: customers can't insert orders themselves (no insert policy).
create function public.place_test_order(day date, location_id uuid, quantity integer)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  settings public.business_settings;
  subtotal integer;
  tax integer;
  order_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can place test orders' using errcode = '42501';
  end if;

  if day <> public.business_today() + 1 then
    raise exception 'Orders can only be for tomorrow' using errcode = '22023';
  end if;

  if quantity is null or quantity < 1 then
    raise exception 'Order at least one lunchbox' using errcode = '22023';
  end if;

  if not exists (select 1 from public.lunchboxes where delivery_date = day) then
    raise exception 'That day''s lunchbox hasn''t been posted' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.pickup_locations
    where id = place_test_order.location_id and active
  ) then
    raise exception 'That pickup location isn''t available' using errcode = '22023';
  end if;

  -- One order at a time per day, so two at once can't both take the last lunchboxes.
  perform pg_advisory_xact_lock(hashtext('orders:' || day));
  if public.lunchboxes_remaining(day) < quantity then
    raise exception 'Not enough lunchboxes left' using errcode = '23514';
  end if;

  select * into settings from public.business_settings;
  subtotal := settings.lunchbox_price_cents * quantity;
  -- Same rounding as the app's salesTaxCents: half up, to the nearest cent.
  tax := round(subtotal * settings.sales_tax_basis_points / 10000.0);

  insert into public.orders (
    customer_id, delivery_date, location_id, quantity,
    unit_price_cents, subtotal_cents, tax_cents, total_cents,
    status, confirmed_at
  )
  values (
    auth.uid(), day, place_test_order.location_id, quantity,
    settings.lunchbox_price_cents, subtotal, tax, subtotal + tax,
    'confirmed', now()
  )
  returning id into order_id;

  return order_id;
end;
$$;

revoke execute on function public.place_test_order(date, uuid, integer) from public;
grant execute on function public.place_test_order(date, uuid, integer) to authenticated;
