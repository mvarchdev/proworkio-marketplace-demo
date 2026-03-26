# Environment

Environment variables are validated in `packages/config/src/env`.

## Shared public variables

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_POSTHOG_TOKEN`
- `NEXT_PUBLIC_SENTRY_DSN`

## Web-only variables

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Admin-only variables

- `NEXT_PUBLIC_ADMIN_APP_URL`

Admin reads live operational data only when `SUPABASE_SERVICE_ROLE_KEY` is also available on the server. Without it, the admin UI stays bootable but falls back to static sample content.

## Server-only variables

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `INFOBIP_BASE_URL`
- `INFOBIP_API_KEY`
- `FAKTUROWNIA_BASE_URL`
- `FAKTUROWNIA_API_TOKEN`
- `SENTRY_AUTH_TOKEN`

## Local development notes

- Use `.env.local` for app-specific values.
- Keep secrets out of git.
- Make sure preview and production URLs are reflected in Supabase redirect allow-lists.
- When adding a new variable, update the relevant schema in `packages/config/src/env`.
