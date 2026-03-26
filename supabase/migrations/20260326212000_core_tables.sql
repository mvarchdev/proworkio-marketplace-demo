create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'customer',
  full_name text,
  phone text,
  locale text not null default 'sk-SK',
  marketing_consent boolean not null default false,
  email extensions.citext not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete restrict,
  slug text not null unique,
  name_sk text not null,
  description_sk text not null,
  icon text not null,
  sort_order integer not null default 0,
  depth integer not null default 0 check (depth between 0 and 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_parent_idx on public.categories (parent_id);
create index if not exists categories_active_sort_idx on public.categories (is_active, sort_order);

create table if not exists public.category_field_sets (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  scope public.dynamic_field_scope not null,
  version integer not null,
  status public.moderation_status not null default 'approved',
  title_sk text not null,
  description_sk text,
  is_active boolean not null default true,
  created_by_profile_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, scope, version)
);

create table if not exists public.category_field_definitions (
  id uuid primary key default gen_random_uuid(),
  field_set_id uuid not null references public.category_field_sets (id) on delete cascade,
  field_key text not null,
  label_sk text not null,
  help_text_sk text,
  field_type public.dynamic_field_type not null,
  sort_order integer not null default 0,
  is_required boolean not null default false,
  is_filterable boolean not null default false,
  placeholder_sk text,
  options jsonb not null default '[]'::jsonb,
  validation_rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (field_set_id, field_key)
);

create index if not exists category_field_definitions_field_set_sort_idx
  on public.category_field_definitions (field_set_id, sort_order);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  customer_profile_id uuid references public.profiles (id) on delete set null,
  category_id uuid not null references public.categories (id) on delete restrict,
  subcategory_id uuid references public.categories (id) on delete restrict,
  subcategory_level2_id uuid references public.categories (id) on delete restrict,
  title text not null,
  description text not null,
  urgency public.urgency_level not null default 'normal',
  deadline_at timestamptz,
  postal_code text not null,
  location_label text not null,
  location extensions.geography(point, 4326),
  status public.request_status not null default 'awaiting_confirmation',
  confirmation_status public.request_confirmation_status not null default 'pending',
  duplicate_fingerprint text,
  duplicate_of_request_id uuid references public.requests (id) on delete set null,
  budget_min_cents integer,
  budget_max_cents integer,
  terms_accepted_at timestamptz not null default now(),
  confirmed_at timestamptz,
  published_at timestamptz,
  expires_at timestamptz,
  closed_at timestamptz,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (budget_min_cents is null or budget_min_cents >= 0),
  check (budget_max_cents is null or budget_max_cents >= 0)
);

create index if not exists requests_customer_status_idx on public.requests (customer_profile_id, status);
create index if not exists requests_category_status_idx on public.requests (category_id, status);
create index if not exists requests_duplicate_fingerprint_idx on public.requests (duplicate_fingerprint);
create index if not exists requests_location_idx on public.requests using gist (location);

create table if not exists public.request_field_values (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  field_definition_id uuid not null references public.category_field_definitions (id) on delete cascade,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, field_definition_id)
);

create table if not exists public.request_photos (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  storage_bucket text not null default 'request-photos',
  storage_path text not null,
  alt_text_sk text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (request_id, storage_path)
);

create index if not exists request_photos_request_sort_idx on public.request_photos (request_id, sort_order);

create table if not exists private.request_contacts (
  request_id uuid primary key references public.requests (id) on delete cascade,
  full_name text not null,
  email extensions.citext not null,
  phone text not null,
  preferred_channel public.notification_channel not null default 'email',
  email_confirmed_at timestamptz,
  phone_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists request_contacts_email_idx on private.request_contacts (email);

create table if not exists private.request_access_tokens (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  purpose public.token_purpose not null,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (purpose, token_hash)
);

create index if not exists request_access_tokens_request_idx on private.request_access_tokens (request_id, purpose);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  created_by_profile_id uuid references public.profiles (id) on delete set null,
  slug text not null unique,
  legal_name text not null,
  display_name text not null,
  company_id_number text,
  vat_id text,
  status public.company_status not null default 'pending_verification',
  moderation_status public.moderation_status not null default 'unreviewed',
  short_description_sk text not null,
  long_description_sk text not null,
  city text not null,
  postal_code text not null,
  address_line_1 text not null,
  address_line_2 text,
  country_code text not null default 'SK',
  base_location extensions.geography(point, 4326),
  radius_meters integer not null default 25000 check (radius_meters between 1000 and 300000),
  service_area jsonb not null default '{}'::jsonb,
  logo_bucket text default 'company-assets',
  logo_path text,
  hero_image_path text,
  completeness_score integer not null default 0 check (completeness_score between 0 and 100),
  duplicate_fingerprint text,
  duplicate_of_company_id uuid references public.companies (id) on delete set null,
  approved_at timestamptz,
  approved_by_profile_id uuid references public.profiles (id) on delete set null,
  suspended_at timestamptz,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists companies_status_idx on public.companies (status, moderation_status);
create index if not exists companies_location_idx on public.companies using gist (base_location);
create index if not exists companies_duplicate_fingerprint_idx on public.companies (duplicate_fingerprint);

create table if not exists private.company_contacts (
  company_id uuid primary key references public.companies (id) on delete cascade,
  contact_name text not null,
  public_email extensions.citext,
  support_email extensions.citext,
  billing_email extensions.citext,
  phone text,
  whatsapp_phone text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'owner',
  status public.moderation_status not null default 'approved',
  created_at timestamptz not null default now(),
  unique (company_id, profile_id)
);

create index if not exists company_members_profile_idx on public.company_members (profile_id);

create table if not exists public.company_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (company_id, category_id)
);

create table if not exists public.company_field_values (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  field_definition_id uuid not null references public.category_field_definitions (id) on delete cascade,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, field_definition_id)
);

create table if not exists public.company_gallery_assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  storage_bucket text not null default 'company-assets',
  storage_path text not null,
  alt_text_sk text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (company_id, storage_path)
);

create index if not exists company_gallery_assets_company_sort_idx
  on public.company_gallery_assets (company_id, sort_order);

create table if not exists public.request_company_matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  status public.match_status not null default 'pending_notification',
  score integer not null default 0 check (score between 0 and 100),
  distance_meters integer,
  matched_category_id uuid references public.categories (id) on delete set null,
  explanation jsonb not null default '{}'::jsonb,
  notified_at timestamptz,
  viewed_at timestamptz,
  dismissed_at timestamptz,
  unlocked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, company_id)
);

create index if not exists request_company_matches_company_status_idx
  on public.request_company_matches (company_id, status, created_at desc);
create index if not exists request_company_matches_request_idx
  on public.request_company_matches (request_id, created_at desc);

create table if not exists billing.accounts (
  id uuid primary key default gen_random_uuid(),
  owner_type public.billing_owner_type not null,
  profile_id uuid references public.profiles (id) on delete cascade,
  company_id uuid references public.companies (id) on delete cascade,
  email extensions.citext not null,
  stripe_customer_id text unique,
  fakturownia_client_id text,
  locale text not null default 'sk-SK',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (owner_type = 'profile' and profile_id is not null and company_id is null)
    or
    (owner_type = 'company' and company_id is not null and profile_id is null)
  )
);

create unique index if not exists billing_accounts_profile_unique
  on billing.accounts (profile_id) where profile_id is not null;
create unique index if not exists billing_accounts_company_unique
  on billing.accounts (company_id) where company_id is not null;

create table if not exists billing.payments (
  id uuid primary key default gen_random_uuid(),
  billing_account_id uuid not null references billing.accounts (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  request_id uuid references public.requests (id) on delete set null,
  purpose public.payment_purpose not null,
  provider public.webhook_provider not null default 'stripe',
  status public.payment_status not null default 'created',
  currency text not null default 'eur',
  amount_cents integer not null check (amount_cents >= 0),
  checkout_session_id text unique,
  payment_intent_id text unique,
  stripe_invoice_id text,
  metadata jsonb not null default '{}'::jsonb,
  succeeded_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_payments_account_status_idx
  on billing.payments (billing_account_id, status, created_at desc);
create index if not exists billing_payments_request_idx on billing.payments (request_id);

create table if not exists billing.lead_unlock_entitlements (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  payment_id uuid references billing.payments (id) on delete set null,
  status public.unlock_status not null default 'pending_payment',
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'eur',
  granted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, company_id)
);

create index if not exists lead_unlock_entitlements_company_status_idx
  on billing.lead_unlock_entitlements (company_id, status);

create table if not exists billing.subscriptions (
  id uuid primary key default gen_random_uuid(),
  billing_account_id uuid not null references billing.accounts (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  provider public.webhook_provider not null default 'stripe',
  plan_code text not null default 'vip_monthly',
  status public.subscription_status not null default 'incomplete',
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  trial_ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists billing_subscriptions_company_unique on billing.subscriptions (company_id);

create table if not exists billing.invoices (
  id uuid primary key default gen_random_uuid(),
  billing_account_id uuid not null references billing.accounts (id) on delete cascade,
  payment_id uuid references billing.payments (id) on delete set null,
  subscription_id uuid references billing.subscriptions (id) on delete set null,
  provider public.webhook_provider not null default 'fakturownia',
  status public.invoice_status not null default 'draft',
  external_invoice_id text,
  external_number text,
  public_url text,
  issued_at timestamptz,
  due_at timestamptz,
  total_cents integer not null default 0 check (total_cents >= 0),
  currency text not null default 'eur',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_invoices_account_status_idx
  on billing.invoices (billing_account_id, status, created_at desc);

create table if not exists ops.notification_messages (
  id uuid primary key default gen_random_uuid(),
  aggregate_type text not null,
  aggregate_id uuid,
  template_code text not null,
  locale text not null default 'sk-SK',
  status public.notification_status not null default 'queued',
  preferred_channels public.notification_channel[] not null default '{email}'::public.notification_channel[],
  fallback_channels public.notification_channel[] not null default '{}'::public.notification_channel[],
  recipient_name text,
  recipient_email extensions.citext,
  recipient_phone text,
  recipient_whatsapp text,
  payload jsonb not null default '{}'::jsonb,
  final_channel public.notification_channel,
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notification_messages_status_idx on ops.notification_messages (status, scheduled_at);

create table if not exists ops.notification_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references ops.notification_messages (id) on delete cascade,
  channel public.notification_channel not null,
  provider public.notification_provider not null,
  status public.notification_attempt_status not null default 'queued',
  attempt_number integer not null default 1,
  provider_message_id text,
  provider_response jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  attempted_at timestamptz not null default now()
);

create index if not exists notification_delivery_attempts_message_idx
  on ops.notification_delivery_attempts (message_id, attempt_number);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_profile_id uuid references public.profiles (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  status public.blog_post_status not null default 'draft',
  slug text not null unique,
  title_sk text not null,
  excerpt_sk text not null,
  body_markdown_sk text not null,
  cover_bucket text default 'blog-assets',
  cover_path text,
  video_url text,
  seo_title_sk text,
  seo_description_sk text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_idx on public.blog_posts (status, published_at desc);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  request_id uuid references public.requests (id) on delete set null,
  customer_profile_id uuid references public.profiles (id) on delete set null,
  author_name text not null,
  rating_percent smallint not null check (rating_percent between 0 and 100),
  title_sk text not null,
  body_sk text not null,
  verified_interaction boolean not null default false,
  status public.review_status not null default 'pending',
  moderation_notes text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_company_status_idx on public.reviews (company_id, status, published_at desc);

create table if not exists ops.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles (id) on delete set null,
  actor_role public.user_role,
  action text not null,
  entity_schema text not null,
  entity_table text not null,
  entity_id text not null,
  before_payload jsonb not null default '{}'::jsonb,
  after_payload jsonb not null default '{}'::jsonb,
  request_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx on ops.audit_logs (entity_schema, entity_table, entity_id, created_at desc);

create table if not exists ops.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider public.webhook_provider not null,
  provider_event_id text not null,
  event_type text not null,
  signature_valid boolean not null default false,
  status public.outbox_status not null default 'pending',
  headers jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  unique (provider, provider_event_id)
);

create index if not exists webhook_events_status_idx on ops.webhook_events (provider, status, received_at desc);

create table if not exists ops.outbox_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid,
  dedupe_key text unique,
  payload jsonb not null default '{}'::jsonb,
  status public.outbox_status not null default 'pending',
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists outbox_events_status_available_idx
  on ops.outbox_events (status, available_at, created_at);

