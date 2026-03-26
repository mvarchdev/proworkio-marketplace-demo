# Deployment

The intended deployment path is:

- `apps/web` on Vercel
- `apps/admin` on Vercel
- Supabase Cloud for each environment
- GitHub Actions for CI checks

## Demo hosting

- The monorepo can also be hosted as a demo on Render using the package `start` scripts from `apps/web` and `apps/admin`.
- Those scripts use the shared startup wrapper in `scripts/next-start.mjs` so Render-style forwarded arguments such as `--hostname` and `--port` are handled correctly.
- This path is appropriate for seeded demo environments and operator previews, not as the preferred production target.

## Environments

- Local - developer machine plus local Supabase CLI
- Preview - Vercel preview deploys and a matching Supabase preview project
- Staging - release candidate environment with production-like secrets
- Production - customer-facing Vercel projects and production Supabase

## Release flow

1. Merge to the main branch.
2. GitHub Actions runs install, lint, typecheck, tests, and app builds.
3. Vercel deploys preview or production based on the branch.
4. Supabase migrations are applied before app code depends on new schema.
5. Webhook and notification integrations are verified in the target environment.

## Rollback rules

- App rollback is the Vercel previous deployment.
- Schema rollback must be backward-compatible or handled by a follow-up migration.
- If a migration is risky, ship add/backfill/switch/remove in separate steps.
- Payment or webhook regressions should disable the affected integration before attempting data repair.

## Supabase

- Treat SQL migrations as the source of truth.
- Regenerate local types after schema changes with `task db:types`.
- Rebuild public-safe views and RLS policies with schema changes, not after them.

## Operational checks before release

- Database migrations applied cleanly.
- Stripe webhooks validate in the target environment.
- Email/SMS fallbacks are configured.
- Public pages render in Slovak.
- Sentry and PostHog env variables are set.
