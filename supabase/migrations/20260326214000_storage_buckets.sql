do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values
      (
        'request-photos',
        'request-photos',
        false,
        10485760,
        array['image/jpeg', 'image/png', 'image/webp']
      ),
      (
        'company-assets',
        'company-assets',
        true,
        10485760,
        array['image/jpeg', 'image/png', 'image/webp']
      ),
      (
        'blog-assets',
        'blog-assets',
        true,
        10485760,
        array['image/jpeg', 'image/png', 'image/webp']
      )
    on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;
  end if;

  if to_regclass('storage.objects') is not null then
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'storage'
        and tablename = 'objects'
        and policyname = 'company_assets_public_read'
    ) then
      execute $policy$
        create policy "company_assets_public_read"
        on storage.objects
        for select
        to public
        using (bucket_id = 'company-assets')
      $policy$;
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'storage'
        and tablename = 'objects'
        and policyname = 'blog_assets_public_read'
    ) then
      execute $policy$
        create policy "blog_assets_public_read"
        on storage.objects
        for select
        to public
        using (bucket_id = 'blog-assets')
      $policy$;
    end if;
  end if;
end
$$;

