# ADR-0001: Monorepo, Next.js, and Supabase-first platform

## Status
Accepted

## Context

Proworkio needs a production-grade marketplace with a public site, admin console, payments, notifications, invoices, and a strong data/security boundary. The team also needs fast local iteration and a path to staged deployment.

## Decision

Use a pnpm + Turborepo monorepo with:

- `apps/web` and `apps/admin` as separate Next.js applications
- shared packages for config, types, UI primitives, domain logic, and OpenAPI
- Supabase Cloud and SQL migrations as the source of truth for data and authorization
- Vercel for app deployment

## Consequences

- Shared business logic stays reusable across apps.
- SQL, RLS, and RPCs become the canonical backend boundary.
- Build and test commands are standardized across the repo.
- The architecture stays small enough to understand without introducing a separate backend service.

