# Changelog

## 0.1.0 - 2026-03-26

- Established the production monorepo baseline with `pnpm`, `turbo`, `mise`, `Taskfile.yml`, shared packages, and CI.
- Implemented the public marketplace, customer/provider flows, billing adapters, notification orchestration, and the Refine-based admin console.
- Added Supabase schema, RLS, seed data, generated OpenAPI artifacts, and generated database types.
- Fixed guest request matching so confirmation and local seed flows work for requests without a linked customer account.
- Added initial domain tests for matching, similarity heuristics, notification fallback helpers, and claim flow helpers.
- Added Playwright end-to-end coverage for the demo request and company onboarding journeys.
- Added a shared Next.js startup wrapper so Render-style runtime arguments work for both `apps/web` and `apps/admin`.
- Validated `pnpm typecheck`, `pnpm lint`, `pnpm test`, and production builds for `apps/web` and `apps/admin`.
