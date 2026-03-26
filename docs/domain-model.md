# Domain Model

This repository models the Proworkio marketplace around explicit states and auditable relationships.

## Core entities

- `profiles` - authenticated people in the system
- `categories` - top-level and nested service categories
- `category_field_sets` and `category_field_definitions` - versioned dynamic field schemas
- `requests` - customer service requests
- `request_contacts` - private request contact data
- `request_photos` - request attachments
- `companies` - provider organizations
- `company_members` - access control for company staff
- `company_categories` - company-category coverage
- `company_field_values` - company dynamic profile data
- `request_company_matches` - deterministic match records
- `lead_unlock_entitlements` - paid contact access
- `payments` - Stripe-backed payment records
- `subscriptions` - VIP company plans
- `invoices` - Fakturownia sync records
- `notification_messages` and `notification_delivery_attempts` - notification orchestration ledger
- `blog_posts` - CMS content
- `reviews` - moderated reviews
- `audit_logs`, `webhook_events`, `outbox_events` - operations ledger

## Status machines

### Requests

- `draft`
- `awaiting_confirmation`
- `active`
- `expired`
- `closed`
- `archived`

### Companies

- `draft`
- `pending_verification`
- `pending_review`
- `active`
- `suspended`
- `rejected`
- `archived`

### Payments

- `created`
- `pending`
- `requires_action`
- `succeeded`
- `failed`
- `refunded`
- `canceled`

### Subscriptions

- `trialing`
- `active`
- `past_due`
- `unpaid`
- `canceled`
- `incomplete`
- `incomplete_expired`

### Notifications

- `queued`
- `processing`
- `sent`
- `delivered`
- `failed`
- `exhausted`

## Matching rules

- Matching is deterministic and explainable.
- Category and up to two subcategory levels are used first.
- Geospatial radius is checked with PostGIS meters-based distance logic.
- The result is stored as a row in `request_company_matches`.
- Public contact details stay hidden until an entitlement exists.

## Dynamic fields

- Field schemas are versioned.
- Submitted values are stored separately from the schema definitions.
- UI rendering should come from the schema, not hardcoded forms.

## Sensitive data handling

- Request and company contact details are isolated from generic public reads.
- Payment and billing data are separated from marketing/profile data.
- Webhook payloads and notification attempts are retained for auditability.

## Business rules worth preserving

- A guest can submit a request without a full account.
- A request must be confirmed before it becomes public.
- Companies should be moderated before becoming active.
- Stripe webhooks, not redirects, decide final payment state.
- Notification channels fall back in a controlled order and every attempt is recorded.

