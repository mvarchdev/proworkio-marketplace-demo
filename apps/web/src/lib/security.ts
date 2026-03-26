const globalForRateLimit = globalThis as typeof globalThis & {
  __proworkioRateLimitStore?: Map<string, number[]>;
};

const rateLimitStore = globalForRateLimit.__proworkioRateLimitStore ?? new Map<string, number[]>();
globalForRateLimit.__proworkioRateLimitStore = rateLimitStore;

export class PublicRouteError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PublicRouteError";
    this.status = status;
  }
}

function getClientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function assertRateLimit(
  request: Request,
  namespace: string,
  options: {
    limit: number;
    windowMs: number;
  },
) {
  const key = `${namespace}:${getClientAddress(request)}`;
  const now = Date.now();
  const windowStart = now - options.windowMs;
  const recentHits = (rateLimitStore.get(key) ?? []).filter((hit) => hit >= windowStart);

  if (recentHits.length >= options.limit) {
    throw new PublicRouteError("Príliš veľa požiadaviek. Skúste to prosím o chvíľu znova.", 429);
  }

  recentHits.push(now);
  rateLimitStore.set(key, recentHits);
}

export function assertPublicSubmissionMeta(meta: {
  startedAt: number;
  antiSpamHoney?: string | undefined;
}) {
  if (meta.antiSpamHoney && meta.antiSpamHoney.trim().length > 0) {
    throw new PublicRouteError("Formulár bol vyhodnotený ako neplatný.", 400);
  }

  const elapsed = Date.now() - meta.startedAt;
  if (!Number.isFinite(meta.startedAt) || elapsed < 1500) {
    throw new PublicRouteError("Odoslanie formulára bolo príliš rýchle. Skúste to prosím znova.", 400);
  }
}

export function buildSafeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
