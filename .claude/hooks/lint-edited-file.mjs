// Claude Code PostToolUse (Write|Edit): lint the edited file and run tests that import it.
// Reuses the Cursor hook helpers. Failures go back as stderr + exit 2, which Claude sees.
// Cursor imports .claude/settings.json hooks and already runs its native copy: exit early there.
import { existsSync } from "node:fs";
import path from "node:path";
import {
  clip,
  editedPath,
  isLinted,
  isTestableSource,
  lintFiles,
  parsePayload,
  readStdin,
  registerRoot,
  relatedTestFiles,
  repoTop,
  resolveEdited,
  runRelatedTests,
  sameRepo,
  sessionCwd,
  sessionIdOf,
} from "../../.cursor/hooks/hook-lib.mjs";

if (process.env.CURSOR_VERSION) process.exit(0);

const payload = parsePayload(readStdin());
const cwd = sessionCwd(payload);
const raw = editedPath(payload);
if (!raw) process.exit(0);

const file = resolveEdited(raw, cwd);
if (!isLinted(file) || !existsSync(file)) process.exit(0);

const fileDir = path.dirname(file);
const root = repoTop(fileDir);
if (!root || !sameRepo(fileDir, cwd)) process.exit(0);

registerRoot(sessionIdOf(payload), root);

const messages = [];
const lint = lintFiles(root, [file]);
if (lint.missing || lint.failed) {
  const detail = lint.output || `ESLint is not installed for ${root}. Lint did not run on ${file}.`;
  messages.push(lint.missing ? detail : `ESLint reported errors in ${file}:\n${clip(detail)}`);
}

if (isTestableSource(file)) {
  const related = runRelatedTests(root, file);
  if (related.missing || related.failed) {
    const names = relatedTestFiles(root, file).join(", ");
    const rel = path.relative(root, file).split(path.sep).join("/");
    messages.push(`Tests importing ${rel} fail (${names}):\n${clip(related.output)}`);
  }
}

if (messages.length > 0) {
  process.stderr.write(`${messages.join("\n")}\n`);
  process.exit(2);
}
process.exit(0);
