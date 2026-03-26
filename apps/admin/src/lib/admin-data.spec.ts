import { describe, expect, it } from "vitest";

import { dashboardFeed, dashboardMetrics, dashboardQueues, resourceConfigs } from "./admin-data";

describe("admin-data", () => {
  it("exposes the operational collections required by the admin console", () => {
    expect(Object.keys(resourceConfigs)).toEqual([
      "users",
      "companies",
      "requests",
      "matches",
      "payments",
      "subscriptions",
      "reviews",
      "blog",
      "notifications",
      "webhooks",
      "auditLogs",
    ]);
  });

  it("keeps dashboard summary sections populated", () => {
    expect(dashboardMetrics).toHaveLength(4);
    expect(dashboardQueues.length).toBeGreaterThan(0);
    expect(dashboardFeed.length).toBeGreaterThan(0);

    for (const config of Object.values(resourceConfigs)) {
      expect(config.title.length).toBeGreaterThan(0);
      expect(config.signals.length).toBeGreaterThan(0);
      expect(config.rows.length).toBeGreaterThan(0);
    }
  });
});
