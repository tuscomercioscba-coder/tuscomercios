-- Corrige la creación del comercio demo: businesses requiere un slug.

create or replace function public.provision_content_creator_access()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_business uuid;
  v_slug text;
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
    v_slug := 'studio-demo-luana-' || replace(left(v_user::text, 8), '-', '');

    insert into public.businesses (
      user_id, negocio, slug, rubro, ciudad, provincia, direccion,
      descripcion, whatsapp, plan, status
    ) values (
      v_user, 'Comercio Demo de Luana', v_slug,
      'Marketing y creación de contenido', 'Villa Dolores', 'Córdoba',
      'Espacio privado de demostración',
      'Comercio privado para auditar y mostrar las herramientas de TusComercios.',
      '', 'premium', 'draft'
    ) returning id into v_business;
  else
    update public.businesses
    set plan = 'premium'
    where id = v_business;
  end if;

  insert into public.administration_subscriptions (
    business_id, user_id, status, monthly_price, mp_subscription_id,
    first_authorized_at, current_period_end, last_status_changed_at
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
