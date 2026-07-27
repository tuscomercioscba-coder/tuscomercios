-- Edición, ajuste de stock y eliminación lógica de productos.

drop index if exists public.admin_products_barcode_unique;
create unique index admin_products_barcode_unique
  on public.admin_products (business_id, barcode)
  where active and barcode is not null and barcode <> '';

create or replace function public.update_administration_product(
  p_product_id uuid,
  p_branch_id uuid,
  p_name text,
  p_barcode text,
  p_internal_code text,
  p_description text,
  p_unit text,
  p_cost numeric,
  p_sale_price numeric,
  p_profit_percent numeric,
  p_minimum_stock numeric,
  p_stock_quantity numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.admin_products%rowtype;
  v_current_stock numeric(14,3);
  v_difference numeric(14,3);
begin
  select * into v_product
  from public.admin_products
  where id = p_product_id and active
  for update;

  if not found or not public.can_manage_administration(v_product.business_id) then
    raise exception 'No tenés permiso para editar este producto';
  end if;
  if trim(coalesce(p_name, '')) = '' then
    raise exception 'El nombre del producto es obligatorio';
  end if;
  if p_cost < 0 or p_sale_price < 0 or p_minimum_stock < 0 or p_stock_quantity < 0 then
    raise exception 'Los importes y el stock no pueden ser negativos';
  end if;
  if not exists (
    select 1 from public.admin_branches
    where id = p_branch_id and business_id = v_product.business_id and active
  ) then
    raise exception 'La sucursal no es válida';
  end if;
  if nullif(trim(coalesce(p_barcode, '')), '') is not null and exists (
    select 1 from public.admin_products
    where business_id = v_product.business_id
      and barcode = trim(p_barcode)
      and id <> p_product_id
      and active
  ) then
    raise exception 'Ese código de barras ya pertenece a otro producto';
  end if;

  update public.admin_products
  set
    name = trim(p_name),
    barcode = nullif(trim(coalesce(p_barcode, '')), ''),
    internal_code = nullif(trim(coalesce(p_internal_code, '')), ''),
    description = nullif(trim(coalesce(p_description, '')), ''),
    unit = coalesce(nullif(trim(p_unit), ''), 'unidad'),
    cost = p_cost,
    sale_price = p_sale_price,
    profit_percent = p_profit_percent,
    minimum_stock = p_minimum_stock,
    updated_at = now()
  where id = p_product_id;

  select quantity into v_current_stock
  from public.admin_branch_stock
  where branch_id = p_branch_id and product_id = p_product_id
  for update;

  if not found then
    insert into public.admin_branch_stock (
      business_id, branch_id, product_id, quantity
    ) values (
      v_product.business_id, p_branch_id, p_product_id, p_stock_quantity
    );
    v_difference := p_stock_quantity;
  else
    v_difference := p_stock_quantity - v_current_stock;
    update public.admin_branch_stock
    set quantity = p_stock_quantity, updated_at = now()
    where branch_id = p_branch_id and product_id = p_product_id;
  end if;

  if v_difference <> 0 then
    insert into public.admin_inventory_movements (
      business_id, branch_id, product_id, movement_type,
      quantity, unit_cost, notes
    ) values (
      v_product.business_id, p_branch_id, p_product_id, 'adjustment',
      v_difference, p_cost, 'Ajuste manual al editar producto'
    );
  end if;

  insert into public.admin_audit_log (
    business_id, action, entity_type, entity_id, details
  ) values (
    v_product.business_id, 'update', 'product', p_product_id::text,
    jsonb_build_object('branch_id', p_branch_id, 'stock', p_stock_quantity)
  );
end;
$$;

revoke all on function public.update_administration_product(
  uuid, uuid, text, text, text, text, text,
  numeric, numeric, numeric, numeric, numeric
) from public;
grant execute on function public.update_administration_product(
  uuid, uuid, text, text, text, text, text,
  numeric, numeric, numeric, numeric, numeric
) to authenticated;

create or replace function public.archive_administration_product(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
begin
  select business_id into v_business_id
  from public.admin_products
  where id = p_product_id and active;

  if v_business_id is null or not public.can_manage_administration(v_business_id) then
    raise exception 'No tenés permiso para eliminar este producto';
  end if;

  update public.admin_products
  set active = false, updated_at = now()
  where id = p_product_id;

  insert into public.admin_audit_log (
    business_id, action, entity_type, entity_id, details
  ) values (
    v_business_id, 'archive', 'product', p_product_id::text,
    jsonb_build_object('reason', 'Eliminado desde Administración')
  );
end;
$$;

revoke all on function public.archive_administration_product(uuid) from public;
grant execute on function public.archive_administration_product(uuid) to authenticated;
