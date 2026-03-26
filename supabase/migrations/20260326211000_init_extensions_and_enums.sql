create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists postgis with schema extensions;

create schema if not exists private;
create schema if not exists billing;
create schema if not exists ops;

comment on schema private is 'Sensitive contact and token data never exposed directly to the public API.';
comment on schema billing is 'Billing, subscription, invoice, and entitlement records.';
comment on schema ops is 'Operational logs, webhook ledger, notifications, and audit data.';

do $$
begin
  create type public.user_role as enum ('customer', 'company_member', 'admin');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.request_status as enum ('draft', 'awaiting_confirmation', 'active', 'expired', 'closed', 'archived');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.request_confirmation_status as enum ('pending', 'confirmed', 'expired');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.company_status as enum (
    'draft',
    'pending_verification',
    'pending_review',
    'active',
    'suspended',
    'rejected',
    'archived'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.moderation_status as enum ('unreviewed', 'approved', 'rejected', 'needs_changes');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.notification_channel as enum ('email', 'whatsapp', 'sms');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.notification_status as enum ('queued', 'processing', 'sent', 'delivered', 'failed', 'exhausted');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.notification_attempt_status as enum (
    'queued',
    'sent',
    'delivered',
    'undeliverable',
    'provider_failed',
    'rate_limited',
    'skipped'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.notification_provider as enum ('resend', 'infobip');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_status as enum (
    'created',
    'pending',
    'requires_action',
    'succeeded',
    'failed',
    'refunded',
    'canceled'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_purpose as enum ('lead_unlock', 'vip_subscription');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.subscription_status as enum (
    'trialing',
    'active',
    'past_due',
    'unpaid',
    'canceled',
    'incomplete',
    'incomplete_expired'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.review_status as enum ('pending', 'approved', 'rejected', 'hidden');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.match_status as enum ('pending_notification', 'available', 'viewed', 'dismissed', 'expired', 'unlocked', 'won');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.unlock_status as enum ('pending_payment', 'active', 'refunded', 'revoked', 'expired');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.invoice_status as enum ('draft', 'issued', 'paid', 'overdue', 'void', 'failed_sync');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.blog_post_status as enum ('draft', 'scheduled', 'published', 'archived');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.dynamic_field_scope as enum ('request', 'company');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.dynamic_field_type as enum (
    'text',
    'textarea',
    'number',
    'select',
    'multi_select',
    'boolean',
    'date',
    'file'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.urgency_level as enum ('normal', 'fast', 'urgent');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.token_purpose as enum ('confirm_request', 'claim_request');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.webhook_provider as enum ('stripe', 'resend', 'infobip', 'fakturownia');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.outbox_status as enum ('pending', 'processing', 'processed', 'failed', 'dead_letter');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.billing_owner_type as enum ('profile', 'company');
exception
  when duplicate_object then null;
end
$$;

grant usage on schema public to anon, authenticated;
grant usage on schema billing, ops to authenticated;

