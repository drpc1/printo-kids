// Runs a command with extra environment variables, the same on Windows and Linux (no shell prefix syntax).
// Usage: node scripts/with-env.mjs NAME=value [NAME=value ...] -- <command> [args...]
import { spawn } from "node:child_process";

const separator = process.argv.indexOf("--");
if (separator < 3 || separator === process.argv.length - 1) {
  console.error("usage: node scripts/with-env.mjs NAME=value [NAME=value ...] -- <command> [args...]");
  process.exit(2);
}

const env = { ...process.env };
for (const pair of process.argv.slice(2, separator)) {
  const equals = pair.indexOf("=");
  if (equals < 1) {
    console.error(`not a NAME=value pair: ${pair}`);
    process.exit(2);
  }
  env[pair.slice(0, equals)] = pair.slice(equals + 1);
}

const [command, ...args] = process.argv.slice(separator + 1);
const child = spawn(command, args, { env, stdio: "inherit" });
child.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
