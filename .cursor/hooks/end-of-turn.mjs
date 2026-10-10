// stop: lint, related unit tests, and astro check for everything this turn changed. One follow-up.
// Exit 0. Failures go back as followup_message, which Cursor submits as the next user message.
// Shell edits never reach postToolUse; git diff is the sweep that still sees them.
// npm test is about 50s with the hook proof included, so this sweep runs importing tests only.
import { existsSync } from "node:fs";
import {
  changedFiles,
  clearRegistry,
  clip,
  collectRoots,
  emit,
  lintableFiles,
  lintFiles,
  parsePayload,
  readStdin,
  runChangedTests,
  runTypecheck,
  sessionCwd,
  sessionIdOf,
} from "./hook-lib.mjs";

const payload = parsePayload(readStdin());
const status = typeof payload.status === "string" ? payload.status : "completed";
const loops = Number(payload.loop_count ?? 0);
// RETRY_GUARD: a second stop from this hook must not send the agent back again.
if (status !== "completed" || loops !== 0) process.exit(0);

const cwd = sessionCwd(payload);
const sessionId = sessionIdOf(payload);
const roots = collectRoots(cwd, sessionId);
if (roots.length === 0) {
  process.stderr.write(`end-of-turn: no git checkout at ${cwd}, nothing checked.\n`);
  process.exit(0);
}

const reports = [];
for (const root of roots) {
  if (!existsSync(root)) continue;
  const changed = changedFiles(root);
  if (changed.length === 0) continue;

  const files = lintableFiles(root, changed);
  if (files.length > 0) {
    const lint = lintFiles(root, files);
    if (lint.missing) {
      reports.push(lint.output || `ESLint is not installed for ${root}. Lint did not run.`);
    } else if (lint.failed) {
      reports.push(`ESLint errors in changed files (${root}):\n${clip(lint.output)}`);
    }
  }

  const tests = runChangedTests(root, changed);
  if (tests.missing) {
    reports.push(tests.output || `Tests did not run in ${root}.`);
  } else if (tests.failed) {
    reports.push(`Tests related to changed files fail (${root}):\n${clip(tests.output)}`);
  }

  const types = runTypecheck(root);
  if (types.missing) {
    reports.push(types.output || `Typecheck did not run in ${root}.`);
  } else if (types.failed) {
    reports.push(`Typecheck fails (${root}):\n${clip(types.output)}`);
  }
}

if (reports.length > 0) {
  emit("followup_message", `Fix these before you finish:\n${reports.join("\n")}`);
} else {
  clearRegistry(sessionId);
}
process.exit(0);
