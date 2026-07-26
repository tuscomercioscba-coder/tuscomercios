-- Seguridad central de TusComercios.
-- Impide que un usuario se asigne Premium, cambie propietarios o active pagos.

create or replace function public.is_tc_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user_id
      and lower(coalesce(role, '')) = 'admin'
  );
$$;

revoke all on function public.is_tc_admin(uuid) from public;
grant execute on function public.is_tc_admin(uuid) to anon, authenticated;

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

drop trigger if exists protect_profile_privileges_trigger on public.profiles;
create trigger protect_profile_privileges_trigger
before insert or update on public.profiles
for each row execute function public.protect_profile_privileges();

create or replace function public.protect_business_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_plan text;
begin
  if auth.role() = 'service_role' or public.is_tc_admin(auth.uid()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    select lower(coalesce(plan, 'free'))
      into owner_plan
    from public.profiles
    where id = auth.uid();

    new.user_id := auth.uid();
    new.plan := coalesce(owner_plan, 'free');
  else
    new.user_id := old.user_id;
    new.plan := old.plan;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_business_privileges_trigger on public.businesses;
create trigger protect_business_privileges_trigger
before insert or update on public.businesses
for each row execute function public.protect_business_privileges();

create or replace function public.protect_banner_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_tc_admin(auth.uid()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.user_id := auth.uid();
    new.active := false;
    new.payment_status := 'pending';
    new.price := 50000;
    new.amount := 50000;
  else
    new.user_id := old.user_id;
    new.active := old.active;
    new.payment_status := old.payment_status;
    new.price := old.price;
    new.amount := old.amount;
    new.mp_subscription_id := old.mp_subscription_id;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_banner_payment_trigger on public.banners;
create trigger protect_banner_payment_trigger
before insert or update on public.banners
for each row execute function public.protect_banner_payment();

do $$
declare
  table_name text;
  policy_record record;
begin
  foreach table_name in array array[
    'profiles',
    'businesses',
    'subscriptions',
    'banners',
    'studio_library',
    'studio_brand_kits',
    'studio_workspaces',
    'studio_usage'
  ]
  loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);

      for policy_record in
        select policyname
        from pg_policies
        where schemaname = 'public'
          and tablename = table_name
      loop
        execute format(
          'drop policy if exists %I on public.%I',
          policy_record.policyname,
          table_name
        );
      end loop;
    end if;
  end loop;
end $$;

create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_tc_admin());

create policy "profiles_insert"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid() or public.is_tc_admin());

create policy "profiles_update"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_tc_admin())
  with check (id = auth.uid() or public.is_tc_admin());

create policy "businesses_public_select"
  on public.businesses for select
  to anon, authenticated
  using (
    coalesce(status, 'published') = 'published'
    or user_id = auth.uid()
    or public.is_tc_admin()
  );

create policy "businesses_insert"
  on public.businesses for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_tc_admin());

create policy "businesses_update"
  on public.businesses for update
  to authenticated
  using (user_id = auth.uid() or public.is_tc_admin())
  with check (user_id = auth.uid() or public.is_tc_admin());

create policy "businesses_delete"
  on public.businesses for delete
  to authenticated
  using (user_id = auth.uid() or public.is_tc_admin());

create policy "subscriptions_select"
  on public.subscriptions for select
  to authenticated
  using (user_id = auth.uid() or public.is_tc_admin());

create policy "banners_public_select"
  on public.banners for select
  to anon, authenticated
  using (
    active = true
    or user_id = auth.uid()
    or public.is_tc_admin()
  );

create policy "banners_insert"
  on public.banners for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_tc_admin());

create policy "banners_update"
  on public.banners for update
  to authenticated
  using (user_id = auth.uid() or public.is_tc_admin())
  with check (user_id = auth.uid() or public.is_tc_admin());

create policy "banners_delete"
  on public.banners for delete
  to authenticated
  using (user_id = auth.uid() or public.is_tc_admin());

create policy "studio_library_owner"
  on public.studio_library for all
  to authenticated
  using (user_id = auth.uid() or public.is_tc_admin())
  with check (user_id = auth.uid() or public.is_tc_admin());

create policy "studio_brand_kits_owner"
  on public.studio_brand_kits for all
  to authenticated
  using (user_id = auth.uid() or public.is_tc_admin())
  with check (user_id = auth.uid() or public.is_tc_admin());

create policy "studio_workspaces_admin"
  on public.studio_workspaces for all
  to authenticated
  using (owner_id = auth.uid() and public.is_tc_admin())
  with check (owner_id = auth.uid() and public.is_tc_admin());

create policy "studio_usage_select"
  on public.studio_usage for select
  to authenticated
  using (user_id = auth.uid() or public.is_tc_admin());

revoke insert, update, delete on public.subscriptions from anon, authenticated;
revoke insert, update, delete on public.studio_usage from anon, authenticated;
