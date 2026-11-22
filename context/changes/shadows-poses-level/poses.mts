// Makieta póz do nowego, najtrudniejszego poziomu karty „Cienie” (GitHub 452), do akceptacji użytkowniczki.
// Każda rodzina to jedna rzecz z trzema szczegółami obrysu, każdy w dwóch stanach (2 × 2 × 2 = 8 póz); dwie pozy
// różnią się co najmniej jednym szczegółem. Każdy szczegół zmienia się tylko po jednej stronie rzeczy, więc żadna poza
// nie jest lustrzanym odbiciem innej. Nie jest kodem produktu.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/shadows-poses-level/poses.mts
// Pisze poses.svg (katalog póz z cieniami i najmniejszą różnicą cieni), card-<rodzina>.svg i poses.html.
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { circle, ellipse, path, stroke, type ShadowPicture, type ShadowShape } from "../../../src/lib/shadows/picture-format.ts";
import { shadowDifference, shadowMask } from "../../../src/lib/shadows/raster.ts";
import { pictureAt } from "./render.mts";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';

interface PoseFamily {
  id: string;
  label: string;
  /** Names of the three details, each [state false, state true]. */
  details: readonly [string, string, string];
  states: readonly [readonly [string, string], readonly [string, string], readonly [string, string]];
  draw: (a: boolean, b: boolean, c: boolean) => ShadowShape[];
}

const FAMILIES: readonly PoseFamily[] = [
  {
    id: "kot",
    label: "kot",
    details: ["ogon", "prawe ucho", "lewa łapka"],
    states: [
      ["w górze", "przy ziemi"],
      ["postawione", "zgięte"],
      ["na dole", "w górze"],
    ],
    draw: (tailLow, earFolded, pawUp) => [
      tailLow ? stroke("M66 90 C80 93 90 92 96 84", 8, "orange") : stroke("M68 88 C88 88 94 70 86 58", 8, "orange"),
      ...(pawUp ? [stroke("M42 62 C32 56 26 48 22 36", 9, "orange"), circle(22, 35, 5, "orange")] : []),
      ellipse(29, 92, 8, 4.5, "orange"),
      ellipse(71, 92, 8, 4.5, "orange"),
      path("M30 94 C26 76 32 60 42 54 H58 C68 60 74 76 70 94 Z", "orange"),
      ...(pawUp ? [] : [stroke("M44 64 L43 90", 7, "orange"), ellipse(43, 93, 6, 4, "orange")]),
      stroke("M56 64 L57 90", 7, "orange"),
      ellipse(57, 93, 6, 4, "orange"),
      path("M32 32 L30 10 L46 22 Z", "orange"),
      earFolded ? path("M66 33 L84 30 L58 22 Z", "orange") : path("M68 32 L70 10 L54 22 Z", "orange"),
      circle(50, 38, 20, "orange"),
      path("M34 27 L33 15 L42 22 Z", "pink", true),
      ...(earFolded ? [] : [path("M66 27 L67 15 L58 22 Z", "pink", true)]),
      ellipse(50, 74, 5, 9, "cream", 0, true),
      ellipse(42, 36, 3, 4, "black", 0, true),
      ellipse(58, 36, 3, 4, "black", 0, true),
      path("M47 43 H53 L50 47 Z", "pink", true),
      stroke("M35 45 L44 47 M35 51 L44 49 M65 45 L56 47 M65 51 L56 49", 1.2, "black", true),
    ],
  },
  {
    id: "pies",
    label: "pies",
    details: ["ogon", "prawe ucho", "prawa łapka"],
    states: [
      ["w górze", "w dół"],
      ["oklapnięte", "uniesione"],
      ["na dole", "w górze"],
    ],
    draw: (tailDown, earUp, pawUp) => [
      tailDown ? stroke("M32 90 C20 92 10 92 4 86", 7, "sand") : stroke("M32 88 C14 86 10 72 16 62", 7, "sand"),
      ...(pawUp ? [stroke("M58 62 C68 56 74 48 78 36", 8, "sand"), circle(78, 35, 5, "sand")] : []),
      ellipse(29, 92, 8, 4.5, "sand"),
      ellipse(71, 92, 8, 4.5, "sand"),
      path("M30 94 C26 76 32 60 42 54 H58 C68 60 74 76 70 94 Z", "sand"),
      stroke("M44 64 L43 90", 7, "sand"),
      ellipse(43, 93, 6, 4, "sand"),
      ...(pawUp ? [] : [stroke("M56 64 L57 90", 7, "sand"), ellipse(57, 93, 6, 4, "sand")]),
      circle(50, 38, 18, "sand"),
      ellipse(31, 40, 7, 15, "brown", 15),
      earUp ? ellipse(74, 22, 6.5, 14, "brown", 55) : ellipse(69, 40, 7, 15, "brown", -15),
      ellipse(35, 74, 4, 6, "brown", 0, true),
      ellipse(50, 46, 8, 6, "cream", 0, true),
      ellipse(50, 43, 3.5, 2.5, "black", 0, true),
      circle(43, 34, 2.6, "black", true),
      circle(57, 34, 2.6, "black", true),
    ],
  },
  {
    id: "krolik",
    label: "królik",
    details: ["prawe ucho", "lewe ucho", "lewa stopa"],
    states: [
      ["prosto", "oklapnięte"],
      ["prosto", "zgięty czubek"],
      ["pod spodem", "w bok"],
    ],
    draw: (earFlop, tipBent, footOut) => [
      ...(tipBent ? [ellipse(43, 31, 7, 11, "white", -10), ellipse(36, 18, 6, 10, "white", -60)] : [ellipse(41, 22, 7, 19, "white", -10)]),
      earFlop ? ellipse(70, 30, 7, 19, "white", 65) : ellipse(59, 22, 7, 19, "white", 10),
      ellipse(50, 74, 22, 19, "white"),
      footOut ? ellipse(22, 86, 10, 5, "white", -25) : ellipse(37, 92, 10, 5, "white"),
      ellipse(63, 92, 10, 5, "white"),
      circle(50, 48, 17, "white"),
      tipBent ? ellipse(43, 32, 3.2, 7, "pink", -10, true) : ellipse(41, 23, 3.2, 13, "pink", -10, true),
      earFlop ? ellipse(70, 30, 3.2, 13, "pink", 65, true) : ellipse(59, 23, 3.2, 13, "pink", 10, true),
      ellipse(50, 80, 10, 9, "cream", 0, true),
      stroke("M37 68 A5 7 0 1 0 47 68 A5 7 0 1 0 37 68 M53 68 A5 7 0 1 0 63 68 A5 7 0 1 0 53 68", 1.4, "black", true),
      circle(43, 46, 2.6, "black", true),
      circle(57, 46, 2.6, "black", true),
      path("M47 52 H53 L50 55 Z", "pink", true),
      stroke("M38 54 L45 55 M62 54 L55 55", 1.2, "black", true),
    ],
  },
  {
    id: "ptak",
    label: "ptak",
    details: ["dziób", "skrzydło", "ogon"],
    states: [
      ["zamknięty", "otwarty"],
      ["złożone", "uniesione"],
      ["w górę", "w dół"],
    ],
    draw: (beakOpen, wingUp, tailDown) => [
      stroke("M44 76 L42 92 M54 76 L56 92", 3, "darkgray"),
      tailDown ? path("M70 60 L90 86 L97 66 Z", "sand") : path("M70 52 L96 36 L92 60 Z", "sand"),
      ...(wingUp ? [path("M44 50 C40 34 50 20 66 14 C66 22 72 22 74 28 C70 34 72 40 66 46 C60 52 50 54 44 50 Z", "brown")] : []),
      ellipse(50, 58, 28, 20, "sand"),
      circle(28, 42, 14, "sand"),
      beakOpen ? path("M15 37 L2 31 L15 43 Z M15 45 L3 54 L15 49 Z", "orange") : path("M15 40 L4 44 L15 47 Z", "orange"),
      ...(wingUp ? [] : [path("M44 56 C52 46 66 48 74 58 C64 66 52 66 44 56 Z", "brown", true)]),
      circle(26, 39, 2, "black", true),
    ],
  },
  {
    id: "mis",
    label: "miś",
    details: ["prawa łapa", "lewa łapa", "prawa noga"],
    states: [
      ["na dole", "w górze"],
      ["na dole", "w bok"],
      ["stoi", "uniesiona"],
    ],
    draw: (rightUp, leftOut, legUp) => [
      circle(32, 20, 9, "brown"),
      circle(68, 20, 9, "brown"),
      leftOut ? ellipse(21, 55, 13, 7, "brown", -10) : ellipse(26, 60, 8, 14, "brown", 30),
      rightUp ? ellipse(78, 38, 7, 15, "brown", 25) : ellipse(74, 60, 8, 14, "brown", -30),
      ellipse(36, 86, 11, 9, "brown"),
      legUp ? ellipse(73, 78, 11, 9, "brown", -35) : ellipse(64, 86, 11, 9, "brown"),
      ellipse(50, 66, 22, 24, "brown"),
      circle(50, 36, 20, "brown"),
      circle(32, 20, 4.5, "sand", true),
      circle(68, 20, 4.5, "sand", true),
      ellipse(50, 71, 11, 12, "sand", 0, true),
      ellipse(36, 88, 5.5, 4.5, "sand", 0, true),
      legUp ? ellipse(75, 79, 5.5, 4.5, "sand", -35, true) : ellipse(64, 88, 5.5, 4.5, "sand", 0, true),
      ellipse(50, 44, 9, 7, "sand", 0, true),
      ellipse(50, 41.5, 3.5, 2.5, "black", 0, true),
      stroke("M46 47 C48 49 52 49 54 47", 1.2, "black", true),
      circle(42, 32, 2.6, "black", true),
      circle(58, 32, 2.6, "black", true),
    ],
  },
];

const BITS = [0, 1, 2, 3, 4, 5, 6, 7].map((n) => [(n & 4) > 0, (n & 2) > 0, (n & 1) > 0] as const);

function poses(family: PoseFamily): ShadowPicture[] {
  return BITS.map(([a, b, c]) => ({
    id: `${family.id}-${+a}${+b}${+c}`,
    label: [a, b, c].map((bit, k) => family.states[k][+bit]).join(", "),
    shapes: family.draw(a, b, c),
  }));
}

const CELL_W = 160;
const PIC = 70;
const rowH = PIC + 66;
const width = 30 + 8 * CELL_W;
const lines: string[] = [];
const parts: string[] = [
  `<text x="20" y="34" ${FONT} font-size="22" font-weight="bold">Cienie, nowy poziom: jedna rzecz w ośmiu pozach (obrazek i cień)</text>`,
];
FAMILIES.forEach((family, r) => {
  const top = 60 + r * rowH;
  const pictures = poses(family);
  const masks = pictures.map((picture) => shadowMask(picture));
  let min = 1;
  let minPair = "";
  const diffs: number[] = [];
  for (let i = 0; i < masks.length; i++) {
    for (let j = i + 1; j < masks.length; j++) {
      const d = shadowDifference(masks[i], masks[j]);
      diffs.push(d);
      if (d < min) {
        min = d;
        minPair = `${pictures[i].label} | ${pictures[j].label}`;
      }
    }
  }
  const single = [0, 1, 2].map((k) => {
    const d = shadowDifference(masks[0], masks[1 << (2 - k)]);
    return `${family.details[k]} ${d.toFixed(3)}`;
  });
  lines.push(`${family.label}: najmniejsza różnica ${min.toFixed(3)} (${minPair}); jeden szczegół od pozy bazowej: ${single.join(", ")}`);
  parts.push(
    `<text x="20" y="${top + 14}" ${FONT} font-size="15" font-weight="bold" fill="#555">${family.label} — szczegóły: ${family.details.join(", ")}; najmniejsza różnica cieni ${min.toFixed(3)} (próg dziś 0,08)</text>`,
  );
  pictures.forEach((picture, c) => {
    const x = 20 + c * CELL_W;
    parts.push(pictureAt(picture, x, top + 22, PIC, false), pictureAt(picture, x + PIC + 4, top + 22, PIC, true));
    picture.label.split(", ").forEach((text, k) => {
      parts.push(`<text x="${x + PIC}" y="${top + PIC + 36 + k * 13}" ${FONT} font-size="11" text-anchor="middle">${text}</text>`);
    });
  });
});
const height = 60 + FAMILIES.length * rowH;
const catalog = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#fff"/>${parts.join("")}</svg>`;
writeFileSync(resolve(OUT, "poses.svg"), catalog);

/** A4 card in mm: six poses of one family on the left, their shadows shuffled on the right. */
function card(family: PoseFamily, seed: number): string {
  let s = seed;
  const rnd = (): number => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const all = poses(family);
  const chosen = all.map((p) => ({ p, k: rnd() })).sort((x, y) => x.k - y.k).slice(0, 6).map((x) => x.p);
  let order: number[] = [];
  do {
    order = chosen.map((_, i) => ({ i, k: rnd() })).sort((x, y) => x.k - y.k).map((x) => x.i);
  } while (order.some((v, i) => v === i));
  const pic = 38;
  const top = 42;
  const rowMm = (287 - top) / 6;
  const out: string[] = [
    `<rect x="0" y="0" width="210" height="297" fill="#fff"/>`,
    `<text x="105" y="26" ${FONT} font-size="7" text-anchor="middle">Połącz każdy obrazek z jego cieniem.</text>`,
  ];
  chosen.forEach((picture, i) => {
    const y = top + i * rowMm + (rowMm - pic) / 2;
    out.push(pictureAt(picture, 22, y, pic, false), `<circle cx="70" cy="${y + pic / 2}" r="2" fill="#111"/>`);
    out.push(pictureAt(chosen[order[i]], 150, y, pic, true), `<circle cx="140" cy="${y + pic / 2}" r="2" fill="#111"/>`);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">${out.join("")}</svg>`;
}
FAMILIES.forEach((family, i) => writeFileSync(resolve(OUT, `card-${family.id}.svg`), card(family, 7 + i * 31)));

const html = `<!doctype html><meta charset="utf-8"><title>Cienie — pozy (GitHub 452)</title>
<style>body{font-family:Arial,sans-serif;margin:20px}img{border:1px solid #ccc;margin:8px;vertical-align:top}.card{width:360px}</style>
<h1>Cienie — nowy poziom z pozami (GitHub 452)</h1><pre>${lines.join("\n")}</pre>
<img src="poses.svg" style="max-width:100%"><h2>Przykładowe karty (6 par, pole obrazka 38 mm)</h2>
${FAMILIES.map((f) => `<img class="card" src="card-${f.id}.svg" alt="${f.label}">`).join("")}`;
writeFileSync(resolve(OUT, "poses.html"), html);
console.log(lines.join("\n"));
