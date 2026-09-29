-- Initial schema for the daily lunchbox business (see .claude/CLAUDE.md).
--
-- Every table has row-level security (RLS) on. The app connects with the publishable
-- key, so these policies are the only thing deciding who can read or change what.
-- Customers can't create orders directly: that happens in a server function added
-- with checkout, which enforces the cutoff, the daily cap, and payment.

-- ---------------------------------------------------------------------------
-- Profiles and roles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  -- When the customer agreed to order texts; null means they haven't.
  sms_consent_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per signed-up user: name, phone, and role.';

-- Whether the signed-in user is family (admin). Security definer so policies can call
-- it without tripping over the RLS on profiles itself.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Create a profile whenever someone signs up, copying their phone number.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, phone) values (new.id, new.phone);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Customers may only change their name and text consent, never their role or phone.
revoke update on public.profiles from authenticated;
grant update (full_name, sms_consent_at) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Business settings (price, cap, cutoff, tax): one row, set by the family
-- ---------------------------------------------------------------------------

create table public.business_settings (
  -- Always true: there's exactly one row.
  id boolean primary key default true check (id),
  lunchbox_price_cents integer not null check (lunchbox_price_cents > 0),
  daily_lunchbox_cap integer not null check (daily_lunchbox_cap > 0),
  -- Orders for a day close at this hour (0-23) the day before, in time_zone.
  order_cutoff_hour integer not null check (order_cutoff_hour between 0 and 23),
  time_zone text not null,
  -- 700 = 7.00%
  sales_tax_basis_points integer not null check (sales_tax_basis_points >= 0),
  updated_at timestamptz not null default now()
);

insert into public.business_settings
  (lunchbox_price_cents, daily_lunchbox_cap, order_cutoff_hour, time_zone, sales_tax_basis_points)
values
  (1200, 100, 14, 'America/New_York', 700);

alter table public.business_settings enable row level security;

create policy "Anyone can read the business settings"
  on public.business_settings for select
  to anon, authenticated
  using (true);

create policy "Admins can change the business settings"
  on public.business_settings for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Pickup locations
-- ---------------------------------------------------------------------------

create table public.pickup_locations (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_zh text not null,
  address text not null,
  -- Where the car parks; included in the "arrived" text.
  pickup_note_en text not null,
  pickup_note_zh text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Placeholder addresses and pickup notes until the real ones are known.
insert into public.pickup_locations
  (name_en, name_zh, address, pickup_note_en, pickup_note_zh, sort_order)
values
  ('WFIRM', 'WFIRM', '123 Placeholder Ave, Winston-Salem, NC',
   'Silver minivan in the visitor lot by the main entrance', '正门旁访客停车场的银色面包车', 1),
  ('Courthouse', '法院', '456 Placeholder St, Winston-Salem, NC',
   'Silver minivan at the side-street loading zone', '侧街装卸区的银色面包车', 2);

alter table public.pickup_locations enable row level security;

create policy "Anyone can read active locations; admins can read all"
  on public.pickup_locations for select
  to anon, authenticated
  using (active or (select public.is_admin()));

create policy "Admins can add locations"
  on public.pickup_locations for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can change locations"
  on public.pickup_locations for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Dish library and daily lunchboxes
-- ---------------------------------------------------------------------------

create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  -- Both names in one field, shown as entered, e.g. '回锅肉 Twice-cooked pork'.
  name text not null,
  description_en text not null default '',
  description_zh text not null default '',
  -- Path of the photo in Supabase Storage; null until one is uploaded.
  photo_path text,
  created_at timestamptz not null default now()
);

-- One lunchbox per delivery day.
create table public.lunchboxes (
  delivery_date date primary key,
  -- What comes with the dishes, e.g. 'Served with steamed rice'.
  sides_en text not null default '',
  sides_zh text not null default '',
  created_at timestamptz not null default now()
);

create table public.lunchbox_dishes (
  delivery_date date not null references public.lunchboxes (delivery_date) on delete cascade,
  dish_id uuid not null references public.dishes (id) on delete restrict,
  -- Display order within the box.
  position integer not null default 0,
  primary key (delivery_date, dish_id)
);

create index lunchbox_dishes_dish_id_idx on public.lunchbox_dishes (dish_id);

alter table public.dishes enable row level security;
alter table public.lunchboxes enable row level security;
alter table public.lunchbox_dishes enable row level security;

create policy "Anyone can read dishes"
  on public.dishes for select to anon, authenticated using (true);
create policy "Admins can manage dishes"
  on public.dishes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Anyone can read lunchboxes"
  on public.lunchboxes for select to anon, authenticated using (true);
create policy "Admins can manage lunchboxes"
  on public.lunchboxes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Anyone can read what's in each lunchbox"
  on public.lunchbox_dishes for select to anon, authenticated using (true);
create policy "Admins can manage what's in each lunchbox"
  on public.lunchbox_dishes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  delivery_date date not null references public.lunchboxes (delivery_date) on delete restrict,
  location_id uuid not null references public.pickup_locations (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  -- Prices are copied onto the order so later price changes don't rewrite history.
  unit_price_cents integer not null check (unit_price_cents > 0),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  tax_cents integer not null check (tax_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  -- Only 'confirmed' once the server has verified payment.
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'confirmed', 'cancelled', 'refunded')),
  -- Set when the family taps "Arrived" for this order's location.
  arrived_at timestamptz,
  picked_up_at timestamptz,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index orders_customer_id_idx on public.orders (customer_id);
create index orders_delivery_date_location_idx on public.orders (delivery_date, location_id);
create index orders_location_id_idx on public.orders (location_id);

alter table public.orders enable row level security;

create policy "Customers can read their own orders; admins can read all"
  on public.orders for select
  to authenticated
  using (customer_id = (select auth.uid()) or (select public.is_admin()));

create policy "Admins can update orders"
  on public.orders for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- No insert or delete policies: orders are created by the checkout server function
-- (which bypasses RLS with the secret key) and are cancelled or refunded, never deleted.
