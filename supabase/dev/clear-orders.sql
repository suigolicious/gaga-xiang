-- Development only: deletes the orders for today and later, which puts the prep
-- sheet's counts back to 0. Use it after placing test orders with the test checkout.
--
-- Earlier days are left alone, since their counts are the sales history. To clear
-- those as well (e.g. before launch), delete the `where` clause.
--
-- Run it in the Supabase dashboard's SQL editor, which bypasses row-level security.

delete from public.orders
where delivery_date >= public.business_today();

-- What's left from today on (should be no rows):
select delivery_date, sum(quantity) as lunchboxes
from public.orders
where delivery_date >= public.business_today()
group by delivery_date
order by delivery_date;
