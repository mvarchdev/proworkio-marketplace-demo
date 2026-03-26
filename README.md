# Proworkio

Proworkio is a Slovak two-sided marketplace for service requests, verified companies, and internal operations.

## What is in this repo

- `apps/web` - public site plus customer and provider flows
- `apps/admin` - operational console for moderation, billing, content, and support work
- `packages/*` - shared config, types, UI primitives, domain helpers, and OpenAPI definitions
- `supabase/` - Postgres schema, RLS, seeds, and edge-function entry points
- `docs/` - architecture, domain, deployment, env, testing, ADRs, and runbooks

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-inspired shared primitives
- Refine for admin CRUD workflows
- Supabase for Auth, Postgres, Storage, Edge Functions, and RLS
- Stripe for checkout, subscriptions, and customer portal
- Resend for email
- Infobip for SMS and WhatsApp
- Fakturownia for invoice/accounting sync
- PostHog for analytics
- Sentry for error monitoring

## Quick start

1. Install toolchain and dependencies.

```bash
task bootstrap
```

2. Start the local apps.

```bash
task dev
```

3. Start local Supabase when you need database-backed flows.

```bash
task db:start
```

## Authoritative commands

- `task bootstrap`
- `task dev`
- `task build`
- `task lint`
- `task typecheck`
- `task test`
- `task db:start`
- `task db:reset`
- `task db:types`

## Documentation

- [Architecture](docs/architecture.md)
- [Domain model](docs/domain-model.md)
- [Deployment](docs/deployment.md)
- [Environment](docs/env.md)
- [Testing](docs/testing.md)
- [ADR log](docs/adr/)
- [Runbooks](docs/runbooks/)

## Current implementation notes

- The product language defaults to `sk-SK`.
- Sensitive contact data is isolated from public-facing tables and surfaced through controlled RPCs.
- Marketplace matching, lead unlocks, subscriptions, notifications, and webhook events are modeled in Postgres first.
- The repo is designed for Vercel + Supabase Cloud deployment with GitHub Actions CI.

