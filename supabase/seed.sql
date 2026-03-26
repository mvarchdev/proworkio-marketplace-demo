insert into public.categories (id, parent_id, slug, name_sk, description_sk, icon, sort_order, depth)
values
  ('11111111-1111-1111-1111-111111111111', null, 'dom-a-zahrada', 'Dom a záhrada', 'Remeslá, údržba a rekonštrukcie pre domácnosť.', 'hammer', 10, 0),
  ('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'maliarske-prace', 'Maliarske práce', 'Interiérové aj exteriérové maľovanie a stierkovanie.', 'paint-roller', 20, 1),
  ('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'rekonstrukcia-kupelne', 'Rekonštrukcia kúpeľne', 'Kompletné kúpeľňové práce vrátane obkladov a sanity.', 'bath', 30, 1),
  ('11111111-1111-1111-1111-111111111114', null, 'stahovanie', 'Sťahovanie', 'Byty, kancelárie a expresné prevozy.', 'truck', 40, 0),
  ('11111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111114', 'stahovanie-bytu', 'Sťahovanie bytu', 'Sťahovanie bytov a domov s obalovým materiálom.', 'package', 50, 1),
  ('11111111-1111-1111-1111-111111111116', null, 'it-a-web', 'IT a web', 'Weby, e-shopy a digitálne služby pre firmy.', 'monitor', 60, 0),
  ('11111111-1111-1111-1111-111111111117', '11111111-1111-1111-1111-111111111116', 'web-stranky', 'Tvorba webu', 'Firemné weby, landing pages a redizajn.', 'globe', 70, 1)
on conflict (id) do nothing;

insert into public.category_field_sets (id, category_id, scope, version, title_sk, description_sk)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111112', 'request', 1, 'Maliarske práce – dopyt', 'Otázky pre lepšie spárovanie zákazky.'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111112', 'company', 1, 'Maliarske práce – profil firmy', 'Údaje o rozsahu a špecializácii firmy.'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111117', 'request', 1, 'Tvorba webu – dopyt', 'Digitálne požiadavky pre vývoj webu.')
on conflict (id) do nothing;

insert into public.category_field_definitions (
  id,
  field_set_id,
  field_key,
  label_sk,
  help_text_sk,
  field_type,
  sort_order,
  is_required,
  options,
  validation_rules
)
values
  (
    '33333333-3333-3333-3333-333333333331',
    '22222222-2222-2222-2222-222222222221',
    'plocha_m2',
    'Odhadovaná plocha v m²',
    'Pomáha to pripraviť realistickú cenovú ponuku.',
    'number',
    10,
    true,
    '[]'::jsonb,
    '{"min": 1, "max": 10000}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '22222222-2222-2222-2222-222222222221',
    'typ_prac',
    'Typ prác',
    'Vyberte najbližší rozsah zákazky.',
    'select',
    20,
    true,
    '[{"label":"Maľovanie interiéru","value":"interier"},{"label":"Maľovanie exteriéru","value":"exterier"},{"label":"Stierkovanie","value":"stierky"}]'::jsonb,
    '{}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'maximalna_vyska',
    'Maximálna výška prác',
    'Či firma realizuje aj práce vo výškach.',
    'number',
    10,
    false,
    '[]'::jsonb,
    '{"min": 0, "max": 50}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333334',
    '22222222-2222-2222-2222-222222222223',
    'typ_webu',
    'Typ webu',
    'Pomáha vybrať vhodného dodávateľa.',
    'select',
    10,
    true,
    '[{"label":"Prezentačný web","value":"prezentacny"},{"label":"E-shop","value":"eshop"},{"label":"Redizajn existujúceho webu","value":"redizajn"}]'::jsonb,
    '{}'::jsonb
  )
on conflict (id) do nothing;

insert into public.companies (
  id,
  slug,
  legal_name,
  display_name,
  status,
  moderation_status,
  short_description_sk,
  long_description_sk,
  city,
  postal_code,
  address_line_1,
  base_location,
  radius_meters,
  logo_path,
  hero_image_path,
  completeness_score
)
values
  (
    '44444444-4444-4444-4444-444444444441',
    'atelier-farba',
    'Ateliér Farba s.r.o.',
    'Ateliér Farba',
    'active',
    'approved',
    'Skúsení maliari pre byty, rodinné domy a developerské projekty.',
    'Realizujeme maľovanie, stierky aj drobné dokončovacie práce. Kladieme dôraz na termíny, čistotu a jasnú komunikáciu počas celej zákazky.',
    'Bratislava',
    '82105',
    'Prievozská 14',
    extensions.st_setsrid(extensions.st_makepoint(17.1477, 48.1486), 4326)::extensions.geography,
    45000,
    'reference/provider-hero.png',
    'reference/provider-hero-alt.png',
    92
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    'webmade-studio',
    'WebMade Studio j. s. a.',
    'WebMade Studio',
    'active',
    'approved',
    'Navrhujeme a dodávame weby pre menšie aj rastúce firmy.',
    'Pomáhame s obsahom, UX, SEO aj analytikou. Proworkio používame na stabilný prísun kvalitných dopytov mimo agentúrnych sietí.',
    'Žilina',
    '01001',
    'Mariánske námestie 3',
    extensions.st_setsrid(extensions.st_makepoint(18.7408, 49.2231), 4326)::extensions.geography,
    120000,
    'reference/gallery-1.png',
    'reference/blog-cover.png',
    88
  )
on conflict (id) do nothing;

insert into private.company_contacts (
  company_id,
  contact_name,
  public_email,
  support_email,
  billing_email,
  phone,
  whatsapp_phone,
  website_url
)
values
  (
    '44444444-4444-4444-4444-444444444441',
    'Juraj Kováč',
    'info@atelierfarba.sk',
    'podpora@atelierfarba.sk',
    'faktury@atelierfarba.sk',
    '+421905111222',
    '+421905111222',
    'https://atelierfarba.sk'
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    'Michaela Horská',
    'hello@webmade.sk',
    'support@webmade.sk',
    'billing@webmade.sk',
    '+421905333444',
    '+421905333444',
    'https://webmade.sk'
  )
on conflict (company_id) do nothing;

insert into public.company_categories (company_id, category_id)
values
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111112'),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111117')
on conflict (company_id, category_id) do nothing;

insert into public.company_gallery_assets (company_id, storage_path, alt_text_sk, sort_order)
values
  ('44444444-4444-4444-4444-444444444441', 'reference/gallery-1.png', 'Ukážka hotového interiéru.', 10),
  ('44444444-4444-4444-4444-444444444441', 'reference/gallery-2.png', 'Detail maľovaných stien.', 20),
  ('44444444-4444-4444-4444-444444444442', 'reference/gallery-3.png', 'Ukážka webového projektu.', 10)
on conflict (company_id, storage_path) do nothing;

insert into public.requests (
  id,
  public_code,
  category_id,
  title,
  description,
  urgency,
  postal_code,
  location_label,
  location,
  status,
  confirmation_status,
  published_at,
  confirmed_at,
  expires_at,
  budget_min_cents,
  budget_max_cents,
  duplicate_fingerprint
)
values
  (
    '55555555-5555-5555-5555-555555555551',
    'DOPYT-BRATISLAVA1',
    '11111111-1111-1111-1111-111111111112',
    'Vymaľovanie 3-izbového bytu v Ružinove',
    'Hľadám firmu na vymaľovanie bytu po prenájme. Potrebujem rýchly termín a zároveň čisté odovzdanie.',
    'fast',
    '82104',
    'Bratislava, Ružinov',
    extensions.st_setsrid(extensions.st_makepoint(17.1640, 48.1583), 4326)::extensions.geography,
    'active',
    'confirmed',
    now() - interval '1 day',
    now() - interval '1 day',
    now() + interval '14 days',
    80000,
    130000,
    public.sha256_hex('vymaľovanie 3 izbového bytu|82104')
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    'DOPYT-ZILINAWEB1',
    '11111111-1111-1111-1111-111111111117',
    'Nový firemný web pre stavebnú firmu',
    'Potrebujeme moderný prezentačný web s referenciami, formulárom a základným SEO. Preferujeme dodávateľa zo Slovenska.',
    'normal',
    '01001',
    'Žilina',
    extensions.st_setsrid(extensions.st_makepoint(18.7408, 49.2231), 4326)::extensions.geography,
    'active',
    'confirmed',
    now() - interval '2 days',
    now() - interval '2 days',
    now() + interval '21 days',
    150000,
    300000,
    public.sha256_hex('nový firemný web|01001')
  )
on conflict (id) do nothing;

insert into private.request_contacts (
  request_id,
  full_name,
  email,
  phone,
  preferred_channel,
  email_confirmed_at
)
values
  (
    '55555555-5555-5555-5555-555555555551',
    'Lucia Mrázová',
    'lucia@example.sk',
    '+421904555111',
    'email',
    now() - interval '1 day'
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    'Peter Malík',
    'peter@example.sk',
    '+421904555222',
    'whatsapp',
    now() - interval '2 days'
  )
on conflict (request_id) do nothing;

insert into public.request_field_values (request_id, field_definition_id, value)
values
  ('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333331', '84'::jsonb),
  ('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333332', '"interier"'::jsonb),
  ('55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333334', '"prezentacny"'::jsonb)
on conflict (request_id, field_definition_id) do nothing;

insert into public.blog_posts (
  id,
  category_id,
  status,
  slug,
  title_sk,
  excerpt_sk,
  body_markdown_sk,
  cover_path,
  seo_title_sk,
  seo_description_sk,
  published_at
)
values
  (
    '66666666-6666-6666-6666-666666666661',
    '11111111-1111-1111-1111-111111111112',
    'published',
    'ako-pripravit-byt-na-maliara',
    'Ako pripraviť byt na maliara: checklist pre rýchlejší štart',
    'Čo odsunúť, ako chrániť podlahu a ktoré informácie pripraviť ešte pred obhliadkou.',
    '## Pred obhliadkou\nPripravte fotografie, rozlohu miestností a očakávaný termín. Dobrá príprava skracuje cenovú ponuku aj realizáciu.\n\n## Pred prácami\nOdstráňte drobné predmety, označte problematické miesta a dohodnite si prístup k vode a elektrine.',
    'reference/blog-cover.png',
    'Príprava bytu na maliarske práce',
    'Praktický checklist pre zákazníkov, ktorí zadávajú maliarske práce.',
    now() - interval '5 days'
  )
on conflict (id) do nothing;

insert into public.reviews (
  id,
  company_id,
  request_id,
  author_name,
  rating_percent,
  title_sk,
  body_sk,
  verified_interaction,
  status,
  published_at
)
values
  (
    '77777777-7777-7777-7777-777777777771',
    '44444444-4444-4444-4444-444444444441',
    '55555555-5555-5555-5555-555555555551',
    'Lucia M.',
    94,
    'Presný termín a čistá realizácia',
    'Firma prišla načas, priebežne komunikovala a byt odovzdala vo veľmi dobrom stave.',
    true,
    'approved',
    now() - interval '6 hours'
  )
on conflict (id) do nothing;

insert into billing.accounts (id, owner_type, company_id, email, stripe_customer_id)
values
  (
    '88888888-8888-8888-8888-888888888881',
    'company',
    '44444444-4444-4444-4444-444444444441',
    'faktury@atelierfarba.sk',
    'cus_demo_atelierfarba'
  )
on conflict (id) do nothing;

insert into billing.subscriptions (
  id,
  billing_account_id,
  company_id,
  plan_code,
  status,
  stripe_subscription_id,
  stripe_price_id,
  current_period_start,
  current_period_end
)
values
  (
    '99999999-9999-9999-9999-999999999991',
    '88888888-8888-8888-8888-888888888881',
    '44444444-4444-4444-4444-444444444441',
    'vip_monthly',
    'active',
    'sub_demo_atelierfarba',
    'price_demo_vip_monthly',
    now() - interval '10 days',
    now() + interval '20 days'
  )
on conflict (id) do nothing;

insert into billing.payments (
  id,
  billing_account_id,
  company_id,
  request_id,
  purpose,
  status,
  amount_cents,
  checkout_session_id,
  payment_intent_id,
  succeeded_at
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '88888888-8888-8888-8888-888888888881',
    '44444444-4444-4444-4444-444444444441',
    '55555555-5555-5555-5555-555555555551',
    'lead_unlock',
    'succeeded',
    2400,
    'cs_test_unlock_demo',
    'pi_test_unlock_demo',
    now() - interval '12 hours'
  )
on conflict (id) do nothing;

insert into billing.lead_unlock_entitlements (
  id,
  request_id,
  company_id,
  payment_id,
  status,
  amount_cents,
  granted_at
)
values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '55555555-5555-5555-5555-555555555551',
    '44444444-4444-4444-4444-444444444441',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'active',
    2400,
    now() - interval '12 hours'
  )
on conflict (id) do nothing;

insert into billing.invoices (
  id,
  billing_account_id,
  payment_id,
  status,
  external_invoice_id,
  external_number,
  public_url,
  issued_at,
  total_cents
)
values
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    '88888888-8888-8888-8888-888888888881',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'paid',
    'fk_demo_1001',
    '2026/1001',
    'https://app.fakturownia.sk/demo/fk_demo_1001',
    now() - interval '11 hours',
    2400
  )
on conflict (id) do nothing;

insert into ops.notification_messages (
  id,
  aggregate_type,
  aggregate_id,
  template_code,
  status,
  preferred_channels,
  fallback_channels,
  recipient_name,
  recipient_email,
  recipient_phone,
  recipient_whatsapp,
  payload,
  final_channel,
  sent_at
)
values
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    'request',
    '55555555-5555-5555-5555-555555555551',
    'request.confirmed',
    'delivered',
    '{email,whatsapp}'::public.notification_channel[],
    '{sms}'::public.notification_channel[],
    'Lucia Mrázová',
    'lucia@example.sk',
    '+421904555111',
    '+421904555111',
    '{"requestCode":"DOPYT-BRATISLAVA1"}'::jsonb,
    'email',
    now() - interval '23 hours'
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    'match',
    null,
    'match.available',
    'delivered',
    '{whatsapp,email}'::public.notification_channel[],
    '{sms}'::public.notification_channel[],
    'Juraj Kováč',
    'info@atelierfarba.sk',
    '+421905111222',
    '+421905111222',
    '{"requestCode":"DOPYT-BRATISLAVA1","company":"Ateliér Farba"}'::jsonb,
    'whatsapp',
    now() - interval '8 hours'
  )
on conflict (id) do nothing;

insert into ops.notification_delivery_attempts (
  id,
  message_id,
  channel,
  provider,
  status,
  attempt_number,
  provider_message_id,
  provider_response,
  attempted_at
)
values
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    'email',
    'resend',
    'delivered',
    1,
    'res_demo_1',
    '{"provider":"resend","status":"delivered"}'::jsonb,
    now() - interval '23 hours'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
    'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    'whatsapp',
    'infobip',
    'delivered',
    1,
    'ib_demo_1',
    '{"provider":"infobip","status":"accepted"}'::jsonb,
    now() - interval '8 hours'
  )
on conflict (id) do nothing;

insert into ops.webhook_events (
  id,
  provider,
  provider_event_id,
  event_type,
  signature_valid,
  status,
  payload,
  received_at,
  processed_at
)
values
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff1',
    'stripe',
    'evt_demo_checkout_completed',
    'checkout.session.completed',
    true,
    'processed',
    '{"object":"event","type":"checkout.session.completed"}'::jsonb,
    now() - interval '12 hours',
    now() - interval '12 hours'
  )
on conflict (id) do nothing;

select public.run_request_matching('55555555-5555-5555-5555-555555555551');
select public.run_request_matching('55555555-5555-5555-5555-555555555552');
