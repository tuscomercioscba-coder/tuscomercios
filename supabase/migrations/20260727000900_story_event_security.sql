-- Endurece las métricas y denuncias públicas de historias.
-- Evita relaciones falsas y repeticiones ilimitadas por visitante.

delete from public.story_clicks current_row
using public.story_clicks duplicate
where current_row.story_id = duplicate.story_id
  and current_row.visitor_id = duplicate.visitor_id
  and current_row.destination = duplicate.destination
  and current_row.id > duplicate.id;

delete from public.story_reports current_row
using public.story_reports duplicate
where current_row.story_id = duplicate.story_id
  and current_row.visitor_id = duplicate.visitor_id
  and current_row.visitor_id is not null
  and current_row.id > duplicate.id;

create unique index if not exists story_clicks_visitor_destination_uidx
  on public.story_clicks (story_id, visitor_id, destination);

create unique index if not exists story_reports_visitor_uidx
  on public.story_reports (story_id, visitor_id)
  where visitor_id is not null;

create or replace function public.validate_public_story_event()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_business_id uuid;
begin
  select business_id into v_business_id
  from public.business_stories
  where id = new.story_id
    and scheduled_at <= now()
    and coalesce(expires_at, scheduled_at + interval '24 hours') > now()
    and status in ('scheduled', 'published');

  if v_business_id is null then
    raise exception 'La historia no está disponible';
  end if;

  if tg_table_name = 'story_clicks' and new.business_id <> v_business_id then
    raise exception 'El comercio no coincide con la historia';
  end if;

  if tg_table_name = 'story_reports' then
    new.reason := left(trim(new.reason), 100);
    new.details := nullif(left(trim(coalesce(new.details, '')), 500), '');
  end if;

  return new;
end;
$$;

drop trigger if exists validate_public_story_event on public.story_views;
create trigger validate_public_story_event
  before insert on public.story_views
  for each row execute function public.validate_public_story_event();

drop trigger if exists validate_public_story_event on public.story_clicks;
create trigger validate_public_story_event
  before insert on public.story_clicks
  for each row execute function public.validate_public_story_event();

drop trigger if exists validate_public_story_event on public.story_reports;
create trigger validate_public_story_event
  before insert on public.story_reports
  for each row execute function public.validate_public_story_event();

drop policy if exists "story_clicks_public_insert" on public.story_clicks;
create policy "story_clicks_public_insert"
  on public.story_clicks for insert
  to anon, authenticated
  with check (
    length(visitor_id) between 8 and 100
    and length(destination) between 2 and 40
  );

drop policy if exists "story_reports_public_insert" on public.story_reports;
create policy "story_reports_public_insert"
  on public.story_reports for insert
  to anon, authenticated
  with check (
    length(visitor_id) between 8 and 100
    and length(reason) between 3 and 100
    and length(coalesce(details, '')) <= 500
    and (reporter_id is null or reporter_id = auth.uid())
  );
