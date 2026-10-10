// postToolUse (Write): lint the edited file and run tests that import it.
// Exit 0. Lint and test failures go back as additional_context, which Cursor injects after the tool result.
import { existsSync } from "node:fs";
import path from "node:path";
import {
  clip,
  editedPath,
  emit,
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
} from "./hook-lib.mjs";

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

if (messages.length > 0) emit("additional_context", messages.join("\n"));
process.exit(0);
