-- Auditoría final de TusComercios Administración.
-- Evita relaciones cruzadas entre negocios y pagos mayores a la deuda.

create or replace function public.validate_administration_row_business()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_table_name = 'administration_subscriptions' then
    if not exists (
      select 1 from public.businesses
      where id = new.business_id and user_id = new.user_id
    ) then
      raise exception 'La suscripción no coincide con el titular del negocio';
    end if;
    return new;
  end if;

  if to_jsonb(new) ? 'branch_id'
    and nullif(to_jsonb(new)->>'branch_id', '') is not null
    and not exists (
      select 1 from public.admin_branches
      where id = (to_jsonb(new)->>'branch_id')::uuid
        and business_id = new.business_id
    ) then
    raise exception 'La sucursal no pertenece al negocio';
  end if;

  if to_jsonb(new) ? 'from_branch_id'
    and not exists (
      select 1 from public.admin_branches
      where id = (to_jsonb(new)->>'from_branch_id')::uuid
        and business_id = new.business_id
    ) then
    raise exception 'La sucursal de origen no pertenece al negocio';
  end if;

  if to_jsonb(new) ? 'to_branch_id'
    and not exists (
      select 1 from public.admin_branches
      where id = (to_jsonb(new)->>'to_branch_id')::uuid
        and business_id = new.business_id
    ) then
    raise exception 'La sucursal de destino no pertenece al negocio';
  end if;

  if to_jsonb(new) ? 'product_id'
    and nullif(to_jsonb(new)->>'product_id', '') is not null
    and not exists (
      select 1 from public.admin_products
      where id = (to_jsonb(new)->>'product_id')::uuid
        and business_id = new.business_id
    ) then
    raise exception 'El producto no pertenece al negocio';
  end if;

  if to_jsonb(new) ? 'customer_id'
    and nullif(to_jsonb(new)->>'customer_id', '') is not null
    and not exists (
      select 1 from public.admin_customers
      where id = (to_jsonb(new)->>'customer_id')::uuid
        and business_id = new.business_id
    ) then
    raise exception 'El cliente no pertenece al negocio';
  end if;

  if to_jsonb(new) ? 'supplier_id'
    and nullif(to_jsonb(new)->>'supplier_id', '') is not null
    and not exists (
      select 1 from public.admin_suppliers
      where id = (to_jsonb(new)->>'supplier_id')::uuid
        and business_id = new.business_id
    ) then
    raise exception 'El proveedor no pertenece al negocio';
  end if;

  if to_jsonb(new) ? 'employee_id'
    and nullif(to_jsonb(new)->>'employee_id', '') is not null
    and not exists (
      select 1 from public.admin_employees
      where id = (to_jsonb(new)->>'employee_id')::uuid
        and business_id = new.business_id
    ) then
    raise exception 'El empleado no pertenece al negocio';
  end if;

  if to_jsonb(new) ? 'cash_session_id'
    and nullif(to_jsonb(new)->>'cash_session_id', '') is not null
    and not exists (
      select 1 from public.admin_cash_sessions
      where id = (to_jsonb(new)->>'cash_session_id')::uuid
        and business_id = new.business_id
    ) then
    raise exception 'La caja no pertenece al negocio';
  end if;

  if to_jsonb(new) ? 'sale_id'
    and nullif(to_jsonb(new)->>'sale_id', '') is not null
    and not exists (
      select 1 from public.admin_sales
      where id = (to_jsonb(new)->>'sale_id')::uuid
        and business_id = new.business_id
    ) then
    raise exception 'La venta no pertenece al negocio';
  end if;

  if to_jsonb(new) ? 'document_id'
    and nullif(to_jsonb(new)->>'document_id', '') is not null
    and not exists (
      select 1 from public.admin_documents
      where id = (to_jsonb(new)->>'document_id')::uuid
        and business_id = new.business_id
    ) then
    raise exception 'El documento no pertenece al negocio';
  end if;

  if to_jsonb(new) ? 'purchase_id'
    and nullif(to_jsonb(new)->>'purchase_id', '') is not null
    and not exists (
      select 1 from public.admin_purchases
      where id = (to_jsonb(new)->>'purchase_id')::uuid
        and business_id = new.business_id
    ) then
    raise exception 'La compra no pertenece al negocio';
  end if;

  if to_jsonb(new) ? 'transfer_id'
    and nullif(to_jsonb(new)->>'transfer_id', '') is not null
    and not exists (
      select 1 from public.admin_stock_transfers
      where id = (to_jsonb(new)->>'transfer_id')::uuid
        and business_id = new.business_id
    ) then
    raise exception 'La transferencia no pertenece al negocio';
  end if;

  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'administration_subscriptions', 'admin_branch_stock',
    'admin_inventory_movements', 'admin_employees', 'admin_cash_sessions',
    'admin_sales', 'admin_sale_items', 'admin_cash_movements',
    'admin_account_movements', 'admin_documents', 'admin_document_items',
    'admin_purchases', 'admin_purchase_items', 'admin_stock_transfers',
    'admin_stock_transfer_items', 'admin_recurring_expenses'
  ]
  loop
    execute format(
      'drop trigger if exists validate_business_relations on public.%I',
      table_name
    );
    execute format(
      'create trigger validate_business_relations before insert or update on public.%I for each row execute function public.validate_administration_row_business()',
      table_name
    );
  end loop;
end $$;

create or replace function public.register_administration_account_payment(
  p_business_id uuid,
  p_branch_id uuid,
  p_party_type text,
  p_party_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_description text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cash_session_id uuid;
  v_movement_id uuid;
  v_balance numeric(14,2);
begin
  if not public.can_manage_administration(p_business_id) then
    raise exception 'No tenés permiso para administrar este negocio';
  end if;
  if coalesce(p_amount, 0) <= 0 then
    raise exception 'El importe debe ser mayor que cero';
  end if;
  if p_party_type not in ('customer', 'supplier') then
    raise exception 'Tipo de cuenta inválido';
  end if;
  if not exists (
    select 1 from public.admin_branches
    where id = p_branch_id and business_id = p_business_id and active
  ) then
    raise exception 'La sucursal no es válida';
  end if;

  select id into v_cash_session_id
  from public.admin_cash_sessions
  where business_id = p_business_id
    and branch_id = p_branch_id
    and status = 'open'
  limit 1;
  if v_cash_session_id is null then
    raise exception 'Primero tenés que abrir la caja';
  end if;

  if p_party_type = 'customer' and not exists (
    select 1 from public.admin_customers
    where id = p_party_id and business_id = p_business_id and active
  ) then
    raise exception 'El cliente no es válido';
  end if;
  if p_party_type = 'supplier' and not exists (
    select 1 from public.admin_suppliers
    where id = p_party_id and business_id = p_business_id and active
  ) then
    raise exception 'El proveedor no es válido';
  end if;

  select coalesce(sum(
    case when movement_type = 'debit' then amount else -amount end
  ), 0)
  into v_balance
  from public.admin_account_movements
  where business_id = p_business_id
    and (
      (p_party_type = 'customer' and customer_id = p_party_id)
      or (p_party_type = 'supplier' and supplier_id = p_party_id)
    );

  if v_balance <= 0 then
    raise exception 'Esta cuenta no tiene deuda pendiente';
  end if;
  if p_amount > v_balance then
    raise exception 'El pago supera la deuda pendiente de %', v_balance;
  end if;

  insert into public.admin_account_movements (
    business_id, customer_id, supplier_id, movement_type,
    amount, description
  ) values (
    p_business_id,
    case when p_party_type = 'customer' then p_party_id else null end,
    case when p_party_type = 'supplier' then p_party_id else null end,
    'credit', p_amount,
    coalesce(nullif(trim(p_description), ''),
      case when p_party_type = 'customer'
        then 'Pago recibido' else 'Pago al proveedor' end)
  )
  returning id into v_movement_id;

  insert into public.admin_cash_movements (
    business_id, branch_id, cash_session_id, movement_type,
    category, description, amount, payment_method
  ) values (
    p_business_id, p_branch_id, v_cash_session_id,
    case when p_party_type = 'customer' then 'income' else 'expense' end,
    case when p_party_type = 'customer'
      then 'Cobro de deuda' else 'Pago a proveedor' end,
    coalesce(nullif(trim(p_description), ''),
      case when p_party_type = 'customer'
        then 'Pago recibido' else 'Pago al proveedor' end),
    p_amount, p_payment_method
  );

  insert into public.admin_audit_log (
    business_id, action, entity_type, entity_id, details
  ) values (
    p_business_id, 'create', 'account_payment', v_movement_id::text,
    jsonb_build_object(
      'party_type', p_party_type, 'party_id', p_party_id,
      'amount', p_amount, 'previous_balance', v_balance
    )
  );

  return v_movement_id;
end;
$$;

revoke all on function public.register_administration_account_payment(
  uuid, uuid, text, uuid, numeric, text, text
) from public;
grant execute on function public.register_administration_account_payment(
  uuid, uuid, text, uuid, numeric, text, text
) to authenticated;
