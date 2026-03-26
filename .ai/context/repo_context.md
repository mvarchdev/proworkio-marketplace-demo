# Repository Context

This repository is a greenfield production monorepo for Proworkio.

Current architecture intent:

- Monorepo managed with `pnpm` workspaces and `turborepo`
- Runtime/tooling pinning via `mise`
- Shared task entry points via `Taskfile.yml`
- Supabase SQL migrations as the source of truth
- Strong TypeScript boundaries with shared domain packages
- Default locale and product copy: `sk-SK`
- Docs-first baseline with architecture, domain, deployment, env, testing, ADR, and runbook coverage
- GitHub Actions CI covering install, lint, typecheck, tests, and app builds
- Local Supabase is the source for generated database types in `packages/types/src/database.generated.ts`
- Guest request confirmation triggers deterministic company matching via SQL and must work for requests without an attached customer profile

Implementation priorities:

1. Establish shared tooling and workspace structure
2. Implement the Supabase schema, RLS, and seed data
3. Build end-to-end marketplace flows in `apps/web`
4. Build the Refine-based admin console in `apps/admin`
5. Add observability, tests, CI, deployment documentation, and operational runbooks

Validated operational findings:

- `pnpm db:types` now generates a real schema file from the local Supabase stack after migrations and seed data are applied.
- Demo seed data produces deterministic request-to-company matches for the two canonical requests.
- Next.js auth routes that use `useSearchParams()` must render `AuthCard` under `Suspense` to keep production builds green on Next.js 16.
- Render-style runtime commands that append `--hostname` and `--port` are supported through `scripts/next-start.mjs`, so demo-hosted `apps/web` and `apps/admin` instances can reuse the package `start` scripts safely.
- Hosted Supabase RPC functions that run with `set search_path = ''` must fully qualify extension functions like `extensions.gen_random_bytes()` and use `#variable_conflict use_column` when `RETURNS TABLE` column names overlap with inserted column names.
- `apps/admin` now reads live hosted Supabase data server-side when `SUPABASE_SERVICE_ROLE_KEY` is present, while preserving a static fallback mode for local runs without secrets.
