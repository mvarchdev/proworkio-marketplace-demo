# Testing

The repo uses a layered test strategy with workspace-level verification and focused domain tests for the first production slice.

## Current commands

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm --filter @proworkio/web test:e2e`

## Current repository state

- `apps/web/src/lib/marketplace.spec.ts` covers deterministic matching explanations, similarity heuristics, request-claim resolution, and notification fallback planning helpers.
- `apps/web/tests/e2e/demo-marketplace.spec.ts` covers the demo-mode request submission/confirmation/claim journey and the company onboarding journey in a reproducible no-secrets environment.
- `apps/admin` still uses `vitest --passWithNoTests` until CRUD/resource-specific tests land.
- CI runs lint, typecheck, tests, and production builds for both Next.js apps.

## What should be tested

- Matching logic and deterministic scoring
- Notification fallback ordering and failure handling
- Request submission and claim flows
- Stripe webhook idempotency
- RLS-sensitive read/write boundaries
- Admin moderation and publishing flows

## Test placement

- Unit tests live next to the package or app code they exercise.
- Integration tests should cover Supabase RPCs, webhook handlers, and provider adapters.
- E2E tests should focus on the top customer and company journeys.

## CI expectations

- Lint and typecheck must stay green.
- Builds for `apps/web` and `apps/admin` must complete.
- Tests should run on every pull request.

## Practical guidance

- Prefer deterministic fixtures.
- Avoid sleep-based timing in tests.
- Assert observable behavior, not implementation details.
- Add at least one negative case for every new business rule.
