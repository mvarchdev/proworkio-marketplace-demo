# Runbook: Webhook failures

Use this when Stripe, Resend, Infobip, or Fakturownia events stop advancing domain state.

## Symptoms

- payments remain in `pending` or `requires_action`
- notification attempts accumulate as failed or exhausted
- invoices are missing external references
- webhook events are received but not processed

## Steps

1. Inspect the webhook ledger in `ops.webhook_events`.
2. Check the matching outbox rows in `ops.outbox_events`.
3. Verify the provider signature and the target environment secret.
4. Re-run or replay the event only after confirming the handler is idempotent.
5. Confirm downstream state changes in `billing.*`, `ops.notification_*`, or `public.request_company_matches`.

## Recovery rules

- Never mark a payment succeeded without webhook confirmation.
- Never create duplicate entitlements for the same request-company pair.
- Preserve the raw provider event record for auditability.

