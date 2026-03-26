import { describe, expect, it } from "vitest";

import {
  companyApprovalBadge,
  formatDistance,
  notificationResultBadge,
  paymentStatusBadge,
  summarizeMatchReason,
} from "./admin-presenters";

describe("admin-presenters", () => {
  it("formats kilometer distances without string arithmetic bugs", () => {
    expect(formatDistance(1624)).toBe("1,6 km");
    expect(formatDistance(320)).toBe("320 m");
  });

  it("maps operational statuses to user-facing badges", () => {
    expect(companyApprovalBadge("active", "approved")).toEqual({
      label: "Schválená",
      tone: "accent",
    });
    expect(paymentStatusBadge("failed")).toEqual({
      label: "Zlyhalo",
      tone: "dark",
    });
  });

  it("highlights fallback channel delivery and readable match reasons", () => {
    expect(notificationResultBadge("delivered", "sms", ["email"])).toEqual({
      label: "Fallback SMS",
      tone: "muted",
    });
    expect(
      summarizeMatchReason({ reasons: ["kategória", "vzdialenosť"] }, 1624),
    ).toBe("kategória + vzdialenosť");
  });
});
