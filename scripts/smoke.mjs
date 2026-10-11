// Smoke test: the product page is served and the starter account routes are gone.
// Zero dependencies on purpose. Run against a live server: BASE_URL=http://localhost:4321 node scripts/smoke.mjs

const BASE_URL = process.env.BASE_URL ?? "http://localhost:4321";
const HOME_SENTENCE = "Wygeneruj labirynt i wydrukuj go na kartce A4.";

async function request(path) {
  const response = await fetch(BASE_URL + path, { redirect: "manual" });
  const body = await response.text();
  return { status: response.status, body };
}

const steps = [
  [
    "home renders the worksheet sentence",
    () => request("/"),
    (actual) => actual.status === 200 && actual.body.includes(HOME_SENTENCE),
    `200 and ${HOME_SENTENCE}`,
  ],
  ["signin is not served", () => request("/auth/signin"), (actual) => actual.status === 404, "404"],
  ["signup is not served", () => request("/auth/signup"), (actual) => actual.status === 404, "404"],
  ["confirm-email is not served", () => request("/auth/confirm-email"), (actual) => actual.status === 404, "404"],
  ["dashboard is not served", () => request("/dashboard"), (actual) => actual.status === 404, "404"],
];

let failed = 0;
for (const [name, run, ok, expected] of steps) {
  const actual = await run();
  const passed = ok(actual);
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}  -> ${actual.status}`);
  if (!passed) {
    failed++;
    console.log(`      expected ${expected}`);
  }
}

console.log(failed ? `\n${failed} step(s) failed` : "\nAll smoke steps passed");
process.exit(failed ? 1 : 0);
