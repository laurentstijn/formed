-- Admins table (referencing auth.users)
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamp with time zone default now()
);

alter table public.admins enable row level security;

-- Only admins can view admin table
create policy "admins_select_own"
  on public.admins for select
  using (auth.uid() = id);

-- Customers table (guest checkouts)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text,
  created_at timestamp with time zone default now()
);

alter table public.customers enable row level security;

-- Customers can view their own data by email
create policy "customers_select_own"
  on public.customers for select
  using (auth.jwt() ->> 'email' = email);

-- Anyone can insert (for guest checkout)
create policy "customers_insert"
  on public.customers for insert
  with check (true);

-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  email text not null,
  first_name text not null,
  last_name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  postal_code text not null,
  country text not null default 'België',
  phone text,
  items jsonb not null, -- Array of {product_id, name, price, quantity, color}
  total_amount numeric(10,2) not null,
  status text not null default 'pending', -- pending, processing, shipped, delivered, cancelled
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.orders enable row level security;

-- Admins can view all orders
create policy "admins_view_all_orders"
  on public.orders for select
  using (auth.uid() in (select id from public.admins));

-- Admins can update order status
create policy "admins_update_orders"
  on public.orders for update
  using (auth.uid() in (select id from public.admins));

-- Anyone can create orders (guest checkout)
create policy "orders_insert"
  on public.orders for insert
  with check (true);

-- Customers can view their own orders by email
create policy "customers_view_own_orders"
  on public.orders for select
  using (email = auth.jwt() ->> 'email' or auth.uid() in (select id from public.admins));
