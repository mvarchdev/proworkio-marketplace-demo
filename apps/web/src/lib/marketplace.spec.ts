import { describe, expect, it } from "vitest";

import {
  explainMatch,
  resolveClaimedRequestIds,
  resolveFallbackPlan,
  scoreRequestSimilarity,
} from "@proworkio/lib";
import type {
  CompanyPublicProfile,
  NotificationAttempt,
  NotificationMessage,
  RequestDraftInput,
  RequestRecord,
} from "@proworkio/types";

const baseRequestDraft: RequestDraftInput = {
  categoryId: "Maliarske práce",
  title: "Vymaľovanie bytu",
  description: "Potrebujem vymaľovať trojizbový byt po rekonštrukcii.",
  urgency: "normal",
  postalCode: "82105",
  locationLabel: "Bratislava",
  deadlineLabel: "Do dvoch týždňov",
  dynamicValues: {},
  photos: [],
  contact: {
    name: "Lucia Mrázová",
    email: "lucia@example.sk",
    phone: "+421900000000",
    preferredChannel: "email",
  },
  termsAccepted: true,
};

const baseRequestRecord: RequestRecord = {
  ...baseRequestDraft,
  id: "request-1",
  status: "active",
  confirmationStatus: "confirmed",
  createdAt: "2026-03-26T10:00:00.000Z",
};

const baseCompany: CompanyPublicProfile & { location: { lat: number; lng: number } } = {
  id: "company-1",
  slug: "atelier-farba",
  name: "Ateliér Farba",
  legalName: "Ateliér Farba s.r.o.",
  shortDescription: "Maliarske práce pre byty a domy.",
  longDescription: "Kompletné interiérové a exteriérové maľovanie na kľúč.",
  city: "Bratislava",
  radiusKm: 30,
  categories: ["Maliarske práce", "Stavebné práce"],
  gallery: [],
  rating100: 92,
  reviewsCount: 18,
  vip: true,
  status: "active",
  moderationStatus: "approved",
  location: { lat: 48.1486, lng: 17.1077 },
};

describe("resolveFallbackPlan", () => {
  it("keeps preferred order and skips channels marked unavailable", () => {
    const message: NotificationMessage = {
      id: "msg-1",
      templateCode: "request.confirmation",
      recipientId: "recipient-1",
      recipientLabel: "Lucia",
      preferredChannels: ["whatsapp", "email"],
      payload: { requestId: "request-1" },
      status: "queued",
    };

    const history: NotificationAttempt[] = [
      {
        id: "attempt-1",
        messageId: "msg-1",
        channel: "whatsapp",
        status: "provider_failed",
        attemptedAt: "2026-03-26T10:00:00.000Z",
      },
    ];

    expect(
      resolveFallbackPlan(
        message,
        {
          email: true,
          whatsapp: true,
          sms: false,
        },
        history,
      ),
    ).toEqual(["email"]);
  });
});

describe("resolveClaimedRequestIds", () => {
  it("deduplicates guest and existing requests while preserving all unique ids", () => {
    expect(
      resolveClaimedRequestIds({
        guestRequestIds: ["a", "b", "a"],
        existingRequestIds: ["b", "c"],
      }).sort(),
    ).toEqual(["a", "b", "c"]);
  });
});

describe("scoreRequestSimilarity", () => {
  it("scores highly for nearly identical requests", () => {
    const candidate: RequestDraftInput = {
      ...baseRequestDraft,
      description: "Potrebujem vymaľovať trojizbový byt po rekonštrukcii. Steny sú pripravené.",
    };

    expect(scoreRequestSimilarity(baseRequestDraft, candidate)).toBeGreaterThanOrEqual(85);
  });

  it("scores low for different category and locality", () => {
    const unrelated: RequestDraftInput = {
      ...baseRequestDraft,
      categoryId: "Záhradnícke práce",
      title: "Úprava záhrady",
      description: "Potrebujem orezať stromy a upraviť trávnik.",
      postalCode: "04001",
      contact: {
        ...baseRequestDraft.contact,
        email: "ina@example.sk",
      },
    };

    expect(scoreRequestSimilarity(baseRequestDraft, unrelated)).toBeLessThanOrEqual(20);
  });
});

describe("explainMatch", () => {
  it("returns eligible match for nearby company with matching category", () => {
    const request: RequestRecord = {
      ...baseRequestRecord,
      location: { lat: 48.151, lng: 17.11 },
      urgency: "urgent",
    };

    const explanation = explainMatch(request, baseCompany);

    expect(explanation.eligible).toBe(true);
    expect(explanation.score).toBeGreaterThanOrEqual(90);
    expect(explanation.reasons).toContain("Zhodná kategória");
  });

  it("marks company outside service radius as ineligible", () => {
    const request: RequestRecord = {
      ...baseRequestRecord,
      location: { lat: 49.223, lng: 18.739 },
    };

    const explanation = explainMatch(request, baseCompany);

    expect(explanation.eligible).toBe(false);
    expect(explanation.reasons).toContain("Mimo servisnej oblasti");
  });
});

