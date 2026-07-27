-- Operaciones atómicas de TusComercios Administración V2.

create or replace function public.complete_administration_sale(
  p_business_id uuid,
  p_branch_id uuid,
  p_payment_method text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cash_session_id uuid;
  v_sale_id uuid;
  v_item jsonb;
  v_product public.admin_products%rowtype;
  v_quantity numeric(14,3);
  v_stock numeric(14,3);
  v_total numeric(14,2) := 0;
begin
  if not public.can_manage_administration(p_business_id) then
    raise exception 'No tenés permiso para administrar este negocio';
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

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La venta no contiene productos';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := coalesce((v_item->>'quantity')::numeric, 0);
    if v_quantity <= 0 then
      raise exception 'La cantidad debe ser mayor que cero';
    end if;

    select * into v_product
    from public.admin_products
    where id = (v_item->>'product_id')::uuid
      and business_id = p_business_id
      and active
    for update;

    if not found then
      raise exception 'Uno de los productos ya no está disponible';
    end if;

    select quantity into v_stock
    from public.admin_branch_stock
    where branch_id = p_branch_id and product_id = v_product.id
    for update;

    if coalesce(v_stock, 0) < v_quantity then
      raise exception 'Stock insuficiente para %', v_product.name;
    end if;

    v_total := v_total + (v_product.sale_price * v_quantity);
  end loop;

  insert into public.admin_sales (
    business_id, branch_id, cash_session_id, payment_method,
    subtotal, total, paid_amount, balance_due
  ) values (
    p_business_id, p_branch_id, v_cash_session_id, p_payment_method,
    v_total, v_total, v_total, 0
  )
  returning id into v_sale_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::numeric;
    select * into v_product
    from public.admin_products
    where id = (v_item->>'product_id')::uuid;

    insert into public.admin_sale_items (
      sale_id, business_id, product_id, description, barcode,
      quantity, unit_cost, unit_price, subtotal
    ) values (
      v_sale_id, p_business_id, v_product.id, v_product.name, v_product.barcode,
      v_quantity, v_product.cost, v_product.sale_price,
      v_product.sale_price * v_quantity
    );

    update public.admin_branch_stock
    set quantity = quantity - v_quantity, updated_at = now()
    where branch_id = p_branch_id and product_id = v_product.id;

    insert into public.admin_inventory_movements (
      business_id, branch_id, product_id, movement_type,
      quantity, unit_cost, reference_type, reference_id, notes
    ) values (
      p_business_id, p_branch_id, v_product.id, 'sale',
      -v_quantity, v_product.cost, 'sale', v_sale_id, 'Venta'
    );
  end loop;

  insert into public.admin_cash_movements (
    business_id, branch_id, cash_session_id, movement_type,
    category, description, amount, payment_method, sale_id
  ) values (
    p_business_id, p_branch_id, v_cash_session_id, 'income',
    'Venta', 'Venta de productos', v_total, p_payment_method, v_sale_id
  );

  insert into public.admin_audit_log (
    business_id, action, entity_type, entity_id, details
  ) values (
    p_business_id, 'create', 'sale', v_sale_id::text,
    jsonb_build_object('total', v_total, 'branch_id', p_branch_id)
  );

  return v_sale_id;
end;
$$;

revoke all on function public.complete_administration_sale(uuid, uuid, text, jsonb)
  from public;
grant execute on function public.complete_administration_sale(uuid, uuid, text, jsonb)
  to authenticated;
