import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { robotsHeader } from "./robots.ts";

void describe("robotsHeader", () => {
  void test("staging is not indexed", () => {
    const value = robotsHeader("staging");
    assert.ok(value?.includes("noindex"));
  });

  void test("production and a missing environment add no header", () => {
    assert.equal(robotsHeader("production"), undefined);
    assert.equal(robotsHeader(undefined), undefined);
  });
});
