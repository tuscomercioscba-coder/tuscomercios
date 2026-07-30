alter table public.administration_subscriptions
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists first_authorized_at timestamptz,
  add column if not exists last_status_changed_at timestamptz default now();

alter table public.administration_subscriptions
  drop constraint if exists administration_subscriptions_status_check;

alter table public.administration_subscriptions
  add constraint administration_subscriptions_status_check
  check (status in ('trial', 'pending', 'authorized', 'paused', 'cancelled'));

create index if not exists administration_subscriptions_trial_idx
  on public.administration_subscriptions (trial_ends_at)
  where status = 'trial';

drop policy if exists tc_admin_owner on public.administration_subscriptions;
create policy tc_admin_subscription_owner_read
  on public.administration_subscriptions
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_tc_admin());

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
  if v_user is null then
    raise exception 'Debés iniciar sesión.';
  end if;

  if not exists (
    select 1 from public.businesses b
    where b.id = p_business_id
      and (b.user_id = v_user or public.is_tc_admin())
  ) then
    raise exception 'No podés activar Administración para este negocio.';
  end if;

  select * into v_subscription
  from public.administration_subscriptions
  where business_id = p_business_id
  for update;

  if found and v_subscription.trial_started_at is not null then
    return v_subscription;
  end if;

  if found and v_subscription.status = 'authorized' then
    return v_subscription;
  end if;

  insert into public.administration_subscriptions (
    business_id, user_id, status, monthly_price,
    trial_started_at, trial_ends_at, last_status_changed_at
  )
  values (
    p_business_id, v_user, 'trial', 59999,
    now(), now() + interval '10 days', now()
  )
  on conflict (business_id) do update set
    user_id = excluded.user_id,
    status = 'trial',
    trial_started_at = now(),
    trial_ends_at = now() + interval '10 days',
    last_status_changed_at = now(),
    updated_at = now()
  returning * into v_subscription;

  return v_subscription;
end;
$$;

revoke all on function public.start_administration_trial(uuid) from public;
grant execute on function public.start_administration_trial(uuid) to authenticated;

create or replace function public.can_manage_administration(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_tc_admin()
    or exists (
      select 1
      from public.businesses b
      join public.administration_subscriptions s
        on s.business_id = b.id
      where b.id = p_business_id
        and b.user_id = auth.uid()
        and (
          (s.status = 'authorized'
            and (s.current_period_end is null or s.current_period_end > now()))
          or
          (s.status = 'trial' and s.trial_ends_at > now())
        )
    );
$$;
