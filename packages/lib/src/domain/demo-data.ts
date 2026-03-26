import type {
  BlogPostPreview,
  Category,
  CompanyPublicProfile,
  PublicHomepageSnapshot,
  RequestRecord,
  ReviewRecord,
} from "@proworkio/types";

export const categories: Category[] = [
  {
    id: "maliarske-prace",
    slug: "maliarske-prace",
    name: "Maliarske práce",
    shortDescription: "Maľovanie interiérov, fasád a opravy povrchov.",
    depth: 0,
    icon: "PaintRoller",
    requestFields: [
      {
        id: "metre",
        fieldKey: "metre",
        label: "Približná výmera",
        type: "number",
        required: true,
        min: 1,
      },
      {
        id: "stav-podkladu",
        fieldKey: "stav_podkladu",
        label: "Stav podkladu",
        type: "select",
        required: true,
        options: [
          { label: "Bez poškodenia", value: "bez-poskodenia" },
          { label: "Menšie opravy", value: "mensie-opravy" },
          { label: "Kompletná príprava", value: "kompletna-priprava" },
        ],
      },
    ],
    companyFields: [
      {
        id: "skusenost",
        fieldKey: "roky_skusenosti",
        label: "Roky skúseností",
        type: "number",
        required: true,
      },
    ],
  },
  {
    id: "strechy",
    slug: "strechy",
    name: "Strechy",
    shortDescription: "Pokryvačské práce, opravy a rekonštrukcie striech.",
    depth: 0,
    icon: "House",
    requestFields: [],
    companyFields: [],
  },
  {
    id: "elektroinstalacie",
    slug: "elektroinstalacie",
    name: "Elektroinštalácie",
    shortDescription: "Montáže, revízie a modernizácie elektro rozvodov.",
    depth: 0,
    icon: "Bolt",
    requestFields: [],
    companyFields: [],
  },
];

export const featuredCompanies: CompanyPublicProfile[] = [
  {
    id: "firma-paintlab",
    slug: "paintlab-interiery",
    name: "Paintlab Interiéry",
    legalName: "Paintlab Interiéry s.r.o.",
    shortDescription: "Rýchle a čisté maľovanie bytov a domov po celom západnom Slovensku.",
    longDescription:
      "Špecializujeme sa na interiérové maľovanie, lokálne opravy stien a bezprašnú prípravu podkladu.",
    city: "Bratislava",
    radiusKm: 80,
    categories: ["Maliarske práce"],
    gallery: ["/reference/gallery-1.png", "/reference/gallery-2.png"],
    rating100: 92,
    reviewsCount: 47,
    vip: true,
    status: "active",
    moderationStatus: "approved",
    logoUrl: "/reference/gallery-3.png",
    heroImageUrl: "/reference/provider-hero.png",
  },
  {
    id: "firma-strecha",
    slug: "strecha-profi",
    name: "Strecha Profi",
    legalName: "Strecha Profi, a.s.",
    shortDescription: "Komplexné rekonštrukcie striech s dôrazom na bezpečnosť a záruku.",
    longDescription:
      "Realizujeme nové strechy, opravy po poškodení a pravidelný servis strešných systémov.",
    city: "Trnava",
    radiusKm: 120,
    categories: ["Strechy"],
    gallery: [],
    rating100: 88,
    reviewsCount: 31,
    vip: false,
    status: "active",
    moderationStatus: "approved",
    heroImageUrl: "/reference/provider-hero-alt.png",
  },
];

export const latestRequests: RequestRecord[] = [
  {
    id: "req-001",
    categoryId: "maliarske-prace",
    title: "Vymaľovanie rodinného domu cca 420 m2",
    description:
      "Hľadám spoľahlivého maliara na väčší rodinný dom vrátane opravy menších poškodení stien.",
    urgency: "fast",
    postalCode: "900 27",
    locationLabel: "Bernolákovo",
    location: { lat: 48.1948, lng: 17.2794 },
    deadlineLabel: "Ideálne do 3 týždňov",
    dynamicValues: { metre: 420 },
    photos: [],
    contact: {
      name: "Oto J.",
      email: "oto@example.com",
      phone: "+421900000000",
      preferredChannel: "email",
    },
    termsAccepted: true,
    status: "active",
    confirmationStatus: "confirmed",
    createdAt: "2026-03-22T10:15:00.000Z",
    publishedAt: "2026-03-22T10:18:00.000Z",
    budgetLabel: "viac než 5000 €",
  },
  {
    id: "req-002",
    categoryId: "strechy",
    title: "Oprava zatekania na streche pri komíne",
    description: "Po silnom vetre zateká pri komíne. Potrebujem obhliadku a návrh opravy.",
    urgency: "urgent",
    postalCode: "917 01",
    locationLabel: "Trnava",
    location: { lat: 48.3774, lng: 17.5872 },
    deadlineLabel: "Čo najskôr",
    dynamicValues: {},
    photos: [],
    contact: {
      name: "Marta K.",
      email: "marta@example.com",
      phone: "+421901111111",
      preferredChannel: "sms",
    },
    termsAccepted: true,
    status: "active",
    confirmationStatus: "confirmed",
    createdAt: "2026-03-25T07:00:00.000Z",
    publishedAt: "2026-03-25T07:05:00.000Z",
    budgetLabel: "do 1000 €",
  },
];

export const blogPosts: BlogPostPreview[] = [
  {
    id: "blog-001",
    slug: "ako-vybrat-firmu-na-maliarske-prace",
    category: "Maliarske práce",
    title: "Ako vybrať firmu na maliarske práce bez zbytočných rizík",
    excerpt: "Kontrolný zoznam, ktorý odhalí spoľahlivého dodávateľa ešte pred prvou obhliadkou.",
    publishedAt: "2026-03-15T08:00:00.000Z",
    readingMinutes: 4,
    coverUrl: "/reference/blog-cover.png",
  },
  {
    id: "blog-002",
    slug: "kolko-stoji-oprava-strechy-v-roku-2026",
    category: "Strechy",
    title: "Koľko stojí oprava strechy v roku 2026",
    excerpt: "Praktický prehľad cien, termínov a najčastejších skrytých položiek.",
    publishedAt: "2026-03-19T08:00:00.000Z",
    readingMinutes: 5,
    coverUrl: "/reference/blog-cover.png",
  },
];

export const reviews: ReviewRecord[] = [
  {
    id: "rev-001",
    companyId: "firma-paintlab",
    authorName: "Lenka M.",
    rating100: 96,
    title: "Perfektná komunikácia a čistota",
    body: "Firma prišla načas, pripravila si priestory a po sebe všetko upratala.",
    status: "approved",
    publishedAt: "2026-03-10T08:00:00.000Z",
  },
];

export const homepageSnapshot: PublicHomepageSnapshot = {
  latestRequests,
  featuredCompanies,
  blogPosts,
  stats: [
    {
      label: "dopytov za mesiac",
      value: "1 300+",
      description: "Aktívnych požiadaviek od zákazníkov",
    },
    {
      label: "overených firiem",
      value: "280+",
      description: "S moderáciou a sledovaním kvality",
    },
    {
      label: "úspešnosť spojenia",
      value: "84 %",
      description: "Dopytov, ktoré získali relevantnú reakciu",
    },
  ],
};
