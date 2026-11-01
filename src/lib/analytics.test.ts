import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { webAnalyticsBeacon } from "./analytics.ts";

const PRODUCTION = "printo-kids.printokids.workers.dev";

void describe("webAnalyticsBeacon", () => {
  void test("production hostname gets the Cloudflare beacon with the site token", () => {
    const beacon = webAnalyticsBeacon(PRODUCTION, undefined);
    assert.ok(beacon);
    assert.equal(beacon.src, "https://static.cloudflareinsights.com/beacon.min.js");
    assert.deepEqual(JSON.parse(beacon.data), { token: "7699341d37474a38b7d4585e3fb50ab8" });
  });

  void test("localhost, staging hostname and an empty hostname get no beacon", () => {
    assert.equal(webAnalyticsBeacon("localhost", undefined), undefined);
    assert.equal(webAnalyticsBeacon("printo-kids-staging.printokids.workers.dev", "staging"), undefined);
    assert.equal(webAnalyticsBeacon("", undefined), undefined);
  });

  void test("the staging environment gets no beacon even on the production hostname", () => {
    assert.equal(webAnalyticsBeacon(PRODUCTION, "staging"), undefined);
  });
});
