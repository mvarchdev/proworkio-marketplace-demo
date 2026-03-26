# Runbook: Local reset

Use this when the local database or generated types drift from the repo.

## Symptoms

- `task db:start` fails because Supabase containers are missing or stale
- schema changes are not reflected in local TypeScript types
- local tests or builds reference outdated database contracts

## Steps

1. Stop the local Supabase stack if it is running.

```bash
task db:stop
```

2. Reset the local database to reapply migrations and seed data.

```bash
task db:reset
```

3. Regenerate the local database types.

```bash
task db:types
```

4. Re-run the repository checks.

```bash
task lint
task typecheck
task test
```

## Notes

- If the reset fails because Docker is unavailable, fix the local Docker runtime first.
- If `task db:reset` stalls after recreating the database, recover manually:

```bash
task db:start
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' -v ON_ERROR_STOP=1 -f supabase/migrations/20260326211000_init_extensions_and_enums.sql
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' -v ON_ERROR_STOP=1 -f supabase/migrations/20260326212000_core_tables.sql
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' -v ON_ERROR_STOP=1 -f supabase/migrations/20260326213000_functions_views_and_policies.sql
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' -v ON_ERROR_STOP=1 -f supabase/migrations/20260326214000_storage_buckets.sql
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' -v ON_ERROR_STOP=1 -f supabase/migrations/20260326220500_fix_guest_request_matching.sql
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' -v ON_ERROR_STOP=1 -f supabase/seed.sql
task db:types
```

- The guest request confirmation flow depends on `public.run_request_matching(...)` accepting confirmed guest requests; if seed confirmation fails, verify that the latest matching migration has been applied.
- Do not hand-edit generated type files.
