-- TusComercios Administración V1.
-- Servicio adicional: ARS 59.999 mensuales.

create table if not exists public.administration_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'authorized', 'paused', 'cancelled')),
  monthly_price numeric(14,2) not null default 59999,
  mp_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id)
);

create or replace function public.can_manage_administration(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = p_business_id
      and (b.user_id = auth.uid() or public.is_tc_admin())
  );
$$;

revoke all on function public.can_manage_administration(uuid) from public;
grant execute on function public.can_manage_administration(uuid) to authenticated;

create table if not exists public.admin_branches (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  is_main boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);

create table if not exists public.admin_products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.admin_categories(id) on delete set null,
  barcode text,
  internal_code text,
  name text not null,
  description text,
  unit text not null default 'unidad',
  cost numeric(14,2) not null default 0 check (cost >= 0),
  sale_price numeric(14,2) not null default 0 check (sale_price >= 0),
  profit_percent numeric(9,2),
  minimum_stock numeric(14,3) not null default 0 check (minimum_stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists admin_products_barcode_unique
  on public.admin_products (business_id, barcode)
  where barcode is not null and barcode <> '';

create table if not exists public.admin_branch_stock (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid not null references public.admin_branches(id) on delete cascade,
  product_id uuid not null references public.admin_products(id) on delete cascade,
  quantity numeric(14,3) not null default 0,
  updated_at timestamptz not null default now(),
  unique (branch_id, product_id)
);

create table if not exists public.admin_inventory_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid not null references public.admin_branches(id) on delete restrict,
  product_id uuid not null references public.admin_products(id) on delete restrict,
  movement_type text not null
    check (movement_type in ('initial', 'purchase', 'sale', 'return', 'adjustment', 'transfer_in', 'transfer_out')),
  quantity numeric(14,3) not null check (quantity <> 0),
  unit_cost numeric(14,2),
  reference_type text,
  reference_id uuid,
  notes text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  document text,
  phone text,
  email text,
  address text,
  credit_limit numeric(14,2) not null default 0,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_suppliers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  tax_id text,
  phone text,
  email text,
  address text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_employees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid references public.admin_branches(id) on delete set null,
  name text not null,
  document text,
  role_name text,
  salary numeric(14,2) not null default 0,
  commission_percent numeric(9,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_cash_sessions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid not null references public.admin_branches(id) on delete restrict,
  opened_by uuid not null default auth.uid() references auth.users(id),
  opened_at timestamptz not null default now(),
  opening_amount numeric(14,2) not null default 0,
  closed_at timestamptz,
  closing_amount numeric(14,2),
  expected_amount numeric(14,2),
  difference numeric(14,2),
  status text not null default 'open' check (status in ('open', 'closed')),
  notes text
);

create unique index if not exists admin_cash_one_open_per_branch
  on public.admin_cash_sessions (branch_id)
  where status = 'open';

create table if not exists public.admin_sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid not null references public.admin_branches(id) on delete restrict,
  cash_session_id uuid references public.admin_cash_sessions(id) on delete set null,
  customer_id uuid references public.admin_customers(id) on delete set null,
  employee_id uuid references public.admin_employees(id) on delete set null,
  sale_number bigint generated by default as identity,
  status text not null default 'completed'
    check (status in ('draft', 'completed', 'cancelled', 'returned')),
  payment_method text not null default 'cash',
  subtotal numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  paid_amount numeric(14,2) not null default 0,
  balance_due numeric(14,2) not null default 0,
  notes text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.admin_sales(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid references public.admin_products(id) on delete set null,
  description text not null,
  barcode text,
  quantity numeric(14,3) not null check (quantity > 0),
  unit_cost numeric(14,2) not null default 0,
  unit_price numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null default 0
);

create table if not exists public.admin_cash_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid not null references public.admin_branches(id) on delete restrict,
  cash_session_id uuid references public.admin_cash_sessions(id) on delete set null,
  movement_type text not null check (movement_type in ('income', 'expense')),
  category text not null,
  description text not null,
  amount numeric(14,2) not null check (amount > 0),
  payment_method text not null default 'cash',
  fixed_expense boolean not null default false,
  variable_expense boolean not null default false,
  sale_id uuid references public.admin_sales(id) on delete set null,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_account_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.admin_customers(id) on delete cascade,
  supplier_id uuid references public.admin_suppliers(id) on delete cascade,
  movement_type text not null check (movement_type in ('debit', 'credit')),
  amount numeric(14,2) not null check (amount > 0),
  due_date date,
  description text not null,
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now(),
  check (
    (customer_id is not null and supplier_id is null)
    or (customer_id is null and supplier_id is not null)
  )
);

create table if not exists public.admin_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid references public.admin_branches(id) on delete set null,
  customer_id uuid references public.admin_customers(id) on delete set null,
  document_type text not null check (document_type in ('quote', 'delivery_note', 'internal_receipt')),
  document_number bigint generated by default as identity,
  status text not null default 'draft'
    check (status in ('draft', 'issued', 'accepted', 'cancelled')),
  issue_date date not null default current_date,
  valid_until date,
  subtotal numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_document_items (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.admin_documents(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid references public.admin_products(id) on delete set null,
  description text not null,
  quantity numeric(14,3) not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null default 0
);

create table if not exists public.admin_audit_log (
  id bigint generated by default as identity primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_products_search_idx
  on public.admin_products (business_id, name);
create index if not exists admin_stock_alert_idx
  on public.admin_branch_stock (business_id, branch_id, quantity);
create index if not exists admin_sales_date_idx
  on public.admin_sales (business_id, created_at desc);
create index if not exists admin_cash_movements_date_idx
  on public.admin_cash_movements (business_id, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'administration_subscriptions', 'admin_branches', 'admin_categories',
    'admin_products', 'admin_branch_stock', 'admin_inventory_movements',
    'admin_customers', 'admin_suppliers', 'admin_employees',
    'admin_cash_sessions', 'admin_sales', 'admin_sale_items',
    'admin_cash_movements', 'admin_account_movements', 'admin_documents',
    'admin_document_items', 'admin_audit_log'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists tc_admin_owner on public.%I', table_name);
    execute format(
      'create policy tc_admin_owner on public.%I for all to authenticated using (public.can_manage_administration(business_id)) with check (public.can_manage_administration(business_id))',
      table_name
    );
  end loop;
end $$;

-- El cliente no puede activarse ni cambiar el precio del módulo.
revoke insert, update, delete on public.administration_subscriptions
  from anon, authenticated;
grant select on public.administration_subscriptions to authenticated;

grant select, insert, update, delete on
  public.admin_branches, public.admin_categories, public.admin_products,
  public.admin_branch_stock, public.admin_inventory_movements,
  public.admin_customers, public.admin_suppliers, public.admin_employees,
  public.admin_cash_sessions, public.admin_sales, public.admin_sale_items,
  public.admin_cash_movements, public.admin_account_movements,
  public.admin_documents, public.admin_document_items, public.admin_audit_log
to authenticated;
