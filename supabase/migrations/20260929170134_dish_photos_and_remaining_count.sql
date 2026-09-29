-- Dish photos in Supabase Storage, and the lunchboxes-left count for the lunchbox screen.

-- Moved here from the app's constants, now that the rate lives in this table.
comment on column public.business_settings.sales_tax_basis_points is
  'Sales tax in basis points (700 = 7.00%): North Carolina 4.75% plus Forsyth County 2.25%, '
  'for delivery from Clemmons, NC. Prepared food is taxed at the full rate. Source: NCDOR '
  'current sales and use tax rates (checked 2026-09-28). Does not include any local '
  'prepared-meals tax; confirm none applies.';

-- ---------------------------------------------------------------------------
-- Dish photos: anyone can view them (public URLs); only admins can change them
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dish-photos', 'dish-photos', true, 5 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Admins can upload dish photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'dish-photos' and (select public.is_admin()));

create policy "Admins can replace dish photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'dish-photos' and (select public.is_admin()))
  with check (bucket_id = 'dish-photos' and (select public.is_admin()));

create policy "Admins can delete dish photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'dish-photos' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Lunchboxes left for a delivery day
-- ---------------------------------------------------------------------------

-- Customers can't read other people's orders, so they can't add them up themselves.
-- This returns only the total, never the orders. Pending orders count too, so two
-- customers checking out at once can't both take the last lunchboxes; checkout will
-- need to expire abandoned ones.
create function public.lunchboxes_remaining(day date)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(
    0,
    settings.daily_lunchbox_cap - coalesce((
      select sum(orders.quantity)
      from public.orders
      where orders.delivery_date = day
        and orders.status in ('pending_payment', 'confirmed')
    ), 0)
  )::integer
  from public.business_settings as settings;
$$;

revoke execute on function public.lunchboxes_remaining(date) from public;
grant execute on function public.lunchboxes_remaining(date) to anon, authenticated;
