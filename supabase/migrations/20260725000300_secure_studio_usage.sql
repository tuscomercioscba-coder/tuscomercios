-- Límites de Studio validados en el servidor.
-- Estándar: 10 imágenes y 1 Reel por día.
-- Premium: 20 imágenes y 2 Reels por día.

alter table public.studio_usage enable row level security;

drop policy if exists "Usuarios leen su uso de Studio" on public.studio_usage;
create policy "Usuarios leen su uso de Studio"
  on public.studio_usage
  for select
  to authenticated
  using (user_id = auth.uid());

revoke insert, update, delete on public.studio_usage from anon, authenticated;

create or replace function public.claim_studio_usage(
  p_business_id uuid,
  p_content_type text
)
returns table (
  allowed boolean,
  usage_id text,
  used integer,
  daily_limit integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan text;
  v_role text;
  v_limit integer;
  v_used integer;
  v_usage_id text;
  v_start timestamptz;
  v_end timestamptz;
begin
  if v_user_id is null then
    raise exception 'Sesión requerida';
  end if;

  if p_content_type not in ('image', 'reel') then
    raise exception 'Tipo de contenido inválido';
  end if;

  select lower(coalesce(p.role, 'user'))
    into v_role
  from public.profiles p
  where p.id = v_user_id;

  select lower(coalesce(b.plan, 'free'))
    into v_plan
  from public.businesses b
  where b.id = p_business_id
    and (b.user_id = v_user_id or v_role = 'admin')
  for update;

  if v_plan is null then
    raise exception 'No tenés permiso para usar este comercio';
  end if;

  if v_role = 'admin' then
    v_limit := 2147483647;
  elsif v_plan = 'standard' and p_content_type = 'image' then
    v_limit := 10;
  elsif v_plan = 'standard' and p_content_type = 'reel' then
    v_limit := 1;
  elsif v_plan = 'premium' and p_content_type = 'image' then
    v_limit := 20;
  elsif v_plan = 'premium' and p_content_type = 'reel' then
    v_limit := 2;
  else
    v_limit := 0;
  end if;

  v_start := date_trunc('day', now() at time zone 'America/Argentina/Cordoba')
    at time zone 'America/Argentina/Cordoba';
  v_end := v_start + interval '1 day';

  select count(*)::integer
    into v_used
  from public.studio_usage s
  where s.user_id = v_user_id
    and s.business_id = p_business_id
    and s.content_type = p_content_type
    and s.created_at >= v_start
    and s.created_at < v_end;

  if v_used >= v_limit then
    return query select false, null::text, v_used, v_limit;
    return;
  end if;

  insert into public.studio_usage (
    user_id,
    business_id,
    content_type,
    plan
  )
  values (
    v_user_id,
    p_business_id,
    p_content_type,
    v_plan
  )
  returning id::text into v_usage_id;

  return query select true, v_usage_id, v_used + 1, v_limit;
end;
$$;

create or replace function public.release_studio_usage(p_usage_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.studio_usage
  where id::text = p_usage_id
    and user_id = auth.uid()
    and created_at >= now() - interval '30 minutes';

  get diagnostics v_deleted = row_count;
  return v_deleted > 0;
end;
$$;

revoke all on function public.claim_studio_usage(uuid, text) from public;
revoke all on function public.release_studio_usage(text) from public;
grant execute on function public.claim_studio_usage(uuid, text) to authenticated;
grant execute on function public.release_studio_usage(text) to authenticated;
