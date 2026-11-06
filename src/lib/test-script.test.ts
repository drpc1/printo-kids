import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const TEST_FILE = /\.test\.(ts|mjs)$/;
const TEST_ROOTS = ["src", "scripts"];

function listedTestFiles(): string[] {
  const manifest = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as {
    scripts: { test: string };
  };
  return manifest.scripts.test.split(/\s+/).filter((token) => token.includes(".test."));
}

function testFilesOnDisk(): string[] {
  return TEST_ROOTS.flatMap((root) =>
    readdirSync(path.join(repoRoot, root), { recursive: true, encoding: "utf8" })
      .map((entry) => `${root}/${entry.split(path.sep).join("/")}`)
      .filter((file) => TEST_FILE.test(file)),
  );
}

void describe("the test script in package.json", () => {
  void test("lists only files that exist (a missing space glues two paths into one)", () => {
    const missing = listedTestFiles().filter((file) => !testFilesOnDisk().includes(file));
    assert.deepEqual(missing, []);
  });

  void test("lists every test file under src and scripts (an unlisted file never runs)", () => {
    const listed = new Set(listedTestFiles());
    const unlisted = testFilesOnDisk().filter((file) => !listed.has(file));
    assert.deepEqual(unlisted, []);
  });
});
