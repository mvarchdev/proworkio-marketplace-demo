import type {
  CompanyPublicProfile,
  MatchExplanation,
  RequestRecord,
} from "@proworkio/types";

import { distanceInMeters } from "../shared/geo";

interface MatchableCompany extends CompanyPublicProfile {
  location?: { lat: number; lng: number };
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function explainMatch(
  request: RequestRecord,
  company: MatchableCompany,
  requestCategoryLabel?: string,
): MatchExplanation {
  const reasons: string[] = [];
  let score = 0;
  let distance: number | null = null;

  const categoryLabel = requestCategoryLabel ?? request.categoryId;
  if (company.categories.some((entry) => normalize(entry) === normalize(categoryLabel))) {
    score += 55;
    reasons.push("Zhodná kategória");
  } else {
    reasons.push("Kategória sa nezhoduje");
  }

  if (request.location && company.location) {
    distance = Math.round(distanceInMeters(request.location, company.location));
    if (distance <= company.radiusKm * 1000) {
      score += 35;
      reasons.push(`V dosahu ${company.radiusKm} km`);
    } else {
      reasons.push("Mimo servisnej oblasti");
    }
  }

  if (request.urgency === "urgent" && company.vip) {
    score += 10;
    reasons.push("VIP firma pre urgentný dopyt");
  }

  return {
    eligible: score >= 80,
    score: Math.min(score, 100),
    distanceMeters: distance,
    reasons,
  };
}
