-- Archivos públicos, pero escrituras limitadas al propietario.

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        policyname like 'tc_%'
        or coalesce(qual, '') ilike any (array[
          '%business-images%',
          '%business-videos%',
          '%studio-library%',
          '%studio-brand-assets%'
        ])
        or coalesce(with_check, '') ilike any (array[
          '%business-images%',
          '%business-videos%',
          '%studio-library%',
          '%studio-brand-assets%'
        ])
      )
  loop
    execute format(
      'drop policy if exists %I on storage.objects',
      policy_record.policyname
    );
  end loop;
end $$;

create policy "tc_public_assets_read"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id in (
      'business-images',
      'business-videos',
      'studio-library',
      'studio-brand-assets'
    )
  );

create policy "tc_business_assets_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('business-images', 'business-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "tc_business_assets_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('business-images', 'business-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id in ('business-images', 'business-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "tc_business_assets_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('business-images', 'business-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "tc_studio_library_owner"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'studio-library'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'studio-library'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "tc_brand_assets_owner"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'studio-brand-assets'
    and exists (
      select 1
      from public.businesses b
      where b.id::text = (storage.foldername(name))[1]
        and (b.user_id = auth.uid() or public.is_tc_admin())
    )
  )
  with check (
    bucket_id = 'studio-brand-assets'
    and exists (
      select 1
      from public.businesses b
      where b.id::text = (storage.foldername(name))[1]
        and (b.user_id = auth.uid() or public.is_tc_admin())
    )
  );
