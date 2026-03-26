import type { RequestDraftInput } from "@proworkio/types";

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

export function buildRequestFingerprint(request: RequestDraftInput) {
  return [
    normalizeText(request.categoryId),
    normalizeText(request.title),
    normalizeText(request.description).slice(0, 120),
    normalizeText(request.postalCode),
    normalizeText(request.contact.email),
  ].join("|");
}

export function scoreRequestSimilarity(a: RequestDraftInput, b: RequestDraftInput) {
  let score = 0;

  if (normalizeText(a.categoryId) === normalizeText(b.categoryId)) score += 25;
  if (normalizeText(a.postalCode) === normalizeText(b.postalCode)) score += 25;
  if (normalizeText(a.contact.email) === normalizeText(b.contact.email)) score += 20;
  if (normalizeText(a.title) === normalizeText(b.title)) score += 15;
  if (normalizeText(a.description).slice(0, 80) === normalizeText(b.description).slice(0, 80)) {
    score += 15;
  }

  return score;
}
