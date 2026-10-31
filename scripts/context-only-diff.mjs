// git diff -z -M --name-status: NUL-separated, paths not quoted.
// Ordinary (score digits ignored): STATUS\0PATH\0 where STATUS is A D M T U X B.
// Rename or copy: R<score>\0OLD\0NEW\0 or C<score>\0OLD\0NEW\0.
// A path is inside context/ only when it starts with "context/".

import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import path from "node:path";

const ORDINARY_STATUS = /^[ADMTUXB]\d*$/;
const PAIR_STATUS = /^[RC]\d+$/;

export function requiresAppGate(diff) {
  const text = decode(diff);
  if (text.length === 0) return false;

  const fields = text.split("\0");
  if (fields[fields.length - 1] === "") fields.pop();
  if (fields.length === 0) return false;

  let gateRuns = false;
  let index = 0;
  while (index < fields.length) {
    const status = fields[index];
    index += 1;
    if (status === "") throw new Error("git diff record is missing a status");

    const count = pathCount(status);
    for (let n = 0; n < count; n += 1) {
      const filePath = fields[index];
      index += 1;
      if (filePath === undefined || filePath === "") {
        throw new Error(`git diff record for ${status} is missing a path`);
      }
      if (!filePath.startsWith("context/")) gateRuns = true;
    }
  }
  return gateRuns;
}

function pathCount(status) {
  if (PAIR_STATUS.test(status)) return 2;
  if (ORDINARY_STATUS.test(status)) return 1;
  throw new Error(`unrecognized git diff status: ${status}`);
}

function decode(diff) {
  if (typeof diff === "string") return diff;
  return Buffer.from(diff).toString("utf8");
}

function isDirectRun() {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  return path.resolve(entry) === path.resolve(import.meta.filename);
}

if (isDirectRun()) {
  try {
    const gateRuns = requiresAppGate(readFileSync(0));
    process.stdout.write(gateRuns ? "true\n" : "false\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}
