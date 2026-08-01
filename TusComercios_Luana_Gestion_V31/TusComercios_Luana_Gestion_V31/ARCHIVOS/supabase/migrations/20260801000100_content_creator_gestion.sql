-- Cuenta especial de producción, TusComercios Gestión y precio vigente.

create table if not exists public.tc_special_access (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  access_role text not null check (access_role in ('content_creator')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tc_special_access enable row level security;
revoke all on public.tc_special_access from anon, authenticated;

insert into public.tc_special_access (email, access_role, active)
values ('luanasolis260@gmail.com', 'content_creator', true)
on conflict (email) do update set
  access_role = excluded.access_role,
  active = true,
  updated_at = now();

create or replace function public.is_tc_content_creator(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users u
    join public.tc_special_access a on lower(a.email) = lower(u.email)
    where u.id = check_user_id
      and a.active = true
      and a.access_role = 'content_creator'
  );
$$;

revoke all on function public.is_tc_content_creator(uuid) from public;
grant execute on function public.is_tc_content_creator(uuid) to authenticated;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_tc_admin(auth.uid()) then
    return new;
  end if;

  if public.is_tc_content_creator(auth.uid()) then
    new.id := auth.uid();
    new.role := 'content_creator';
    new.plan := 'premium';
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.id := auth.uid();
    new.role := 'user';
    new.plan := 'free';
  else
    new.id := old.id;
    new.role := old.role;
    new.plan := old.plan;
  end if;
  return new;
end;
$$;

create or replace function public.protect_business_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare owner_plan text;
begin
  if auth.role() = 'service_role' or public.is_tc_admin(auth.uid()) then
    return new;
  end if;

  if public.is_tc_content_creator(auth.uid()) then
    new.user_id := auth.uid();
    new.plan := 'premium';
    return new;
  end if;

  if tg_op = 'INSERT' then
    select lower(coalesce(plan, 'free')) into owner_plan
    from public.profiles where id = auth.uid();
    new.user_id := auth.uid();
    new.plan := coalesce(owner_plan, 'free');
  else
    new.user_id := old.user_id;
    new.plan := old.plan;
  end if;
  return new;
end;
$$;

alter table public.administration_subscriptions
  alter column monthly_price set default 24999;

update public.administration_subscriptions
set monthly_price = 24999, updated_at = now()
where status <> 'authorized' or mp_subscription_id is null;

create or replace function public.provision_content_creator_access()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_business uuid;
begin
  if v_user is null or not public.is_tc_content_creator(v_user) then
    return null;
  end if;

  insert into public.profiles (id, role, plan)
  values (v_user, 'content_creator', 'premium')
  on conflict (id) do update set role = 'content_creator', plan = 'premium';

  select id into v_business
  from public.businesses
  where user_id = v_user
  order by created_at asc nulls last
  limit 1;

  if v_business is null then
    insert into public.businesses (
      user_id, negocio, rubro, ciudad, provincia, direccion,
      descripcion, whatsapp, plan, status
    ) values (
      v_user, 'Comercio Demo de Luana', 'Marketing y creación de contenido',
      'Villa Dolores', 'Córdoba', 'Espacio privado de demostración',
      'Comercio privado para auditar y mostrar las herramientas de TusComercios.',
      '', 'premium', 'draft'
    ) returning id into v_business;
  else
    update public.businesses set plan = 'premium' where id = v_business;
  end if;

  insert into public.administration_subscriptions (
    business_id, user_id, status, monthly_price,
    mp_subscription_id, first_authorized_at, current_period_end, last_status_changed_at
  ) values (
    v_business, v_user, 'authorized', 24999, 'content-creator-access',
    now(), timestamptz '2099-12-31 23:59:59+00', now()
  )
  on conflict (business_id) do update set
    user_id = excluded.user_id,
    status = 'authorized',
    monthly_price = 24999,
    mp_subscription_id = 'content-creator-access',
    first_authorized_at = coalesce(public.administration_subscriptions.first_authorized_at, now()),
    current_period_end = timestamptz '2099-12-31 23:59:59+00',
    last_status_changed_at = now(),
    updated_at = now();

  return v_business;
end;
$$;

revoke all on function public.provision_content_creator_access() from public;
grant execute on function public.provision_content_creator_access() to authenticated;

create or replace function public.start_administration_trial(p_business_id uuid)
returns public.administration_subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_subscription public.administration_subscriptions;
begin
  if v_user is null then raise exception 'Debés iniciar sesión.'; end if;
  if not exists (
    select 1 from public.businesses b
    where b.id = p_business_id and (b.user_id = v_user or public.is_tc_admin())
  ) then raise exception 'No podés activar Gestión para este negocio.'; end if;

  select * into v_subscription from public.administration_subscriptions
  where business_id = p_business_id for update;
  if found and (v_subscription.trial_started_at is not null or v_subscription.status = 'authorized') then
    return v_subscription;
  end if;

  insert into public.administration_subscriptions (
    business_id, user_id, status, monthly_price,
    trial_started_at, trial_ends_at, last_status_changed_at
  ) values (p_business_id, v_user, 'trial', 24999, now(), now() + interval '10 days', now())
  on conflict (business_id) do update set
    user_id = excluded.user_id, status = 'trial', monthly_price = 24999,
    trial_started_at = now(), trial_ends_at = now() + interval '10 days',
    last_status_changed_at = now(), updated_at = now()
  returning * into v_subscription;
  return v_subscription;
end;
$$;

revoke all on function public.start_administration_trial(uuid) from public;
grant execute on function public.start_administration_trial(uuid) to authenticated;

create or replace function public.claim_studio_usage(p_business_id uuid, p_content_type text)
returns table (allowed boolean, usage_id text, used integer, daily_limit integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid(); v_plan text; v_role text; v_limit integer;
  v_used integer; v_usage_id text; v_start timestamptz; v_end timestamptz;
begin
  if v_user_id is null then raise exception 'Sesión requerida'; end if;
  if p_content_type not in ('image', 'reel', 'carousel') then raise exception 'Tipo de contenido inválido'; end if;
  select lower(coalesce(p.role, 'user')) into v_role from public.profiles p where p.id = v_user_id;
  select lower(coalesce(b.plan, 'free')) into v_plan from public.businesses b
  where b.id = p_business_id and (b.user_id = v_user_id or v_role = 'admin') for update;
  if v_plan is null then raise exception 'No tenés permiso para usar este comercio'; end if;

  if v_role in ('admin', 'content_creator') then v_limit := 2147483647;
  elsif v_plan in ('standard', 'estandar') and p_content_type = 'image' then v_limit := 10;
  elsif v_plan in ('standard', 'estandar') and p_content_type = 'reel' then v_limit := 1;
  elsif v_plan in ('standard', 'estandar') and p_content_type = 'carousel' then v_limit := 2;
  elsif v_plan = 'premium' and p_content_type = 'image' then v_limit := 20;
  elsif v_plan = 'premium' and p_content_type = 'reel' then v_limit := 2;
  elsif v_plan = 'premium' and p_content_type = 'carousel' then v_limit := 4;
  else v_limit := 0; end if;

  v_start := date_trunc('day', now() at time zone 'America/Argentina/Cordoba') at time zone 'America/Argentina/Cordoba';
  v_end := v_start + interval '1 day';
  select count(*)::integer into v_used from public.studio_usage s
  where s.user_id = v_user_id and s.business_id = p_business_id
    and s.content_type = p_content_type and s.created_at >= v_start and s.created_at < v_end;
  if v_used >= v_limit then return query select false, null::text, v_used, v_limit; return; end if;
  insert into public.studio_usage (user_id, business_id, content_type, plan)
  values (v_user_id, p_business_id, p_content_type, v_plan) returning id::text into v_usage_id;
  return query select true, v_usage_id, v_used + 1, v_limit;
end;
$$;

revoke all on function public.claim_studio_usage(uuid, text) from public;
grant execute on function public.claim_studio_usage(uuid, text) to authenticated;
