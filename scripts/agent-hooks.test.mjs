// Proves the Cursor hooks in .cursor/hooks.json. Each case pipes a payload into the real script.
// Slow tools are stubs on PATH. Git and the scripts are real. Nothing here edits the developer checkout.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
  appendFileSync,
  cpSync,
  existsSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const lintScript = path.join(repoRoot, ".cursor", "hooks", "lint-edited-file.mjs");
const stopScript = path.join(repoRoot, ".cursor", "hooks", "end-of-turn.mjs");
const hooksJson = path.join(repoRoot, ".cursor", "hooks.json");

const okTest = `import test from "node:test";
import assert from "node:assert/strict";
test("ok", () => {
  assert.equal(1, 1);
});
`;

const eslintStub = `import fs from "node:fs";
const files = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
const log = process.env.HOOK_STUB_LOG;
if (log) fs.appendFileSync(log, \`eslint \${files.join(" ")}\\n\`);
let failed = false;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  if (fs.readFileSync(file, "utf8").includes("HOOK_LINT_ERROR")) {
    console.error(\`HOOK_LINT_ERROR in \${file}\`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
`;

const astroStub = `import fs from "node:fs";
const log = process.env.HOOK_STUB_LOG;
if (log) fs.appendFileSync(log, \`astro \${process.argv.slice(2).join(" ")}\\n\`);
if (process.env.HOOK_TYPECHECK_FAIL === "1") {
  console.error("TS2304: Cannot find name HOOK_TYPE_ERROR");
  process.exit(1);
}
process.exit(0);
`;

function where(bin) {
  const lookup = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(lookup, [bin], { encoding: "utf8" });
  const line = result.stdout
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find(Boolean);
  if (!line) throw new Error(`cannot find ${bin} on PATH`);
  return line;
}

function basePath() {
  const nodeHome = path.dirname(process.execPath);
  const gitHome = path.dirname(where("git"));
  const parts = [nodeHome, gitHome];
  if (process.platform === "win32") {
    const system = process.env.SystemRoot ?? "C:\\Windows";
    parts.push(path.join(system, "System32"), system);
  } else {
    parts.push("/usr/bin", "/bin");
  }
  return parts.join(path.delimiter);
}

function writeStub(dir, name, body) {
  const script = path.join(dir, `${name}-stub.mjs`);
  writeFileSync(script, body);
  if (process.platform === "win32") {
    writeFileSync(
      path.join(dir, `${name}.cmd`),
      `@echo off\r\nnode "%~dp0${name}-stub.mjs" %*\r\nexit /b %ERRORLEVEL%\r\n`,
    );
  } else {
    const bin = path.join(dir, name);
    writeFileSync(bin, `#!/usr/bin/env bash\nexec node "${script}" "$@"\n`);
    spawnSync("chmod", ["+x", bin]);
  }
}

const eslintDir = mkdtempSync(path.join(os.tmpdir(), "pk-eslint-"));
const astroDir = mkdtempSync(path.join(os.tmpdir(), "pk-astro-"));
writeStub(eslintDir, "eslint", eslintStub);
writeStub(astroDir, "astro", astroStub);
const base = basePath();
const stubPath = [eslintDir, astroDir, base].join(path.delimiter);
const eslintOnlyPath = [eslintDir, base].join(path.delimiter);

function write(dir, rel, contents) {
  const file = path.join(dir, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

function git(cwd, args) {
  return spawnSync("git", args, { cwd, encoding: "utf8" });
}

function createRepo() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "pk-hooks-"));
  const init = git(dir, ["init", "-b", "main"]);
  if (init.status !== 0) throw new Error(init.stderr || "git init failed");
  git(dir, ["config", "user.email", "hooks@example.com"]);
  git(dir, ["config", "user.name", "Hooks"]);
  git(dir, ["config", "core.autocrlf", "false"]);
  write(dir, "README.md", "ok\n");
  write(dir, "package.json", `${JSON.stringify({ scripts: { test: "node --test ok.test.mjs" } }, null, 2)}\n`);
  write(dir, "ok.test.mjs", okTest);
  git(dir, ["add", "."]);
  const commit = git(dir, ["commit", "-m", "init"]);
  if (commit.status !== 0) throw new Error(commit.stderr || commit.stdout || "git commit failed");
  return dir;
}

function rm(dir) {
  if (dir && existsSync(dir)) rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}

function hookEnv(extra = {}) {
  return { ...process.env, PATH: stubPath, NO_COLOR: "1", FORCE_COLOR: "0", ...extra };
}

function runHook(script, input, { cwd, env } = {}) {
  return spawnSync(process.execPath, [script], {
    cwd,
    input,
    encoding: "utf8",
    env: hookEnv(env),
  });
}

function field(result, key) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const text = (result.stdout ?? "").trim();
  if (!text) return "";
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    assert.fail(`stdout was not one JSON object:\n${text}\n${result.stderr ?? ""}`);
  }
  return typeof parsed[key] === "string" ? parsed[key] : "";
}

function logOf(dir) {
  const log = path.join(dir, "stub.log");
  return { log, text: () => (existsSync(log) ? readFileSync(log, "utf8") : "") };
}

test("broken file: file_path and path both report the lint error", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  write(dir, "src/bad.ts", "export const value = HOOK_LINT_ERROR;\n");
  const absolute = path.join(dir, "src", "bad.ts");
  for (const toolInput of [{ file_path: absolute }, { path: absolute }, JSON.stringify({ file_path: absolute })]) {
    const result = runHook(lintScript, JSON.stringify({ cwd: dir, tool_input: toolInput }), { cwd: dir });
    const message = field(result, "additional_context");
    assert.match(message, /bad\.ts/);
    assert.match(message, /HOOK_LINT_ERROR/);
  }
});

test("broken astro file is linted", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  write(dir, "src/page.astro", "---\nconst value = HOOK_LINT_ERROR;\n---\n");
  const result = runHook(
    lintScript,
    JSON.stringify({ cwd: dir, tool_input: { file_path: path.join(dir, "src", "page.astro") } }),
    { cwd: dir },
  );
  const message = field(result, "additional_context");
  assert.match(message, /page\.astro/);
  assert.match(message, /HOOK_LINT_ERROR/);
});

test("clean file succeeds with no additional context", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  const { log, text } = logOf(dir);
  write(dir, "src/ok.ts", "export const value = 1;\n");
  const result = runHook(
    lintScript,
    JSON.stringify({ cwd: dir, tool_input: { file_path: path.join(dir, "src", "ok.ts") } }),
    { cwd: dir, env: { HOOK_STUB_LOG: log } },
  );
  assert.equal(field(result, "additional_context"), "");
  assert.match(text(), /eslint /);
});

test("markdown is skipped", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  const { log, text } = logOf(dir);
  write(dir, "NOTES.md", "HOOK_LINT_ERROR\n");
  const result = runHook(
    lintScript,
    JSON.stringify({ cwd: dir, tool_input: { file_path: path.join(dir, "NOTES.md") } }),
    { cwd: dir, env: { HOOK_STUB_LOG: log } },
  );
  assert.equal(field(result, "additional_context"), "");
  assert.equal(text(), "");
});

test("a missing file succeeds", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  const result = runHook(
    lintScript,
    JSON.stringify({ cwd: dir, tool_input: { file_path: path.join(dir, "src", "missing.ts") } }),
    { cwd: dir },
  );
  assert.equal(field(result, "additional_context"), "");
});

test("empty, unparseable, and path-less payloads succeed", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  for (const input of ["{}", "not json", JSON.stringify({ tool_name: "Write", tool_input: {} })]) {
    const result = runHook(lintScript, input, { cwd: dir });
    assert.equal(field(result, "additional_context"), "");
  }
  const stop = runHook(stopScript, "{}", { cwd: dir });
  assert.equal(field(stop, "followup_message"), "");
});

test("a failing assertion in an importing test is reported", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  write(dir, "src/add.mjs", "export const add = (a, b) => a + b;\n");
  write(
    dir,
    "add.test.mjs",
    `import test from "node:test";
import assert from "node:assert/strict";
import { add } from "./src/add.mjs";
test("add", () => {
  assert.equal(add(1, 1), 3, "HOOK_TEST_FAIL");
});
`,
  );
  const result = runHook(
    lintScript,
    JSON.stringify({ cwd: dir, tool_input: { path: path.join(dir, "src", "add.mjs") } }),
    { cwd: dir },
  );
  const message = field(result, "additional_context");
  assert.match(message, /HOOK_TEST_FAIL/);
  assert.match(message, /add\.test\.mjs/);
});

test("end of turn blocks a lint error written without a per-edit payload", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  write(dir, "src/sneak.ts", "export const value = HOOK_LINT_ERROR;\n");
  const result = runHook(stopScript, JSON.stringify({ status: "completed", loop_count: 0, cwd: dir }), { cwd: dir });
  const message = field(result, "followup_message");
  assert.match(message, /sneak\.ts/);
  assert.match(message, /HOOK_LINT_ERROR/);
});

test("end of turn on a clean change succeeds and runs the checks", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  const { log, text } = logOf(dir);
  write(dir, "src/ok.ts", "export const value = 1;\n");
  const result = runHook(stopScript, JSON.stringify({ status: "completed", loop_count: 0, cwd: dir }), {
    cwd: dir,
    env: { HOOK_STUB_LOG: log },
  });
  assert.equal(field(result, "followup_message"), "");
  assert.match(text(), /eslint /);
  assert.match(text(), /astro /);
});

test("end of turn with no changed files does not run checks", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  const { log, text } = logOf(dir);
  const result = runHook(stopScript, JSON.stringify({ status: "completed", loop_count: 0, cwd: dir }), {
    cwd: dir,
    env: { HOOK_STUB_LOG: log },
  });
  assert.equal(field(result, "followup_message"), "");
  assert.equal(text(), "");
});

test("end of turn with loop_count set succeeds while the error is present", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  const { log, text } = logOf(dir);
  write(dir, "src/sneak.ts", "export const value = HOOK_LINT_ERROR;\n");
  const result = runHook(stopScript, JSON.stringify({ status: "completed", loop_count: 1, cwd: dir }), {
    cwd: dir,
    env: { HOOK_STUB_LOG: log },
  });
  assert.equal(field(result, "followup_message"), "");
  assert.equal(text(), "");
});

test("end of turn reports a failing unit-test assertion", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  write(
    dir,
    "failing.test.mjs",
    `import test from "node:test";
import assert from "node:assert/strict";
test("behaviour", () => {
  assert.equal(1, 2, "HOOK_TEST_FAIL");
});
`,
  );
  write(dir, "package.json", `${JSON.stringify({ scripts: { test: "node --test failing.test.mjs" } }, null, 2)}\n`);
  const result = runHook(stopScript, JSON.stringify({ status: "completed", loop_count: 0, cwd: dir }), { cwd: dir });
  assert.match(field(result, "followup_message"), /HOOK_TEST_FAIL/);
});

test("end of turn reports a failing typecheck", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  write(dir, "src/ok.ts", "export const value = 1;\n");
  const result = runHook(stopScript, JSON.stringify({ status: "completed", loop_count: 0, cwd: dir }), {
    cwd: dir,
    env: { HOOK_TYPECHECK_FAIL: "1" },
  });
  assert.match(field(result, "followup_message"), /HOOK_TYPE_ERROR/);
});

test("CURSOR_PROJECT_DIR does not redirect the check onto another checkout", (t) => {
  const good = createRepo();
  const bad = createRepo();
  t.after(() => {
    rm(good);
    rm(bad);
  });
  const { log, text } = logOf(good);
  write(bad, "src/bad.ts", "export const value = HOOK_LINT_ERROR;\n");
  write(good, "src/ok.ts", "export const value = 1;\n");
  const result = runHook(
    lintScript,
    JSON.stringify({ cwd: good, tool_input: { file_path: path.join(good, "src", "ok.ts") } }),
    { cwd: good, env: { CURSOR_PROJECT_DIR: bad, HOOK_STUB_LOG: log } },
  );
  assert.equal(field(result, "additional_context"), "");
  assert.doesNotMatch(text(), /bad\.ts/);
});

test("a relative path resolves against cwd", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  write(dir, "src/bad.ts", "export const value = HOOK_LINT_ERROR;\n");
  const result = runHook(lintScript, JSON.stringify({ cwd: dir, tool_input: { file_path: "src/bad.ts" } }), {
    cwd: dir,
  });
  const message = field(result, "additional_context");
  assert.match(message, /bad\.ts/);
  assert.match(message, /HOOK_LINT_ERROR/);
});

test("a broken file in another repository is skipped", (t) => {
  const here = createRepo();
  const other = createRepo();
  t.after(() => {
    rm(here);
    rm(other);
  });
  const { log, text } = logOf(here);
  write(other, "src/bad.ts", "export const value = HOOK_LINT_ERROR;\n");
  const result = runHook(
    lintScript,
    JSON.stringify({ cwd: here, tool_input: { file_path: path.join(other, "src", "bad.ts") } }),
    { cwd: here, env: { HOOK_STUB_LOG: log } },
  );
  assert.equal(field(result, "additional_context"), "");
  assert.equal(text(), "");
});

test("end of turn sweeps a sibling worktree registered by the per-edit hook", (t) => {
  const main = createRepo();
  const sibling = path.join(os.tmpdir(), `pk-wt-${randomUUID()}`);
  t.after(() => {
    git(main, ["worktree", "remove", "--force", sibling]);
    rm(sibling);
    rm(main);
  });
  write(main, "src/a.ts", "export const value = 1;\n");
  git(main, ["add", "."]);
  const commit = git(main, ["commit", "-m", "add source"]);
  assert.equal(commit.status, 0, commit.stderr);
  const added = git(main, ["worktree", "add", "--detach", sibling]);
  assert.equal(added.status, 0, added.stderr || added.stdout);
  const id = randomUUID();
  const { log } = logOf(main);
  const edited = runHook(
    lintScript,
    JSON.stringify({
      conversation_id: id,
      cwd: main,
      tool_input: { file_path: path.join(sibling, "src", "a.ts") },
    }),
    { cwd: main, env: { HOOK_STUB_LOG: log } },
  );
  assert.equal(field(edited, "additional_context"), "");
  appendFileSync(path.join(sibling, "src", "a.ts"), "\nexport const broken = HOOK_LINT_ERROR;\n");
  const stop = runHook(
    stopScript,
    JSON.stringify({ status: "completed", loop_count: 0, cwd: main, conversation_id: id }),
    { cwd: main, env: { HOOK_STUB_LOG: log } },
  );
  const message = field(stop, "followup_message");
  assert.match(message, /HOOK_LINT_ERROR/);
  assert.match(message, /a\.ts/);
});

test("config commands reach the scripts when CURSOR_PROJECT_DIR is missing", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  cpSync(path.join(repoRoot, ".cursor", "hooks"), path.join(dir, ".cursor", "hooks"), { recursive: true });
  cpSync(hooksJson, path.join(dir, ".cursor", "hooks.json"));
  const config = JSON.parse(readFileSync(hooksJson, "utf8"));
  const missing = path.join(dir, "missing-project-dir");
  const cases = [
    [config.hooks.postToolUse[0].command, "{}"],
    [config.hooks.stop[0].command, JSON.stringify({ status: "aborted" })],
  ];
  for (const [command, input] of cases) {
    const result = spawnSync(command, {
      cwd: dir,
      shell: true,
      input,
      encoding: "utf8",
      env: hookEnv({ CURSOR_PROJECT_DIR: missing }),
    });
    assert.equal(result.status, 0, `${command}\n${result.stderr ?? ""}\n${result.stdout ?? ""}`);
    assert.equal((result.stdout ?? "").trim(), "");
  }
});

test("a missing linter is a failure signal, not a pass", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  write(dir, "src/bad.ts", "export const value = HOOK_LINT_ERROR;\n");
  const result = runHook(
    lintScript,
    JSON.stringify({ cwd: dir, tool_input: { path: path.join(dir, "src", "bad.ts") } }),
    {
      cwd: dir,
      env: { PATH: base },
    },
  );
  assert.match(field(result, "additional_context"), /ESLint is not installed/);
});

test("a missing linter and typechecker at end of turn are a failure signal", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  write(dir, "src/bad.ts", "export const value = 1;\n");
  const result = runHook(stopScript, JSON.stringify({ status: "completed", loop_count: 0, cwd: dir }), {
    cwd: dir,
    env: { PATH: base },
  });
  const message = field(result, "followup_message");
  assert.match(message, /ESLint is not installed/);
  assert.match(message, /Typecheck did not run/);
});

test("typechecker missing while eslint is present still fails the turn", (t) => {
  const dir = createRepo();
  t.after(() => rm(dir));
  write(dir, "src/ok.ts", "export const value = 1;\n");
  const result = runHook(stopScript, JSON.stringify({ status: "completed", loop_count: 0, cwd: dir }), {
    cwd: dir,
    env: { PATH: eslintOnlyPath },
  });
  const message = field(result, "followup_message");
  assert.match(message, /Typecheck did not run/);
  assert.doesNotMatch(message, /ESLint is not installed/);
});
