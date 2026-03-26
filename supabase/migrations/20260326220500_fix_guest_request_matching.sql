create or replace function public.run_request_matching(target_request_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_owner_id uuid;
  request_exists boolean := false;
  current_actor_id uuid := auth.uid();
  match_count integer := 0;
begin
  select true, r.customer_profile_id
  into request_exists, request_owner_id
  from public.requests r
  where r.id = target_request_id;

  if not request_exists then
    raise exception 'request_not_found_or_forbidden';
  end if;

  if request_owner_id is not null
     and request_owner_id <> current_actor_id
     and not public.is_admin() then
    raise exception 'request_not_found_or_forbidden';
  end if;

  if request_owner_id is null
     and current_actor_id is not null
     and not public.is_admin() then
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

revoke all on function public.run_request_matching(uuid) from public;
grant execute on function public.run_request_matching(uuid) to authenticated, service_role;
