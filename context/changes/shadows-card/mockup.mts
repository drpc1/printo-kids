// Makieta karty „Cienie” (S-47) przed planem, druga wersja (2026-11-20, po uwagach użytkowniczki): zamiast sylwetek
// z kratek katalogu szablonów własne, uproszczone rysunki wektorowe w prawdziwych kolorach (choinka zielona, jabłko
// czerwone). Trudność rośnie z podobieństwa obrazków: łatwy to zupełnie różne rzeczy, średni rzeczy z jednej rodziny
// o podobnym kształcie (owoce), trudny warianty jednej rzeczy różniące się szczegółem obrysu (kubki).
// Cień to ten sam rysunek bez detali (okna, pestki, oczy), cały czarny, w tej samej wielkości.
// Pisze mockup-*.svg i mockups.html do tego folderu.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/shadows-card/mockup.mts
// Drukuj na A4 w 100%. Kółko i dymek u góry zastępują postać przy poleceniu (US-21).
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const PAGE = { w: 210, h: 297, inset: 10, band: 26, bandGap: 8 };
const INSTRUCTION = "Połącz każdy obrazek z jego cieniem.";
const LINE = "#3a3a3a"; // kontur obrazka
const SHADOW = "#111";

/** Jedna część rysunku w polu 100×100. `detail` leży wewnątrz obrysu i cień go pomija. */
interface Shape {
  svg: (fill: string, stroke: string) => string;
  fill: string;
  detail?: boolean;
}
interface Drawing {
  id: string;
  shapes: readonly Shape[];
}

const sw = 'stroke-width="1.6" stroke-linejoin="round"';
const path = (d: string, fill: string, detail = false): Shape => ({
  fill,
  detail,
  svg: (f, s) => `<path d="${d}" fill="${f}" stroke="${s}" ${sw}/>`,
});
const rect = (x: number, y: number, w: number, h: number, fill: string, rx = 0, detail = false): Shape => ({
  fill,
  detail,
  svg: (f, s) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${s}" ${sw}/>`,
});
const circle = (cx: number, cy: number, r: number, fill: string, detail = false): Shape => ({
  fill,
  detail,
  svg: (f, s) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" stroke="${s}" ${sw}/>`,
});
const ellipse = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, detail = false): Shape => ({
  fill,
  detail,
  svg: (f, s) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="${f}" stroke="${s}" ${sw}/>`,
});
/** Ucho kubka: gruby łuk; w cieniu też czarny. */
const handle = (d: string, color: string): Shape => ({
  fill: color,
  svg: (f, s) =>
    `<path d="${d}" fill="none" stroke="${s === "none" ? f : s}" stroke-width="10" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${f}" stroke-width="6.8" stroke-linecap="round"/>`,
});

// Kolory: prawdziwe, ale uproszczone (jedna barwa na część, bez cieniowania).
const C = {
  green: "#3f9a3c",
  darkGreen: "#2e7a30",
  leaf: "#5cae3e",
  brown: "#8a5a32",
  red: "#d63a2f",
  darkRed: "#a52a22",
  yellow: "#f2cf3a",
  orange: "#f08a24",
  pear: "#b9cf45",
  sky: "#bfe3f5",
  wall: "#f3dfb8",
  gray: "#7d7d7d",
  white: "#ffffff",
  cream: "#f6efe0",
  blue: "#3b78c4",
  teal: "#3aa7a0",
};

const LATWY: readonly Drawing[] = [
  {
    id: "choinka",
    shapes: [
      rect(44, 80, 12, 15, C.brown),
      // jeden obrys z trzema piętrami, bez nachodzących trójkątów (uwaga użytkowniczki 2026-11-20)
      path("M50 6 L70 32 L62 32 L80 56 L70 56 L90 82 L10 82 L30 56 L20 56 L38 32 L30 32 Z", C.green),
      circle(40, 52, 3.2, C.red, true),
      circle(60, 70, 3.2, C.yellow, true),
      circle(36, 76, 3.2, C.yellow, true),
    ],
  },
  {
    id: "auto",
    shapes: [
      path("M24 52 L34 32 H66 L78 52 Z", C.blue),
      rect(6, 50, 88, 26, C.blue, 7),
      path("M30 50 L37 36 H48 V50 Z", C.sky, true),
      path("M53 50 V36 H64 L72 50 Z", C.sky, true),
      circle(26, 78, 11, "#2b2b2b"),
      circle(74, 78, 11, "#2b2b2b"),
      circle(26, 78, 4, C.gray, true),
      circle(74, 78, 4, C.gray, true),
    ],
  },
  {
    id: "jablko",
    shapes: [
      rect(47.5, 10, 5, 18, C.brown, 2),
      ellipse(64, 16, 11, 5.5, C.leaf, -25),
      path("M50 30 C32 16 6 28 10 58 C14 86 38 96 50 88 C62 96 86 86 90 58 C94 28 68 16 50 30 Z", C.red),
    ],
  },
  {
    id: "domek",
    shapes: [
      rect(64, 16, 9, 22, C.darkRed),
      rect(18, 46, 64, 48, C.wall),
      path("M8 50 L50 12 L92 50 Z", C.red),
      rect(43, 66, 14, 28, C.brown, 1, true),
      rect(24, 56, 13, 12, C.sky, 0, true),
      rect(63, 56, 13, 12, C.sky, 0, true),
    ],
  },
];

const SREDNI: readonly Drawing[] = [
  LATWY[2],
  {
    id: "gruszka",
    shapes: [
      rect(48, 6, 4, 16, C.brown, 2),
      ellipse(60, 12, 9, 4.5, C.leaf, -25),
      path("M50 20 C40 20 38 34 36 44 C34 54 18 62 20 78 C22 94 40 97 50 96 C60 97 78 94 80 78 C82 62 66 54 64 44 C62 34 60 20 50 20 Z", C.pear),
    ],
  },
  {
    id: "cytryna",
    shapes: [path("M8 54 C8 50 12 48 16 44 C28 24 72 24 84 44 C88 48 92 50 92 54 C92 58 88 60 84 64 C72 84 28 84 16 64 C12 60 8 58 8 54 Z", C.yellow)],
  },
  {
    id: "truskawka",
    shapes: [
      path("M50 26 C64 22 90 28 86 50 C82 72 60 94 50 96 C40 94 18 72 14 50 C10 28 36 22 50 26 Z", C.red),
      path("M50 30 L38 18 L46 22 L50 10 L54 22 L62 18 Z M32 30 L44 26 L56 26 L68 30 L58 34 L50 30 L42 34 Z", C.leaf),
      circle(36, 48, 1.8, C.yellow, true),
      circle(52, 46, 1.8, C.yellow, true),
      circle(66, 50, 1.8, C.yellow, true),
      circle(44, 64, 1.8, C.yellow, true),
      circle(60, 66, 1.8, C.yellow, true),
      circle(52, 80, 1.8, C.yellow, true),
    ],
  },
  {
    id: "pomarancza",
    shapes: [
      rect(48, 10, 4, 10, C.brown, 2),
      ellipse(39, 14, 10, 5, C.leaf, 20),
      circle(50, 58, 38, C.orange),
      circle(50, 24, 2, C.darkGreen, true),
    ],
  },
];

// Kubki: ten sam „rodzaj”, różny szczegół obrysu (ucho, kształt, spodek, dzióbek).
const TRUDNY: readonly Drawing[] = [
  { id: "kubek", shapes: [handle("M74 36 C92 36 92 70 74 70", C.blue), rect(22, 22, 54, 70, C.blue, 4)] },
  {
    id: "kubek-stozek",
    shapes: [handle("M72 34 C90 36 88 66 70 68", C.red), path("M18 22 H82 L72 92 H28 Z", C.red)],
  },
  {
    id: "filizanka",
    shapes: [
      handle("M78 46 C94 46 94 72 74 72", C.cream),
      ellipse(50, 90, 44, 6, C.cream),
      path("M16 40 H84 C84 66 72 86 50 86 C28 86 16 66 16 40 Z", C.cream),
      rect(16, 50, 68, 5, C.blue, 0, true),
    ],
  },
  { id: "szklanka", shapes: [path("M24 18 H76 L70 94 H30 Z", C.sky)] },
  {
    id: "kubek-dwa-uszy",
    shapes: [
      handle("M74 38 C90 38 90 64 74 64", C.green),
      handle("M26 38 C10 38 10 64 26 64", C.green),
      rect(24, 24, 52, 68, C.green, 4),
    ],
  },
  {
    id: "dzbanek",
    shapes: [
      handle("M72 34 C92 36 92 72 70 76", C.teal),
      path("M30 20 H66 C70 40 76 60 72 92 H24 C20 60 28 40 26 30 L12 22 Z", C.teal),
    ],
  },
];

interface LevelMock {
  name: string;
  title: string;
  drawings: readonly Drawing[];
  seed: number;
}
const LEVELS: readonly LevelMock[] = [
  { name: "latwy", title: "łatwy: 4 pary, zupełnie różne rzeczy", drawings: LATWY, seed: 3 },
  { name: "sredni", title: "średni: 5 par z jednej rodziny (owoce), podobne kształty", drawings: SREDNI, seed: 7 },
  { name: "trudny", title: "trudny: 6 par, warianty jednej rzeczy (kubki), różny szczegół obrysu", drawings: TRUDNY, seed: 11 },
];

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
/** Kolejność cieni: żaden cień nie stoi w rzędzie swojego obiektu. */
function derangement(n: number, rand: () => number): number[] {
  for (;;) {
    const p = shuffle([...Array(n).keys()], rand);
    if (p.every((v, i) => v !== i)) return p;
  }
}

function drawingAt(d: Drawing, x: number, y: number, size: number, shadow: boolean): string {
  const k = size / 100;
  const body = d.shapes
    .filter((s) => !(shadow && s.detail))
    .map((s) => (shadow ? s.svg(SHADOW, SHADOW) : s.svg(s.fill, LINE)))
    .join("");
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${k.toFixed(4)})">${body}</g>`;
}

function sheet(level: LevelMock): string {
  const rand = mulberry32(level.seed);
  const pairs = shuffle(level.drawings, rand);
  const n = pairs.length;
  const left = PAGE.inset;
  const width = PAGE.w - 2 * PAGE.inset;
  const top = PAGE.inset + PAGE.band + PAGE.bandGap;
  const rowH = (PAGE.h - PAGE.inset - top) / n;
  const size = Math.min(rowH - 6, 52);
  const leftX = left + 8;
  const rightX = left + width - 8 - size;
  const dotL = leftX + size + 8;
  const dotR = rightX - 8;
  const perm = derangement(n, rand);
  const parts: string[] = [];

  const bandY = PAGE.inset;
  parts.push(`<circle cx="${left + 12}" cy="${bandY + 13}" r="11" fill="#f3c969" stroke="#b8860b" stroke-width="0.4"/>`);
  parts.push(`<text x="${left + 12}" y="${bandY + 15}" ${FONT} font-size="4" text-anchor="middle" fill="#7a5a00">postać</text>`);
  parts.push(`<path d="M ${left + 27} ${bandY + 3} H ${left + width} V ${bandY + 23} H ${left + 27} V ${bandY + 16} L ${left + 23} ${bandY + 13} L ${left + 27} ${bandY + 10} Z" fill="#fff" stroke="#111" stroke-width="0.4" stroke-linejoin="round"/>`);
  parts.push(`<text x="${left + 32}" y="${bandY + 15}" ${FONT} font-size="5.6" fill="#111">${INSTRUCTION}</text>`);

  for (let r = 0; r < n; r++) {
    const cy = top + r * rowH + rowH / 2;
    parts.push(drawingAt(pairs[r], leftX, cy - size / 2, size, false));
    parts.push(drawingAt(pairs[perm[r]], rightX, cy - size / 2, size, true));
    parts.push(`<circle cx="${dotL}" cy="${cy}" r="1.8" fill="${SHADOW}"/><circle cx="${dotR}" cy="${cy}" r="1.8" fill="${SHADOW}"/>`);
  }
  parts.push(`<text x="${PAGE.w - PAGE.inset}" y="${PAGE.h - 4}" ${FONT} font-size="3" text-anchor="end" fill="#999">makieta S-47 v2 · ${level.title} · obrazek ${size.toFixed(0)} mm</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${PAGE.w} ${PAGE.h}"><rect width="${PAGE.w}" height="${PAGE.h}" fill="#fff"/>${parts.join("")}</svg>`;
}

for (const level of LEVELS) writeFileSync(resolve(OUT, `mockup-${level.name}.svg`), sheet(level));

const html = `<!doctype html><meta charset="utf-8"><title>S-47 makiety</title>
<style>body{font:14px Arial;margin:16px;background:#eee}figure{display:inline-block;margin:8px;vertical-align:top}img{width:420px;background:#fff;box-shadow:0 1px 4px #0003}figcaption{margin-top:4px;max-width:420px}</style>
${LEVELS.map((l) => `<figure><img src="mockup-${l.name}.svg"><figcaption>${l.title}</figcaption></figure>`).join("\n")}`;
writeFileSync(resolve(OUT, "mockups.html"), html);
console.log(`wrote ${LEVELS.length} SVG + mockups.html`);
