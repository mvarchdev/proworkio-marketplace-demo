create or replace function public.sha256_hex(input text)
returns text
language sql
immutable
strict
as $$
  select encode(extensions.digest(input, 'sha256'), 'hex');
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generate_public_code(prefix text default 'PW')
returns text
language sql
stable
as $$
  select prefix || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
$$;

create or replace function public.set_request_public_code()
returns trigger
language plpgsql
as $$
begin
  if new.public_code is null or btrim(new.public_code) = '' then
    new.public_code = public.generate_public_code('DOPYT');
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        updated_at = now();

  return new;
end;
$$;

create or replace function public.current_profile_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.role from public.profiles p where p.id = auth.uid()),
    'customer'::public.user_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = target_company_id
      and cm.profile_id = auth.uid()
      and cm.status = 'approved'
  );
$$;

create or replace function public.recompute_company_completeness(target_company_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  filled integer := 0;
  possible integer := 7;
  score integer := 0;
begin
  select
    (case when c.short_description_sk <> '' then 1 else 0 end)
    + (case when c.long_description_sk <> '' then 1 else 0 end)
    + (case when c.logo_path is not null then 1 else 0 end)
    + (case when c.base_location is not null then 1 else 0 end)
    + (case when exists (select 1 from public.company_categories cc where cc.company_id = c.id) then 1 else 0 end)
    + (case when exists (select 1 from private.company_contacts cc where cc.company_id = c.id and cc.public_email is not null) then 1 else 0 end)
    + (case when exists (select 1 from public.company_gallery_assets cga where cga.company_id = c.id) then 1 else 0 end)
  into filled
  from public.companies c
  where c.id = target_company_id;

  score := floor((coalesce(filled, 0)::numeric / possible::numeric) * 100);

  update public.companies
  set completeness_score = score,
      updated_at = now()
  where id = target_company_id;

  return score;
end;
$$;

create or replace function public.enqueue_outbox_event(
  target_event_type text,
  target_aggregate_type text,
  target_aggregate_id uuid,
  target_dedupe_key text,
  target_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_id uuid;
begin
  insert into ops.outbox_events (
    event_type,
    aggregate_type,
    aggregate_id,
    dedupe_key,
    payload
  )
  values (
    target_event_type,
    target_aggregate_type,
    target_aggregate_id,
    target_dedupe_key,
    coalesce(target_payload, '{}'::jsonb)
  )
  on conflict (dedupe_key) do update
    set payload = excluded.payload,
        updated_at = now()
  returning id into event_id;

  return event_id;
end;
$$;

create or replace function public.request_outbox_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.enqueue_outbox_event(
      'request.created',
      'request',
      new.id,
      'request-created:' || new.id::text,
      jsonb_build_object('request_id', new.id, 'status', new.status, 'confirmation_status', new.confirmation_status)
    );
    return new;
  end if;

  if new.status = 'active' and old.status is distinct from new.status then
    perform public.enqueue_outbox_event(
      'request.activated',
      'request',
      new.id,
      'request-activated:' || new.id::text,
      jsonb_build_object('request_id', new.id, 'status', new.status, 'confirmed_at', new.confirmed_at)
    );
  end if;

  return new;
end;
$$;

create or replace function public.match_outbox_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.enqueue_outbox_event(
    'match.created',
    'request_company_match',
    new.id,
    'match-created:' || new.id::text,
    jsonb_build_object('match_id', new.id, 'request_id', new.request_id, 'company_id', new.company_id, 'score', new.score)
  );
  return new;
end;
$$;

create or replace function public.payment_outbox_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'succeeded' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    perform public.enqueue_outbox_event(
      'payment.succeeded',
      'payment',
      new.id,
      'payment-succeeded:' || new.id::text,
      jsonb_build_object('payment_id', new.id, 'purpose', new.purpose, 'company_id', new.company_id, 'request_id', new.request_id)
    );
  end if;
  return new;
end;
$$;

create or replace function public.subscription_outbox_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.enqueue_outbox_event(
    'subscription.changed',
    'subscription',
    new.id,
    'subscription-changed:' || new.id::text || ':' || new.status::text,
    jsonb_build_object('subscription_id', new.id, 'company_id', new.company_id, 'status', new.status)
  );
  return new;
end;
$$;

create or replace function public.run_request_matching(target_request_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_owner_id uuid;
  match_count integer := 0;
begin
  select r.customer_profile_id into request_owner_id
  from public.requests r
  where r.id = target_request_id;

  if request_owner_id is null and not public.is_admin() then
    raise exception 'request_not_found_or_forbidden';
  end if;

  if request_owner_id is not null and request_owner_id <> auth.uid() and not public.is_admin() then
    raise exception 'request_not_found_or_forbidden';
  end if;

  with request_scope as (
    select
      r.id,
      r.location,
      array_remove(array[r.subcategory_level2_id, r.subcategory_id, r.category_id], null) as category_ids
    from public.requests r
    where r.id = target_request_id
      and r.status = 'active'
  ),
  eligible as (
    select
      c.id as company_id,
      rs.id as request_id,
      coalesce(
        ceil(extensions.st_distance(c.base_location, rs.location)),
        null
      )::integer as distance_meters,
      cc.category_id as matched_category_id,
      row_number() over (
        partition by c.id
        order by
          case when cc.category_id = rs.category_ids[1] then 0 else 1 end,
          coalesce(extensions.st_distance(c.base_location, rs.location), 999999999)
      ) as row_rank
    from request_scope rs
    join public.companies c
      on c.status = 'active'
     and c.moderation_status = 'approved'
     and c.base_location is not null
     and rs.location is not null
     and extensions.st_dwithin(c.base_location, rs.location, c.radius_meters)
    join public.company_categories cc
      on cc.company_id = c.id
     and cc.category_id = any (rs.category_ids)
  ),
  upserted as (
    insert into public.request_company_matches (
      request_id,
      company_id,
      status,
      score,
      distance_meters,
      matched_category_id,
      explanation
    )
    select
      e.request_id,
      e.company_id,
      'available',
      greatest(
        10,
        least(
          100,
          75
          + case when e.row_rank = 1 then 10 else 0 end
          + case
              when e.distance_meters is null then 0
              when e.distance_meters <= 5000 then 15
              when e.distance_meters <= 15000 then 10
              else 5
            end
        )
      )::integer,
      e.distance_meters,
      e.matched_category_id,
      jsonb_build_object(
        'eligible', true,
        'matched_category_id', e.matched_category_id,
        'distance_meters', e.distance_meters,
        'reasons', jsonb_build_array(
          'Kategória firmy sa zhoduje s dopytom.',
          'Firma je v definovanom servisnom rádiuse.'
        )
      )
    from eligible e
    where e.row_rank = 1
    on conflict (request_id, company_id) do update
      set status = excluded.status,
          score = excluded.score,
          distance_meters = excluded.distance_meters,
          matched_category_id = excluded.matched_category_id,
          explanation = excluded.explanation,
          updated_at = now()
    returning 1
  )
  select count(*) into match_count from upserted;

  return match_count;
end;
$$;

create or replace function public.explain_request_match(target_match_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select m.explanation
  from public.request_company_matches m
  where m.id = target_match_id;
$$;

create or replace function public.confirm_request(raw_token text)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  token_record private.request_access_tokens;
  updated_request public.requests;
begin
  select *
  into token_record
  from private.request_access_tokens rat
  where rat.purpose = 'confirm_request'
    and rat.token_hash = public.sha256_hex(raw_token)
    and rat.used_at is null
    and rat.expires_at > now()
  limit 1;

  if token_record.id is null then
    raise exception 'invalid_or_expired_confirmation_token';
  end if;

  update public.requests
  set status = 'active',
      confirmation_status = 'confirmed',
      confirmed_at = now(),
      published_at = now(),
      expires_at = coalesce(expires_at, now() + interval '30 days'),
      updated_at = now()
  where id = token_record.request_id
  returning * into updated_request;

  update private.request_access_tokens
  set used_at = now()
  where id = token_record.id;

  perform public.run_request_matching(updated_request.id);

  return updated_request;
end;
$$;

create or replace function public.submit_guest_request(input jsonb)
returns table (
  request_id uuid,
  public_code text,
  confirmation_token text,
  claim_token text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_request public.requests;
  field_entry jsonb;
  photo_entry jsonb;
  raw_confirmation_token text := encode(gen_random_bytes(24), 'hex');
  raw_claim_token text := encode(gen_random_bytes(24), 'hex');
  lat double precision := nullif(input ->> 'latitude', '')::double precision;
  lng double precision := nullif(input ->> 'longitude', '')::double precision;
begin
  if coalesce(input ->> 'category_id', '') = ''
     or coalesce(input ->> 'title', '') = ''
     or coalesce(input ->> 'description', '') = ''
     or coalesce(input ->> 'postal_code', '') = ''
     or coalesce(input ->> 'location_label', '') = ''
     or coalesce(input ->> 'contact_name', '') = ''
     or coalesce(input ->> 'contact_email', '') = ''
     or coalesce(input ->> 'contact_phone', '') = '' then
    raise exception 'missing_required_request_fields';
  end if;

  insert into public.requests (
    category_id,
    subcategory_id,
    subcategory_level2_id,
    title,
    description,
    urgency,
    deadline_at,
    postal_code,
    location_label,
    location,
    status,
    confirmation_status,
    duplicate_fingerprint,
    budget_min_cents,
    budget_max_cents,
    metadata
  )
  values (
    (input ->> 'category_id')::uuid,
    nullif(input ->> 'subcategory_id', '')::uuid,
    nullif(input ->> 'subcategory_level2_id', '')::uuid,
    input ->> 'title',
    input ->> 'description',
    coalesce((input ->> 'urgency')::public.urgency_level, 'normal'::public.urgency_level),
    nullif(input ->> 'deadline_at', '')::timestamptz,
    input ->> 'postal_code',
    input ->> 'location_label',
    case
      when lat is not null and lng is not null
      then extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography
      else null
    end,
    'awaiting_confirmation',
    'pending',
    nullif(input ->> 'duplicate_fingerprint', ''),
    nullif(input ->> 'budget_min_cents', '')::integer,
    nullif(input ->> 'budget_max_cents', '')::integer,
    coalesce(input -> 'metadata', '{}'::jsonb)
  )
  returning * into created_request;

  insert into private.request_contacts (
    request_id,
    full_name,
    email,
    phone,
    preferred_channel
  )
  values (
    created_request.id,
    input ->> 'contact_name',
    (input ->> 'contact_email')::extensions.citext,
    input ->> 'contact_phone',
    coalesce((input ->> 'preferred_channel')::public.notification_channel, 'email'::public.notification_channel)
  );

  for field_entry in
    select value
    from jsonb_array_elements(coalesce(input -> 'field_values', '[]'::jsonb))
  loop
    insert into public.request_field_values (request_id, field_definition_id, value)
    values (
      created_request.id,
      (field_entry ->> 'field_definition_id')::uuid,
      coalesce(field_entry -> 'value', 'null'::jsonb)
    )
    on conflict (request_id, field_definition_id) do update
      set value = excluded.value,
          updated_at = now();
  end loop;

  for photo_entry in
    select value
    from jsonb_array_elements(coalesce(input -> 'photos', '[]'::jsonb))
  loop
    insert into public.request_photos (request_id, storage_bucket, storage_path, alt_text_sk, sort_order)
    values (
      created_request.id,
      coalesce(photo_entry ->> 'bucket', 'request-photos'),
      photo_entry ->> 'path',
      photo_entry ->> 'alt_text_sk',
      coalesce((photo_entry ->> 'sort_order')::integer, 0)
    )
    on conflict (request_id, storage_path) do nothing;
  end loop;

  insert into private.request_access_tokens (request_id, purpose, token_hash, expires_at, metadata)
  values
    (
      created_request.id,
      'confirm_request',
      public.sha256_hex(raw_confirmation_token),
      now() + interval '48 hours',
      jsonb_build_object('email', input ->> 'contact_email')
    ),
    (
      created_request.id,
      'claim_request',
      public.sha256_hex(raw_claim_token),
      now() + interval '30 days',
      jsonb_build_object('email', input ->> 'contact_email')
    );

  return query
  select created_request.id, created_request.public_code, raw_confirmation_token, raw_claim_token;
end;
$$;

create or replace function public.claim_guest_request(raw_token text)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  token_record private.request_access_tokens;
  updated_request public.requests;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  select *
  into token_record
  from private.request_access_tokens rat
  where rat.purpose = 'claim_request'
    and rat.token_hash = public.sha256_hex(raw_token)
    and rat.used_at is null
    and rat.expires_at > now()
  limit 1;

  if token_record.id is null then
    raise exception 'invalid_or_expired_claim_token';
  end if;

  update public.requests
  set customer_profile_id = auth.uid(),
      updated_at = now()
  where id = token_record.request_id
    and customer_profile_id is null
  returning * into updated_request;

  if updated_request.id is null then
    select *
    into updated_request
    from public.requests r
    where r.id = token_record.request_id
      and r.customer_profile_id = auth.uid();

    if updated_request.id is null then
      raise exception 'request_already_claimed';
    end if;
  end if;

  update private.request_access_tokens
  set used_at = now()
  where id = token_record.id;

  return updated_request;
end;
$$;

create or replace function public.upsert_company_profile(input jsonb)
returns public.companies
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_company_id uuid := nullif(input ->> 'company_id', '')::uuid;
  category_entry jsonb;
  field_entry jsonb;
  gallery_entry jsonb;
  company_record public.companies;
  lat double precision := nullif(input ->> 'latitude', '')::double precision;
  lng double precision := nullif(input ->> 'longitude', '')::double precision;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  if coalesce(input ->> 'slug', '') = ''
     or coalesce(input ->> 'legal_name', '') = ''
     or coalesce(input ->> 'display_name', '') = ''
     or coalesce(input ->> 'short_description_sk', '') = ''
     or coalesce(input ->> 'long_description_sk', '') = ''
     or coalesce(input ->> 'city', '') = ''
     or coalesce(input ->> 'postal_code', '') = ''
     or coalesce(input ->> 'address_line_1', '') = '' then
    raise exception 'missing_required_company_fields';
  end if;

  if target_company_id is null then
    insert into public.companies (
      created_by_profile_id,
      slug,
      legal_name,
      display_name,
      company_id_number,
      vat_id,
      status,
      moderation_status,
      short_description_sk,
      long_description_sk,
      city,
      postal_code,
      address_line_1,
      address_line_2,
      country_code,
      base_location,
      radius_meters,
      logo_bucket,
      logo_path,
      hero_image_path,
      metadata
    )
    values (
      auth.uid(),
      input ->> 'slug',
      input ->> 'legal_name',
      input ->> 'display_name',
      nullif(input ->> 'company_id_number', ''),
      nullif(input ->> 'vat_id', ''),
      'pending_review',
      'unreviewed',
      input ->> 'short_description_sk',
      input ->> 'long_description_sk',
      input ->> 'city',
      input ->> 'postal_code',
      input ->> 'address_line_1',
      nullif(input ->> 'address_line_2', ''),
      coalesce(nullif(input ->> 'country_code', ''), 'SK'),
      case
        when lat is not null and lng is not null
        then extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography
        else null
      end,
      coalesce(nullif(input ->> 'radius_meters', '')::integer, 25000),
      coalesce(nullif(input ->> 'logo_bucket', ''), 'company-assets'),
      nullif(input ->> 'logo_path', ''),
      nullif(input ->> 'hero_image_path', ''),
      coalesce(input -> 'metadata', '{}'::jsonb)
    )
    returning * into company_record;

    insert into public.company_members (company_id, profile_id, role, status)
    values (company_record.id, auth.uid(), 'owner', 'approved')
    on conflict (company_id, profile_id) do nothing;
  else
    if not public.is_company_member(target_company_id) and not public.is_admin() then
      raise exception 'insufficient_privilege';
    end if;

    update public.companies
    set slug = input ->> 'slug',
        legal_name = input ->> 'legal_name',
        display_name = input ->> 'display_name',
        company_id_number = nullif(input ->> 'company_id_number', ''),
        vat_id = nullif(input ->> 'vat_id', ''),
        short_description_sk = input ->> 'short_description_sk',
        long_description_sk = input ->> 'long_description_sk',
        city = input ->> 'city',
        postal_code = input ->> 'postal_code',
        address_line_1 = input ->> 'address_line_1',
        address_line_2 = nullif(input ->> 'address_line_2', ''),
        country_code = coalesce(nullif(input ->> 'country_code', ''), 'SK'),
        base_location = case
          when lat is not null and lng is not null
          then extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography
          else base_location
        end,
        radius_meters = coalesce(nullif(input ->> 'radius_meters', '')::integer, radius_meters),
        logo_bucket = coalesce(nullif(input ->> 'logo_bucket', ''), logo_bucket),
        logo_path = coalesce(nullif(input ->> 'logo_path', ''), logo_path),
        hero_image_path = coalesce(nullif(input ->> 'hero_image_path', ''), hero_image_path),
        updated_at = now(),
        metadata = coalesce(input -> 'metadata', metadata)
    where id = target_company_id
    returning * into company_record;
  end if;

  insert into private.company_contacts (
    company_id,
    contact_name,
    public_email,
    support_email,
    billing_email,
    phone,
    whatsapp_phone,
    website_url
  )
  values (
    company_record.id,
    coalesce(input ->> 'contact_name', input ->> 'display_name'),
    nullif(input ->> 'public_email', '')::extensions.citext,
    nullif(input ->> 'support_email', '')::extensions.citext,
    nullif(input ->> 'billing_email', '')::extensions.citext,
    nullif(input ->> 'phone', ''),
    nullif(input ->> 'whatsapp_phone', ''),
    nullif(input ->> 'website_url', '')
  )
  on conflict (company_id) do update
    set contact_name = excluded.contact_name,
        public_email = excluded.public_email,
        support_email = excluded.support_email,
        billing_email = excluded.billing_email,
        phone = excluded.phone,
        whatsapp_phone = excluded.whatsapp_phone,
        website_url = excluded.website_url,
        updated_at = now();

  delete from public.company_categories
  where company_id = company_record.id
    and not exists (
      select 1
      from jsonb_array_elements_text(coalesce(input -> 'category_ids', '[]'::jsonb)) category_ids(category_id)
      where public.company_categories.category_id = category_ids.category_id::uuid
    );

  for category_entry in
    select value
    from jsonb_array_elements(coalesce(input -> 'category_ids', '[]'::jsonb))
  loop
    insert into public.company_categories (company_id, category_id)
    values (company_record.id, (category_entry #>> '{}')::uuid)
    on conflict (company_id, category_id) do nothing;
  end loop;

  for field_entry in
    select value
    from jsonb_array_elements(coalesce(input -> 'field_values', '[]'::jsonb))
  loop
    insert into public.company_field_values (company_id, field_definition_id, value)
    values (
      company_record.id,
      (field_entry ->> 'field_definition_id')::uuid,
      coalesce(field_entry -> 'value', 'null'::jsonb)
    )
    on conflict (company_id, field_definition_id) do update
      set value = excluded.value,
          updated_at = now();
  end loop;

  for gallery_entry in
    select value
    from jsonb_array_elements(coalesce(input -> 'gallery', '[]'::jsonb))
  loop
    insert into public.company_gallery_assets (company_id, storage_bucket, storage_path, alt_text_sk, sort_order)
    values (
      company_record.id,
      coalesce(gallery_entry ->> 'bucket', 'company-assets'),
      gallery_entry ->> 'path',
      gallery_entry ->> 'alt_text_sk',
      coalesce((gallery_entry ->> 'sort_order')::integer, 0)
    )
    on conflict (company_id, storage_path) do update
      set alt_text_sk = excluded.alt_text_sk,
          sort_order = excluded.sort_order;
  end loop;

  perform public.recompute_company_completeness(company_record.id);

  select *
  into company_record
  from public.companies c
  where c.id = company_record.id;

  return company_record;
end;
$$;

create or replace function public.get_request_contact(target_request_id uuid)
returns table (
  full_name text,
  email extensions.citext,
  phone text,
  preferred_channel public.notification_channel
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  if not (
    public.is_admin()
    or exists (
      select 1
      from public.requests r
      where r.id = target_request_id
        and r.customer_profile_id = auth.uid()
    )
    or exists (
      select 1
      from billing.lead_unlock_entitlements lue
      join public.company_members cm on cm.company_id = lue.company_id
      where lue.request_id = target_request_id
        and lue.status = 'active'
        and cm.profile_id = auth.uid()
        and cm.status = 'approved'
    )
  ) then
    raise exception 'insufficient_privilege';
  end if;

  return query
  select rc.full_name, rc.email, rc.phone, rc.preferred_channel
  from private.request_contacts rc
  where rc.request_id = target_request_id;
end;
$$;

create or replace view public.request_public_listings_v1
with (security_invoker = true)
as
select
  r.id,
  r.public_code,
  r.category_id,
  r.subcategory_id,
  r.subcategory_level2_id,
  r.title,
  r.description,
  r.urgency,
  r.location_label,
  r.status,
  r.confirmation_status,
  r.budget_min_cents,
  r.budget_max_cents,
  r.published_at,
  r.expires_at,
  r.created_at
from public.requests r
where r.status = 'active'
  and r.confirmation_status = 'confirmed';

create or replace view public.company_public_profiles_v1
with (security_invoker = true)
as
select
  c.id,
  c.slug,
  c.legal_name,
  c.display_name,
  c.short_description_sk,
  c.long_description_sk,
  c.city,
  c.postal_code,
  c.radius_meters,
  c.logo_bucket,
  c.logo_path,
  c.hero_image_path,
  c.completeness_score,
  exists (
    select 1
    from billing.subscriptions s
    where s.company_id = c.id
      and s.status in ('trialing', 'active', 'past_due')
  ) as is_vip,
  coalesce(avg(r.rating_percent) filter (where r.status = 'approved'), 0)::integer as rating_percent,
  count(r.*) filter (where r.status = 'approved')::integer as reviews_count
from public.companies c
left join public.reviews r on r.company_id = c.id
where c.status = 'active'
  and c.moderation_status = 'approved'
group by c.id;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger category_field_sets_set_updated_at
before update on public.category_field_sets
for each row execute function public.set_updated_at();

create trigger category_field_definitions_set_updated_at
before update on public.category_field_definitions
for each row execute function public.set_updated_at();

create trigger requests_set_updated_at
before update on public.requests
for each row execute function public.set_updated_at();

create trigger requests_set_public_code
before insert on public.requests
for each row execute function public.set_request_public_code();

create trigger request_field_values_set_updated_at
before update on public.request_field_values
for each row execute function public.set_updated_at();

create trigger request_contacts_set_updated_at
before update on private.request_contacts
for each row execute function public.set_updated_at();

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create trigger company_contacts_set_updated_at
before update on private.company_contacts
for each row execute function public.set_updated_at();

create trigger company_field_values_set_updated_at
before update on public.company_field_values
for each row execute function public.set_updated_at();

create trigger request_company_matches_set_updated_at
before update on public.request_company_matches
for each row execute function public.set_updated_at();

create trigger billing_accounts_set_updated_at
before update on billing.accounts
for each row execute function public.set_updated_at();

create trigger billing_payments_set_updated_at
before update on billing.payments
for each row execute function public.set_updated_at();

create trigger lead_unlock_entitlements_set_updated_at
before update on billing.lead_unlock_entitlements
for each row execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
before update on billing.subscriptions
for each row execute function public.set_updated_at();

create trigger invoices_set_updated_at
before update on billing.invoices
for each row execute function public.set_updated_at();

create trigger notification_messages_set_updated_at
before update on ops.notification_messages
for each row execute function public.set_updated_at();

create trigger outbox_events_set_updated_at
before update on ops.outbox_events
for each row execute function public.set_updated_at();

create trigger request_outbox_events
after insert or update on public.requests
for each row execute function public.request_outbox_trigger();

create trigger match_outbox_events
after insert on public.request_company_matches
for each row execute function public.match_outbox_trigger();

create trigger payment_outbox_events
after insert or update on billing.payments
for each row execute function public.payment_outbox_trigger();

create trigger subscription_outbox_events
after insert or update on billing.subscriptions
for each row execute function public.subscription_outbox_trigger();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.category_field_sets enable row level security;
alter table public.category_field_definitions enable row level security;
alter table public.requests enable row level security;
alter table public.request_field_values enable row level security;
alter table public.request_photos enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.company_categories enable row level security;
alter table public.company_field_values enable row level security;
alter table public.company_gallery_assets enable row level security;
alter table public.request_company_matches enable row level security;
alter table public.blog_posts enable row level security;
alter table public.reviews enable row level security;
alter table billing.accounts enable row level security;
alter table billing.payments enable row level security;
alter table billing.lead_unlock_entitlements enable row level security;
alter table billing.subscriptions enable row level security;
alter table billing.invoices enable row level security;
alter table ops.notification_messages enable row level security;
alter table ops.notification_delivery_attempts enable row level security;
alter table ops.audit_logs enable row level security;
alter table ops.webhook_events enable row level security;
alter table ops.outbox_events enable row level security;

grant select on public.categories, public.category_field_sets, public.category_field_definitions to anon;
grant select on public.requests, public.request_field_values, public.request_photos, public.companies, public.company_categories, public.company_gallery_assets, public.blog_posts, public.reviews to anon;
grant select, insert, update, delete on public.profiles, public.categories, public.category_field_sets, public.category_field_definitions, public.requests, public.request_field_values, public.request_photos, public.companies, public.company_members, public.company_categories, public.company_field_values, public.company_gallery_assets, public.request_company_matches, public.blog_posts, public.reviews to authenticated;
grant select, insert, update, delete on billing.accounts, billing.payments, billing.lead_unlock_entitlements, billing.subscriptions, billing.invoices to authenticated;
grant select, insert, update, delete on ops.notification_messages, ops.notification_delivery_attempts, ops.audit_logs, ops.webhook_events, ops.outbox_events to authenticated;
grant select on public.request_public_listings_v1, public.company_public_profiles_v1 to anon, authenticated;

create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "categories_public_read"
on public.categories
for select
to anon, authenticated
using (is_active or public.is_admin());

create policy "categories_admin_write"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "category_field_sets_public_read"
on public.category_field_sets
for select
to anon, authenticated
using (is_active or public.is_admin());

create policy "category_field_sets_admin_write"
on public.category_field_sets
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "category_field_definitions_public_read"
on public.category_field_definitions
for select
to anon, authenticated
using (true);

create policy "category_field_definitions_admin_write"
on public.category_field_definitions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "requests_public_read"
on public.requests
for select
to anon
using (public.requests.status = 'active' and public.requests.confirmation_status = 'confirmed');

create policy "requests_authenticated_read"
on public.requests
for select
to authenticated
using (
  public.is_admin()
  or public.requests.customer_profile_id = auth.uid()
  or (public.requests.status = 'active' and public.requests.confirmation_status = 'confirmed')
  or exists (
    select 1
    from public.request_company_matches m
    join public.company_members cm on cm.company_id = m.company_id
    where m.request_id = public.requests.id
      and cm.profile_id = auth.uid()
      and cm.status = 'approved'
  )
);

create policy "requests_insert_authenticated_owner"
on public.requests
for insert
to authenticated
with check (public.requests.customer_profile_id = auth.uid() or public.is_admin());

create policy "requests_update_owner_or_admin"
on public.requests
for update
to authenticated
using (public.requests.customer_profile_id = auth.uid() or public.is_admin())
with check (public.requests.customer_profile_id = auth.uid() or public.is_admin());

create policy "request_field_values_read"
on public.request_field_values
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.requests r
    where r.id = public.request_field_values.request_id
      and r.customer_profile_id = auth.uid()
  )
  or exists (
    select 1
    from public.request_company_matches m
    join public.company_members cm on cm.company_id = m.company_id
    where m.request_id = public.request_field_values.request_id
      and cm.profile_id = auth.uid()
      and cm.status = 'approved'
  )
);

create policy "request_field_values_write_owner_or_admin"
on public.request_field_values
for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.requests r
    where r.id = public.request_field_values.request_id
      and r.customer_profile_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.requests r
    where r.id = public.request_field_values.request_id
      and r.customer_profile_id = auth.uid()
  )
);

create policy "request_photos_public_read"
on public.request_photos
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.requests r
    where r.id = public.request_photos.request_id
      and r.status = 'active'
      and r.confirmation_status = 'confirmed'
  )
  or public.is_admin()
  or exists (
    select 1
    from public.requests r
    where r.id = public.request_photos.request_id
      and r.customer_profile_id = auth.uid()
  )
);

create policy "request_photos_write_owner_or_admin"
on public.request_photos
for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.requests r
    where r.id = public.request_photos.request_id
      and r.customer_profile_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.requests r
    where r.id = public.request_photos.request_id
      and r.customer_profile_id = auth.uid()
  )
);

create policy "companies_public_read"
on public.companies
for select
to anon
using (public.companies.status = 'active' and public.companies.moderation_status = 'approved');

create policy "companies_authenticated_read"
on public.companies
for select
to authenticated
using (
  public.is_admin()
  or public.is_company_member(public.companies.id)
  or (public.companies.status = 'active' and public.companies.moderation_status = 'approved')
);

create policy "companies_write_member_or_admin"
on public.companies
for all
to authenticated
using (public.is_admin() or public.is_company_member(public.companies.id))
with check (public.is_admin() or public.is_company_member(public.companies.id));

create policy "company_members_read_member_or_admin"
on public.company_members
for select
to authenticated
using (
  public.is_admin()
  or public.company_members.profile_id = auth.uid()
  or public.is_company_member(public.company_members.company_id)
);

create policy "company_members_admin_write"
on public.company_members
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "company_categories_public_read"
on public.company_categories
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.companies c
    where c.id = public.company_categories.company_id
      and (
        public.is_admin()
        or public.is_company_member(public.company_categories.company_id)
        or (c.status = 'active' and c.moderation_status = 'approved')
      )
  )
);

create policy "company_categories_write_member_or_admin"
on public.company_categories
for all
to authenticated
using (public.is_admin() or public.is_company_member(public.company_categories.company_id))
with check (public.is_admin() or public.is_company_member(public.company_categories.company_id));

create policy "company_field_values_read_member_or_admin"
on public.company_field_values
for select
to authenticated
using (public.is_admin() or public.is_company_member(public.company_field_values.company_id));

create policy "company_field_values_write_member_or_admin"
on public.company_field_values
for all
to authenticated
using (public.is_admin() or public.is_company_member(public.company_field_values.company_id))
with check (public.is_admin() or public.is_company_member(public.company_field_values.company_id));

create policy "company_gallery_assets_public_read"
on public.company_gallery_assets
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.companies c
    where c.id = public.company_gallery_assets.company_id
      and (
        public.is_admin()
        or public.is_company_member(public.company_gallery_assets.company_id)
        or (c.status = 'active' and c.moderation_status = 'approved')
      )
  )
);

create policy "company_gallery_assets_write_member_or_admin"
on public.company_gallery_assets
for all
to authenticated
using (public.is_admin() or public.is_company_member(public.company_gallery_assets.company_id))
with check (public.is_admin() or public.is_company_member(public.company_gallery_assets.company_id));

create policy "request_company_matches_read_member_owner_or_admin"
on public.request_company_matches
for select
to authenticated
using (
  public.is_admin()
  or public.is_company_member(public.request_company_matches.company_id)
  or exists (
    select 1
    from public.requests r
    where r.id = public.request_company_matches.request_id
      and r.customer_profile_id = auth.uid()
  )
);

create policy "request_company_matches_write_admin_only"
on public.request_company_matches
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "blog_posts_public_read"
on public.blog_posts
for select
to anon, authenticated
using (public.blog_posts.status = 'published' or public.is_admin());

create policy "blog_posts_admin_write"
on public.blog_posts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "reviews_public_read"
on public.reviews
for select
to anon, authenticated
using (
  public.reviews.status = 'approved'
  or public.is_admin()
  or public.is_company_member(public.reviews.company_id)
);

create policy "reviews_insert_authenticated"
on public.reviews
for insert
to authenticated
with check (public.reviews.customer_profile_id = auth.uid() or public.is_admin());

create policy "reviews_update_admin_only"
on public.reviews
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "billing_accounts_read_owner_or_admin"
on billing.accounts
for select
to authenticated
using (
  public.is_admin()
  or billing.accounts.profile_id = auth.uid()
  or (
    billing.accounts.company_id is not null
    and public.is_company_member(billing.accounts.company_id)
  )
);

create policy "billing_accounts_write_owner_or_admin"
on billing.accounts
for all
to authenticated
using (
  public.is_admin()
  or billing.accounts.profile_id = auth.uid()
  or (
    billing.accounts.company_id is not null
    and public.is_company_member(billing.accounts.company_id)
  )
)
with check (
  public.is_admin()
  or billing.accounts.profile_id = auth.uid()
  or (
    billing.accounts.company_id is not null
    and public.is_company_member(billing.accounts.company_id)
  )
);

create policy "billing_payments_read_owner_or_admin"
on billing.payments
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from billing.accounts a
    where a.id = billing.payments.billing_account_id
      and (
        a.profile_id = auth.uid()
        or (a.company_id is not null and public.is_company_member(a.company_id))
      )
  )
);

create policy "billing_payments_write_admin_only"
on billing.payments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "lead_unlocks_read_owner_or_admin"
on billing.lead_unlock_entitlements
for select
to authenticated
using (
  public.is_admin()
  or public.is_company_member(billing.lead_unlock_entitlements.company_id)
  or exists (
    select 1
    from public.requests r
    where r.id = billing.lead_unlock_entitlements.request_id
      and r.customer_profile_id = auth.uid()
  )
);

create policy "lead_unlocks_write_admin_only"
on billing.lead_unlock_entitlements
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "subscriptions_read_owner_or_admin"
on billing.subscriptions
for select
to authenticated
using (public.is_admin() or public.is_company_member(company_id));

create policy "subscriptions_write_admin_only"
on billing.subscriptions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "invoices_read_owner_or_admin"
on billing.invoices
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from billing.accounts a
    where a.id = billing_account_id
      and (a.profile_id = auth.uid() or (a.company_id is not null and public.is_company_member(a.company_id)))
  )
);

create policy "invoices_write_admin_only"
on billing.invoices
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "ops_admin_only_messages"
on ops.notification_messages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "ops_admin_only_attempts"
on ops.notification_delivery_attempts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "ops_admin_only_audit"
on ops.audit_logs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "ops_admin_only_webhooks"
on ops.webhook_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "ops_admin_only_outbox"
on ops.outbox_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

revoke all on function public.confirm_request(text) from public;
grant execute on function public.confirm_request(text) to anon, authenticated;

revoke all on function public.claim_guest_request(text) from public;
grant execute on function public.claim_guest_request(text) to authenticated;

revoke all on function public.submit_guest_request(jsonb) from public;
grant execute on function public.submit_guest_request(jsonb) to anon, authenticated;

revoke all on function public.upsert_company_profile(jsonb) from public;
grant execute on function public.upsert_company_profile(jsonb) to authenticated;

revoke all on function public.get_request_contact(uuid) from public;
grant execute on function public.get_request_contact(uuid) to authenticated;
