-- Permite guardar carruseles en la Biblioteca de Studio.

do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.studio_library'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%content_type%'
  limit 1;

  if constraint_name is not null then
    execute format(
      'alter table public.studio_library drop constraint %I',
      constraint_name
    );
  end if;
end $$;

alter table public.studio_library
  add constraint studio_library_content_type_check
  check (content_type in ('image', 'reel', 'carousel'));

comment on table public.studio_library is
  'Biblioteca de imágenes, reels y carruseles creados en TusComercios Studio.';
