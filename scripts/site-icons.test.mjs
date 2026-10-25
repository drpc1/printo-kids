import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

const faviconPath = path.join(import.meta.dirname, "..", "public", "favicon.png");

test("public/favicon.png is a 32 by 32 PNG", () => {
  const bytes = readFileSync(faviconPath);
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(bytes.toString("ascii", 12, 16), "IHDR");
  assert.equal(bytes.readUInt32BE(16), 32);
  assert.equal(bytes.readUInt32BE(20), 32);
});
