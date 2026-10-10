// Shared helpers for the Cursor agent hooks.
// Lint extensions come from eslint.config.js: js/jsx/ts/tsx, astro (eslint-plugin-astro), mjs (scripts/**/*.mjs), cjs (base config).
// Feedback is exit 0 plus one JSON object on stdout. Cursor injects additional_context / followup_message.
// Do not cd to CURSOR_PROJECT_DIR: it is the directory the session started in and goes stale for a worktree.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, appendFileSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const LINT_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".astro"]);
const TEST_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

export function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

export function parsePayload(text) {
  const trimmed = text.trim();
  if (!trimmed) return {};
  try {
    const value = JSON.parse(trimmed);
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return value;
  } catch {
    return {};
  }
}

export function editedPath(payload) {
  let input = payload.tool_input ?? payload.tool_args ?? payload.toolArgs;
  if (typeof input === "string") {
    try {
      input = JSON.parse(input);
    } catch {
      return "";
    }
  }
  if (!input || typeof input !== "object") return "";
  for (const key of ["file_path", "path", "target_file", "notebook_path"]) {
    if (typeof input[key] === "string" && input[key]) return input[key];
  }
  return "";
}

export function sessionCwd(payload) {
  return typeof payload.cwd === "string" && payload.cwd ? payload.cwd : process.cwd();
}

export function sessionIdOf(payload) {
  const raw = payload.conversation_id || payload.session_id || "";
  return String(raw).replace(/[^A-Za-z0-9_-]/g, "");
}

export function resolveEdited(file, cwd) {
  return path.resolve(cwd, file);
}

export function isLinted(file) {
  return LINT_EXT.has(path.extname(file).toLowerCase());
}

export function isTestableSource(file) {
  return TEST_EXT.has(path.extname(file).toLowerCase());
}

function samePath(left, right) {
  const a = path.resolve(left);
  const b = path.resolve(right);
  return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
}

function toolEnv() {
  const env = {
    ...process.env,
    NO_COLOR: "1",
    FORCE_COLOR: "0",
    GIT_TERMINAL_PROMPT: "0",
  };
  // A hook started from `node --test` inherits NODE_TEST_CONTEXT. Leaving it set makes a
  // child `node --test` skip its files and exit 0.
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_CHANNEL_FD;
  return env;
}

export function git(cwd, args) {
  return spawnSync("git", ["-c", "core.quotepath=false", "-c", "color.ui=never", ...args], {
    cwd,
    encoding: "utf8",
    windowsHide: true,
    env: toolEnv(),
    maxBuffer: 8_000_000,
  });
}

export function repoTop(start) {
  if (!start || !existsSync(start)) return "";
  const result = git(start, ["rev-parse", "--show-toplevel"]);
  if (result.status !== 0) return "";
  return path.resolve(result.stdout.trim());
}

export function commonDir(start) {
  if (!start || !existsSync(start)) return "";
  const result = git(start, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  if (result.status !== 0) return "";
  return path.resolve(result.stdout.trim());
}

export function sameRepo(fileDir, sessionDir) {
  const fileCommon = commonDir(fileDir);
  const sessionCommon = commonDir(sessionDir);
  if (!fileCommon || !sessionCommon) return false;
  return samePath(fileCommon, sessionCommon);
}

function registryFile(sessionId) {
  if (!sessionId) return "";
  return path.join(os.tmpdir(), "cursor-hooks", `${sessionId}.roots`);
}

export function registerRoot(sessionId, root) {
  const file = registryFile(sessionId);
  if (!file) return;
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, `${path.resolve(root)}\n`);
}

export function registeredRoots(sessionId) {
  const file = registryFile(sessionId);
  if (!file || !existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && existsSync(line));
}

export function clearRegistry(sessionId) {
  const file = registryFile(sessionId);
  if (!file || !existsSync(file)) return;
  writeFileSync(file, "");
}

export function collectRoots(cwd, sessionId) {
  const found = [];
  const top = repoTop(cwd);
  if (top) found.push(top);
  for (const registered of registeredRoots(sessionId)) {
    const topLevel = repoTop(registered) || registered;
    if (existsSync(topLevel)) found.push(path.resolve(topLevel));
  }
  const unique = [];
  for (const root of found) {
    if (!unique.some((existing) => samePath(existing, root))) unique.push(root);
  }
  return unique;
}

export function changedFiles(root) {
  const names = new Set();
  const add = (text) => {
    for (const line of text.split(/\r?\n/)) {
      const name = line.trim();
      if (name) names.add(name);
    }
  };
  const diff = git(root, ["diff", "--name-only", "HEAD"]);
  if (diff.status === 0) add(diff.stdout);
  const untracked = git(root, ["ls-files", "-o", "--exclude-standard"]);
  if (untracked.status === 0) add(untracked.stdout);
  return [...names];
}

function underCursor(root, file) {
  const rel = path.relative(root, file);
  return rel === ".cursor" || rel.startsWith(`.cursor${path.sep}`) || rel.startsWith(".cursor/");
}

export function lintableFiles(root, relativeNames) {
  const files = [];
  for (const name of relativeNames) {
    const abs = path.resolve(root, name);
    if (!isLinted(abs) || !existsSync(abs) || underCursor(root, abs)) continue;
    files.push(abs);
  }
  return files;
}

function dependencyRoot(checkout) {
  const local = path.join(checkout, "node_modules", "eslint", "bin", "eslint.js");
  if (existsSync(local)) return checkout;
  const common = commonDir(checkout);
  if (common && path.basename(common) === ".git") {
    const main = path.dirname(common);
    if (existsSync(path.join(main, "node_modules", "eslint", "bin", "eslint.js"))) return main;
  }
  return checkout;
}

function combine(result) {
  return `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
}

function fromSpawn(result) {
  if (result.error) {
    return { missing: result.error.code === "ENOENT", failed: true, output: result.error.message };
  }
  return { missing: false, failed: (result.status ?? 1) !== 0, output: combine(result) };
}

function winQuote(arg) {
  if (arg.length === 0) return '""';
  if (!/[\s"&|<>^%]/.test(arg)) return arg;
  return `"${arg.replace(/"/g, '""')}"`;
}

function runBin(bin, args, cwd) {
  const options = {
    cwd,
    encoding: "utf8",
    env: toolEnv(),
    windowsHide: true,
    maxBuffer: 8_000_000,
  };
  if (process.platform === "win32") {
    const cmdline = [bin, ...args.map(winQuote)].join(" ");
    return fromSpawn(spawnSync("cmd.exe", ["/d", "/s", "/c", cmdline], options));
  }
  return fromSpawn(spawnSync(bin, args, options));
}

function runNode(script, args, cwd) {
  return fromSpawn(
    spawnSync(process.execPath, [script, ...args], {
      cwd,
      encoding: "utf8",
      env: toolEnv(),
      windowsHide: true,
      maxBuffer: 8_000_000,
    }),
  );
}

function commandOnPath(bin) {
  const lookup = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(lookup, [bin], {
    encoding: "utf8",
    env: toolEnv(),
    windowsHide: true,
  });
  return result.status === 0;
}

export function clip(text, limit = 8000) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}\n…(truncated)`;
}

export function lintFiles(checkout, files) {
  const deps = dependencyRoot(checkout);
  const local = path.join(deps, "node_modules", "eslint", "bin", "eslint.js");
  const args = ["--quiet", ...files];
  if (existsSync(local)) return runNode(local, args, checkout);
  if (!commandOnPath("eslint")) {
    return {
      missing: true,
      failed: true,
      output: `ESLint is not installed for ${checkout} (node_modules/eslint or eslint on PATH). Lint did not run.`,
    };
  }
  return runBin("eslint", args, checkout);
}

export function runTypecheck(checkout) {
  const deps = dependencyRoot(checkout);
  const local = path.join(deps, "node_modules", "astro", "bin", "astro.mjs");
  if (existsSync(local)) return runNode(local, ["check"], checkout);
  if (!commandOnPath("astro")) {
    return {
      missing: true,
      failed: true,
      output: `Typecheck did not run in ${checkout}: astro is not installed (node_modules/astro or astro on PATH).`,
    };
  }
  return runBin("astro", ["check"], checkout);
}

function readTestScript(checkout) {
  const pkgPath = path.join(checkout, "package.json");
  if (!existsSync(pkgPath)) return "";
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    return typeof pkg.scripts?.test === "string" ? pkg.scripts.test : "";
  } catch {
    return "";
  }
}

function isFileArg(arg) {
  return /\.[cm]?[jt]sx?$/.test(arg) || arg.includes("*");
}

function runTestFiles(checkout, tests) {
  if (tests.length === 0) return { missing: false, failed: false, output: "", skipped: true };
  const script = readTestScript(checkout);
  if (!script) {
    return {
      missing: true,
      failed: true,
      output: `Tests did not run in ${checkout}: package.json has no test script.`,
    };
  }
  const tokens = script.trim().split(/\s+/).filter((token) => !isFileArg(token));
  const [bin, ...args] = tokens;
  if (!bin) {
    return { missing: true, failed: true, output: `Tests did not run in ${checkout}: test script is empty.` };
  }
  const runnerArgs = [...args, ...tests];
  if (bin === "node") {
    return fromSpawn(
      spawnSync(process.execPath, runnerArgs, {
        cwd: checkout,
        encoding: "utf8",
        env: toolEnv(),
        windowsHide: true,
        maxBuffer: 8_000_000,
      }),
    );
  }
  return runBin(bin, runnerArgs, checkout);
}

export function relatedTestFiles(checkout, file) {
  const rel = path.relative(checkout, file).split(path.sep).join("/");
  if (/\.test\.[cm]?[jt]sx?$/.test(rel)) return [rel];
  const base = path.basename(rel, path.extname(rel)).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = `['"][^'"]*/${base}(\\.[cm]?[jt]sx?)?['"]`;
  const result = git(checkout, [
    "grep",
    "--untracked",
    "-l",
    "-E",
    pattern,
    "--",
    "*.test.ts",
    "*.test.tsx",
    "*.test.js",
    "*.test.jsx",
    "*.test.mjs",
    "*.test.cjs",
  ]);
  if (result.status !== 0) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function runRelatedTests(checkout, file) {
  return runTestFiles(checkout, relatedTestFiles(checkout, file));
}

export function runChangedTests(checkout, relativeNames) {
  const tests = new Set();
  for (const name of relativeNames) {
    const abs = path.resolve(checkout, name);
    if (!existsSync(abs) || !isTestableSource(abs)) continue;
    for (const testFile of relatedTestFiles(checkout, abs)) tests.add(testFile);
  }
  return runTestFiles(checkout, [...tests]);
}

export function emit(field, message) {
  process.stdout.write(`${JSON.stringify({ [field]: message })}\n`);
}
