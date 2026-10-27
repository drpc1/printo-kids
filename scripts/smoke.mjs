// Smoke test: the product pages (/ card catalog, /maze maze generator, /symmetry symmetry generator, /sequences sequence generator, /sudoku sudoku generator, /nonogram nonogram generator, /dictation graphic dictation generator) are served, the old Polish card paths redirect, and the starter account routes are gone.
// Zero dependencies on purpose. Run against a live server: BASE_URL=http://localhost:4321 node scripts/smoke.mjs

const BASE_URL = process.env.BASE_URL ?? "http://localhost:4321";
const CATALOG_SENTENCE = "Wybierz rodzaj karty i wydrukuj ją na kartce A4.";
const HOME_SENTENCE = "Wygeneruj labirynt i wydrukuj go na kartce A4.";
const SYMMETRY_SENTENCE = "Wygeneruj kartę symetrii i wydrukuj ją na kartce A4.";
const SEQUENCE_SENTENCE = "Wygeneruj kartę sekwencji i wydrukuj ją na kartce A4.";
const SUDOKU_SENTENCE = "Wygeneruj kartę sudoku i wydrukuj ją na kartce A4.";
const NONOGRAM_SENTENCE = "Wygeneruj nonogram i wydrukuj go na kartce A4.";
const DICTATION_SENTENCE = "Wygeneruj kartę dyktanda graficznego i wydrukuj ją na kartce A4.";

async function request(path) {
  const response = await fetch(BASE_URL + path, { redirect: "manual" });
  const body = await response.text();
  return { status: response.status, body, location: response.headers.get("location") };
}

function locationPath(location) {
  if (!location) return "";
  const absolute = /^https?:\/\/[^/?#]*/i.exec(location);
  const path = absolute ? location.slice(absolute[0].length) : location;
  const pathname = path.split(/[?#]/, 1)[0];
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
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
    () => request("/maze"),
    (actual) => actual.status === 200 && actual.body.includes(HOME_SENTENCE),
    `200 and ${HOME_SENTENCE}`,
  ],
  [
    "symetria renders the worksheet sentence",
    () => request("/symmetry"),
    (actual) => actual.status === 200 && actual.body.includes(SYMMETRY_SENTENCE),
    `200 and ${SYMMETRY_SENTENCE}`,
  ],
  [
    "sekwencje renders the worksheet sentence",
    () => request("/sequences"),
    (actual) => actual.status === 200 && actual.body.includes(SEQUENCE_SENTENCE),
    `200 and ${SEQUENCE_SENTENCE}`,
  ],
  [
    "sudoku renders the worksheet sentence",
    () => request("/sudoku"),
    (actual) => actual.status === 200 && actual.body.includes(SUDOKU_SENTENCE),
    `200 and ${SUDOKU_SENTENCE}`,
  ],
  [
    "nonogram renders the worksheet sentence",
    () => request("/nonogram"),
    (actual) => actual.status === 200 && actual.body.includes(NONOGRAM_SENTENCE),
    `200 and ${NONOGRAM_SENTENCE}`,
  ],
  [
    "dyktando renders the worksheet sentence",
    () => request("/dictation"),
    (actual) => actual.status === 200 && actual.body.includes(DICTATION_SENTENCE),
    `200 and ${DICTATION_SENTENCE}`,
  ],
  [
    "labirynt redirects to /maze",
    () => request("/labirynt"),
    (actual) => actual.status === 301 && locationPath(actual.location) === "/maze",
    "301 and Location path /maze",
  ],
  [
    "symetria redirects to /symmetry",
    () => request("/symetria"),
    (actual) => actual.status === 301 && locationPath(actual.location) === "/symmetry",
    "301 and Location path /symmetry",
  ],
  [
    "sekwencje redirects to /sequences",
    () => request("/sekwencje"),
    (actual) => actual.status === 301 && locationPath(actual.location) === "/sequences",
    "301 and Location path /sequences",
  ],
  [
    "dyktando redirects to /dictation",
    () => request("/dyktando"),
    (actual) => actual.status === 301 && locationPath(actual.location) === "/dictation",
    "301 and Location path /dictation",
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
