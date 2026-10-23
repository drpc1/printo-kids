// Smoke test: the product pages (/ card catalog, /labirynt maze generator, /symetria symmetry generator) are served and the starter account routes are gone.
// Zero dependencies on purpose. Run against a live server: BASE_URL=http://localhost:4321 node scripts/smoke.mjs

const BASE_URL = process.env.BASE_URL ?? "http://localhost:4321";
const CATALOG_SENTENCE = "Wybierz rodzaj karty i wydrukuj ją na kartce A4.";
const HOME_SENTENCE = "Wygeneruj labirynt i wydrukuj go na kartce A4.";
const SYMMETRY_SENTENCE = "Wygeneruj kartę symetrii i wydrukuj ją na kartce A4.";

async function request(path) {
  const response = await fetch(BASE_URL + path, { redirect: "manual" });
  const body = await response.text();
  return { status: response.status, body };
}

const steps = [
  [
    "home renders the card catalog sentence",
    () => request("/"),
    (actual) => actual.status === 200 && actual.body.includes(CATALOG_SENTENCE),
    `200 and ${CATALOG_SENTENCE}`,
  ],
  [
    "labirynt renders the worksheet sentence",
    () => request("/labirynt"),
    (actual) => actual.status === 200 && actual.body.includes(HOME_SENTENCE),
    `200 and ${HOME_SENTENCE}`,
  ],
  [
    "symetria renders the worksheet sentence",
    () => request("/symetria"),
    (actual) => actual.status === 200 && actual.body.includes(SYMMETRY_SENTENCE),
    `200 and ${SYMMETRY_SENTENCE}`,
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
