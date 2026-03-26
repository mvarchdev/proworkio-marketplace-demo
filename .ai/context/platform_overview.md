# Proworkio Platform Overview

Proworkio is a Slovak two-sided marketplace that connects customers submitting service requests with verified companies. The platform contains:

- `apps/web`: marketing site and customer/provider product
- `apps/admin`: operational backoffice for moderation, billing, and CMS
- `supabase/`: database schema, policies, seeds, and edge functions
- `packages/*`: shared UI, config, types, domain services, and OpenAPI definitions

Primary platform dependencies:

- Next.js App Router on Vercel
- Supabase Cloud for Postgres/Auth/Storage/Edge Functions
- Stripe for one-off lead unlocks and VIP subscriptions
- Resend for email
- Infobip for SMS and WhatsApp
- Fakturownia for invoice/accounting sync
- PostHog for product analytics
- Sentry for error monitoring

Documentation and operational baseline:

- Root README: `README.md`
- Architecture: `docs/architecture.md`
- Domain model: `docs/domain-model.md`
- Deployment: `docs/deployment.md`
- Environment: `docs/env.md`
- Testing: `docs/testing.md`
- ADRs: `docs/adr/`
- Runbooks: `docs/runbooks/`
- CI: `.github/workflows/ci.yml`

Authoritative runtime commands:

- `task bootstrap`
- `task dev`
- `task build`
- `task lint`
- `task typecheck`
- `task test`
- `task db:start`
- `task db:reset`
- `task db:types`
- `psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' -v ON_ERROR_STOP=1 -f supabase/seed.sql`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm --filter @proworkio/web build`
- `pnpm --filter @proworkio/admin build`
