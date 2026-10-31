import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";
import { requiresAppGate } from "./context-only-diff.mjs";

const scriptPath = path.join(import.meta.dirname, "context-only-diff.mjs");

function record(...fields) {
  return `${fields.join("\0")}\0`;
}

test("context paths and an empty buffer do not run the gate", () => {
  assert.equal(requiresAppGate(""), false);
  assert.equal(requiresAppGate(Buffer.alloc(0)), false);
  assert.equal(
    requiresAppGate(record("A", "context/foundation/prd.md") + record("M", "context/changes/note.md")),
    false,
  );
});

test("a path outside context/ runs the gate", () => {
  assert.equal(requiresAppGate(record("M", "src/lib/maze/generate.ts")), true);
  assert.equal(requiresAppGate(record("A", "context")), true);
  assert.equal(requiresAppGate(record("A", "context-foo")), true);
  assert.equal(requiresAppGate(record("M", "src/context/foo")), true);
  assert.equal(requiresAppGate(record("M90", "src/app.ts")), true);
  assert.equal(requiresAppGate(record("M90", "context/a.md")), false);
});

test("rename or copy with one path outside context/ runs the gate", () => {
  assert.equal(requiresAppGate(record("R100", "src/a.ts", "context/a.ts")), true);
  assert.equal(requiresAppGate(record("C075", "context/a.md", "README.md")), true);
  assert.equal(requiresAppGate(record("C100", "context/old.md", "context/new.md")), false);
});

test("a rename inside context/ does not run the gate", () => {
  assert.equal(requiresAppGate(record("R100", "context/old.md", "context/new.md")), false);
});

test("a truncated rename record throws", () => {
  assert.throws(() => requiresAppGate("R100\0context/old.md"));
  assert.throws(() => requiresAppGate(record("R100", "context/old.md")));
  assert.throws(() => requiresAppGate("M"));
});

test("cli prints true or false and exits non-zero on a truncated record", () => {
  const skipped = spawnSync(process.execPath, [scriptPath], {
    input: record("M", "context/a.md"),
    encoding: "utf8",
  });
  assert.equal(skipped.status, 0);
  assert.equal(skipped.stdout, "false\n");

  const runs = spawnSync(process.execPath, [scriptPath], {
    input: record("M", "package.json"),
    encoding: "utf8",
  });
  assert.equal(runs.status, 0);
  assert.equal(runs.stdout, "true\n");

  const broken = spawnSync(process.execPath, [scriptPath], {
    input: "R100\0src/a.ts",
    encoding: "utf8",
  });
  assert.notEqual(broken.status, 0);
});
