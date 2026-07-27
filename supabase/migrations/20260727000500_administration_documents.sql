-- Creación transaccional de presupuestos, remitos y comprobantes internos.

create or replace function public.create_administration_document(
  p_business_id uuid,
  p_branch_id uuid,
  p_customer_id uuid,
  p_document_type text,
  p_valid_until date,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_document_id uuid;
  v_item jsonb;
  v_product public.admin_products%rowtype;
  v_description text;
  v_quantity numeric(14,3);
  v_unit_price numeric(14,2);
  v_subtotal numeric(14,2);
  v_total numeric(14,2) := 0;
begin
  if not public.can_manage_administration(p_business_id) then
    raise exception 'No tenés permiso para administrar este negocio';
  end if;
  if p_document_type not in ('quote', 'delivery_note', 'internal_receipt') then
    raise exception 'El tipo de documento no es válido';
  end if;
  if not exists (
    select 1 from public.admin_branches
    where id = p_branch_id and business_id = p_business_id and active
  ) then
    raise exception 'La sucursal no es válida';
  end if;
  if p_customer_id is not null and not exists (
    select 1 from public.admin_customers
    where id = p_customer_id and business_id = p_business_id and active
  ) then
    raise exception 'El cliente no es válido';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Agregá al menos un concepto';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := coalesce((v_item->>'quantity')::numeric, 0);
    v_unit_price := coalesce((v_item->>'unit_price')::numeric, 0);
    v_description := trim(coalesce(v_item->>'description', ''));
    if v_quantity <= 0 then
      raise exception 'La cantidad debe ser mayor que cero';
    end if;
    if v_unit_price < 0 then
      raise exception 'El precio no puede ser negativo';
    end if;
    if v_description = '' then
      raise exception 'Todos los conceptos necesitan una descripción';
    end if;
    if nullif(v_item->>'product_id', '') is not null then
      select * into v_product
      from public.admin_products
      where id = (v_item->>'product_id')::uuid
        and business_id = p_business_id and active;
      if not found then
        raise exception 'Uno de los productos no es válido';
      end if;
    end if;
    v_total := v_total + (v_quantity * v_unit_price);
  end loop;

  insert into public.admin_documents (
    business_id, branch_id, customer_id, document_type,
    status, valid_until, subtotal, total, notes
  ) values (
    p_business_id, p_branch_id, p_customer_id, p_document_type,
    'issued', p_valid_until, v_total, v_total, nullif(trim(p_notes), '')
  )
  returning id into v_document_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::numeric;
    v_unit_price := (v_item->>'unit_price')::numeric;
    v_subtotal := v_quantity * v_unit_price;
    insert into public.admin_document_items (
      document_id, business_id, product_id, description,
      quantity, unit_price, subtotal
    ) values (
      v_document_id, p_business_id,
      nullif(v_item->>'product_id', '')::uuid,
      trim(v_item->>'description'), v_quantity, v_unit_price, v_subtotal
    );
  end loop;

  insert into public.admin_audit_log (
    business_id, action, entity_type, entity_id, details
  ) values (
    p_business_id, 'create', p_document_type, v_document_id::text,
    jsonb_build_object('total', v_total, 'branch_id', p_branch_id)
  );

  return v_document_id;
end;
$$;

revoke all on function public.create_administration_document(
  uuid, uuid, uuid, text, date, text, jsonb
) from public;
grant execute on function public.create_administration_document(
  uuid, uuid, uuid, text, date, text, jsonb
) to authenticated;
