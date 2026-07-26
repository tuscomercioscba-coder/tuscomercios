-- Métricas de visitantes únicos para TusComercios
-- Ejecutar una sola vez en Supabase > SQL Editor.

alter table public.page_events
  add column if not exists visitor_id text,
  add column if not exists anonymous_id text,
  add column if not exists device_id text,
  add column if not exists session_id text,
  add column if not exists user_id uuid,
  add column if not exists user_role text,
  add column if not exists role text,
  add column if not exists is_admin boolean default false,
  add column if not exists business_city text;

create index if not exists page_events_event_type_created_at_idx
  on public.page_events (event_type, created_at desc);

create index if not exists page_events_visitor_id_created_at_idx
  on public.page_events (visitor_id, created_at desc);

-- Permite registrar eventos anónimos desde la web.
-- Si ya existe una política equivalente, no la duplica.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'page_events'
      and policyname = 'Permitir registrar métricas públicas'
  ) then
    create policy "Permitir registrar métricas públicas"
      on public.page_events
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;

alter table public.page_events enable row level security;
