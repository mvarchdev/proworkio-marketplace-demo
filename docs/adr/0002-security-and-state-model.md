# ADR-0002: Sensitive data isolation and explicit state machines

## Status
Accepted

## Context

The marketplace handles contact data, billing data, webhook events, and moderation actions. Public hiding in the frontend is not enough because these values can leak through direct queries or future refactors.

## Decision

- Keep private contact details in separate `private` schema tables.
- Use explicit status machines for requests, companies, payments, subscriptions, notifications, and reviews.
- Record payment, webhook, notification, and audit activity in append-friendly operational tables.
- Prefer deterministic matching and idempotent webhook processing.

## Consequences

- Public queries become safer by schema design.
- Business logic is easier to audit and reason about.
- Replay and recovery workflows are simpler because side effects are logged.
- Schema changes must preserve the state model instead of bypassing it with ad hoc flags.

