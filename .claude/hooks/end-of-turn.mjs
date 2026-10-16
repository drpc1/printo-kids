// Claude Code Stop: lint, related unit tests, and astro check for everything this turn changed.
// Reuses the Cursor hook helpers. Failures go back as stderr + exit 2 (Claude keeps working), one retry.
// Cursor imports .claude/settings.json hooks and already runs its native copy: exit early there.
import { existsSync } from "node:fs";
import {
  changedFiles,
  clearRegistry,
  clip,
  collectRoots,
  lintableFiles,
  lintFiles,
  parsePayload,
  readStdin,
  runChangedTests,
  runTypecheck,
  sessionCwd,
  sessionIdOf,
} from "../../.cursor/hooks/hook-lib.mjs";

if (process.env.CURSOR_VERSION) process.exit(0);

const payload = parsePayload(readStdin());
// RETRY_GUARD: already sent back once by this hook, let it finish.
if (payload.stop_hook_active === true) process.exit(0);

const cwd = sessionCwd(payload);
const sessionId = sessionIdOf(payload);
const roots = collectRoots(cwd, sessionId);
if (roots.length === 0) {
  process.stdout.write(
    `${JSON.stringify({ systemMessage: `end-of-turn: no git checkout at ${cwd}, nothing checked.` })}\n`,
  );
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
  process.stderr.write(`Fix these before you finish:\n${reports.join("\n")}\n`);
  process.exit(2);
}
clearRegistry(sessionId);
process.exit(0);
