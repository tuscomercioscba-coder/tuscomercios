-- Cupones, vendedores, comisiones y colaboradores autorizados.

create table if not exists public.commercial_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  code_type text not null check (code_type in ('discount', 'seller')),
  description text,
  discount_type text check (discount_type in ('percent', 'fixed')),
  discount_value numeric(14,2) not null default 0 check (discount_value >= 0),
  commission_type text check (commission_type in ('percent', 'fixed')),
  commission_value numeric(14,2) not null default 0 check (commission_value >= 0),
  seller_name text,
  seller_email text,
  payout_weekday integer not null default 6 check (payout_weekday between 0 and 6),
  applies_to text[] not null default array['standard','premium','gestion'],
  max_uses integer check (max_uses is null or max_uses > 0),
  expires_at timestamptz,
  active boolean not null default true,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (code_type = 'discount' and discount_type is not null and discount_value > 0)
    or (code_type = 'seller' and commission_type is not null and commission_value >= 0)
  )
);

create table if not exists public.commercial_code_uses (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.commercial_codes(id),
  user_id uuid not null references auth.users(id),
  business_id uuid references public.businesses(id),
  purchase_type text not null check (purchase_type in ('standard','premium','gestion')),
  mp_subscription_id text not null,
  original_amount numeric(14,2) not null,
  charged_amount numeric(14,2) not null,
  status text not null default 'pending' check (status in ('pending','authorized','cancelled','paused')),
  authorized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mp_subscription_id)
);

create table if not exists public.seller_commissions (
  id uuid primary key default gen_random_uuid(),
  code_use_id uuid not null references public.commercial_code_uses(id) on delete cascade,
  code_id uuid not null references public.commercial_codes(id),
  seller_name text not null,
  seller_email text,
  base_amount numeric(14,2) not null,
  commission_amount numeric(14,2) not null,
  sale_date timestamptz not null,
  scheduled_payment_date date not null,
  status text not null default 'pending' check (status in ('pending','paid','cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (code_use_id)
);

alter table public.commercial_codes enable row level security;
alter table public.commercial_code_uses enable row level security;
alter table public.seller_commissions enable row level security;

create policy commercial_codes_admin_all on public.commercial_codes
  for all to authenticated using (public.is_tc_admin()) with check (public.is_tc_admin());
create policy code_uses_admin_read on public.commercial_code_uses
  for select to authenticated using (public.is_tc_admin());
create policy commissions_admin_all on public.seller_commissions
  for all to authenticated using (public.is_tc_admin()) with check (public.is_tc_admin());

revoke all on public.commercial_codes, public.commercial_code_uses, public.seller_commissions from anon;
grant select, insert, update, delete on public.commercial_codes to authenticated;
grant select on public.commercial_code_uses to authenticated;
grant select, update on public.seller_commissions to authenticated;

create or replace function public.admin_add_content_collaborator(p_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare v_email text := lower(trim(p_email)); v_user uuid;
begin
  if not public.is_tc_admin() then raise exception 'Acceso exclusivo del administrador'; end if;
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Correo inválido'; end if;

  insert into public.tc_special_access (email, access_role, active)
  values (v_email, 'content_creator', true)
  on conflict (email) do update set active = true, updated_at = now();

  select id into v_user from auth.users where lower(email) = v_email limit 1;
  if v_user is null then return 'Correo autorizado. El espacio se creará en su primer ingreso con Google.'; end if;

  insert into public.profiles (id, role, plan) values (v_user, 'content_creator', 'premium')
  on conflict (id) do update set role = 'content_creator', plan = 'premium';
  return 'Correo autorizado. Debe cerrar sesión y volver a ingresar con Google.';
end;
$$;

revoke all on function public.admin_add_content_collaborator(text) from public;
grant execute on function public.admin_add_content_collaborator(text) to authenticated;

create or replace function public.admin_set_collaborator_active(p_email text, p_active boolean)
returns void language plpgsql security definer set search_path = public, auth as $$
declare v_user uuid;
begin
  if not public.is_tc_admin() then raise exception 'Acceso exclusivo del administrador'; end if;
  update public.tc_special_access set active = p_active, updated_at = now()
  where lower(email) = lower(trim(p_email));
  select id into v_user from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if v_user is not null and not p_active then
    update public.profiles set role = 'user', plan = 'free' where id = v_user;
    update public.administration_subscriptions
    set status = 'cancelled', current_period_end = now(), last_status_changed_at = now(), updated_at = now()
    where user_id = v_user and mp_subscription_id = 'content-creator-access';
  end if;
end; $$;
revoke all on function public.admin_set_collaborator_active(text, boolean) from public;
grant execute on function public.admin_set_collaborator_active(text, boolean) to authenticated;

create or replace function public.admin_list_content_collaborators()
returns table(email text, active boolean, created_at timestamptz)
language sql security definer set search_path = public as $$
  select a.email, a.active, a.created_at from public.tc_special_access a
  where public.is_tc_admin() order by a.created_at desc;
$$;
revoke all on function public.admin_list_content_collaborators() from public;
grant execute on function public.admin_list_content_collaborators() to authenticated;

create or replace function public.admin_mark_commission_paid(p_commission_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_tc_admin() then raise exception 'Acceso exclusivo del administrador'; end if;
  update public.seller_commissions set status = 'paid', paid_at = now() where id = p_commission_id;
end; $$;
revoke all on function public.admin_mark_commission_paid(uuid) from public;
grant execute on function public.admin_mark_commission_paid(uuid) to authenticated;

-- Cada nuevo correo autorizado recibe un espacio demo privado y completo al ingresar.
create or replace function public.provision_content_creator_access()
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid := auth.uid();
  v_business uuid;
  v_slug text;
  v_email text;
  v_label text;
begin
  if v_user is null or not public.is_tc_content_creator(v_user) then return null; end if;

  select email into v_email from auth.users where id = v_user;
  v_label := initcap(replace(split_part(coalesce(v_email, 'colaborador'), '@', 1), '.', ' '));

  insert into public.profiles (id, role, plan)
  values (v_user, 'content_creator', 'premium')
  on conflict (id) do update set role = 'content_creator', plan = 'premium';

  select id into v_business from public.businesses
  where user_id = v_user order by created_at asc nulls last limit 1;

  if v_business is null then
    v_slug := 'studio-demo-' || replace(left(v_user::text, 8), '-', '');
    insert into public.businesses (
      user_id, negocio, slug, rubro, ciudad, provincia, direccion,
      descripcion, whatsapp, plan, status
    ) values (
      v_user, 'Demo de ' || v_label, v_slug,
      'Marketing y creación de contenido', 'Villa Dolores', 'Córdoba',
      'Espacio privado de demostración',
      'Comercio privado preparado para probar Studio y TusComercios Gestión.',
      '', 'premium', 'draft'
    ) returning id into v_business;
  else
    update public.businesses set plan = 'premium' where id = v_business;
  end if;

  insert into public.administration_subscriptions (
    business_id, user_id, status, monthly_price, mp_subscription_id,
    first_authorized_at, current_period_end, last_status_changed_at
  ) values (
    v_business, v_user, 'authorized', 24999, 'content-creator-access',
    now(), timestamptz '2099-12-31 23:59:59+00', now()
  )
  on conflict (business_id) do update set
    user_id = excluded.user_id, status = 'authorized', monthly_price = 24999,
    mp_subscription_id = 'content-creator-access',
    first_authorized_at = coalesce(public.administration_subscriptions.first_authorized_at, now()),
    current_period_end = timestamptz '2099-12-31 23:59:59+00',
    last_status_changed_at = now(), updated_at = now();
  return v_business;
end;
$$;
revoke all on function public.provision_content_creator_access() from public;
grant execute on function public.provision_content_creator_access() to authenticated;
