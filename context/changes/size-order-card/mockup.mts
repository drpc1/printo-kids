// Makieta karty „Od najmniejszego” (S-48) przed planem. Pisze pliki SVG A4 i mockups.html do tego folderu
// z prawdziwych ikon karty „Który nie pasuje” (src/lib/odd-one-out/icons.ts) i kształtów sudoku (sudokuShapePath),
// wymieszanych na karcie (decyzja użytkowniczki 2026-11-18).
// W rzędzie stoi ta sama sylwetka w kilku wielkościach; wielkość to wysokość obrysu (skala jednolita, więc proporcje
// się nie zmieniają). Obrazki stoją na wspólnej linii dolnej, pod każdym jest pusta kratka na numer.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/size-order-card/mockup.mts
// Pliki *-kolory: każdy rząd ma jedną kredkę (ikona wypełniona, kształt wypełniony), więc kolor nie zdradza wielkości.
// Drukuj na A4 w 100%. Kółko i dymek u góry zastępują postać przy poleceniu (US-21).
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ICONS, type Icon, type IconFigure } from "../../../src/lib/odd-one-out/icons.ts";
import { SUDOKU_SHAPES, sudokuShapePath, type SudokuShapeId } from "../../../src/lib/sudoku/shapes.ts";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const PAGE = { w: 210, h: 297, inset: 10, band: 26, bandGap: 8 };
const BOX = 13; // kratka na numer, mm
const BOX_GAP = 4; // od linii dolnej obrazków do kratki

interface LevelMock {
  file: string;
  title: string;
  /** Wysokości obrazków od najmniejszego, jako ułamek najwyższego. Sąsiednie różnią się co najmniej `minStep`. */
  heights: readonly number[];
  rows: number;
  /** Kolory: każdy rząd ma jedną kredkę dla wszystkich obrazków, więc kolor nie zdradza wielkości. */
  colors: boolean;
  seed: number;
}

// Dziecko, które nie pisze jeszcze cyfr, rysuje tyle kropek albo kresek; bez klucza i bez przełącznika (decyzja 2026-11-18).
const INSTRUCTION = "Od najmniejszego: wpisz 1, 2, 3… albo narysuj kropki.";

// Kredki z global.css (--symmetry-*), te same co „Który nie pasuje” (bez szarej i czarnej).
const CRAYONS = [
  "oklch(0.58 0.21 27)",
  "oklch(0.55 0.18 255)",
  "oklch(0.62 0.17 145)",
  "oklch(0.7 0.18 50)",
  "oklch(0.48 0.17 305)",
  "oklch(0.8 0.16 85)",
  "oklch(0.42 0.07 55)",
];

const BASE = [
  { name: "latwy", title: "łatwy: 3 obrazki", heights: [0.48, 0.74, 1], rows: 4, seed: 11 },
  { name: "sredni", title: "średni: 4 obrazki", heights: [0.5, 0.63, 0.79, 1], rows: 4, seed: 23 },
  { name: "trudny", title: "trudny: 5 obrazków", heights: [0.55, 0.65, 0.76, 0.87, 1], rows: 5, seed: 37 },
];
const LEVELS: readonly LevelMock[] = BASE.flatMap((b) => [
  { ...b, file: `mockup-${b.name}.svg`, colors: false },
  { ...b, file: `mockup-${b.name}-kolory.svg`, title: `${b.title}, kolory`, colors: true },
]);


function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
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

/** Kolejność wielkości w rzędzie: nie rosnąca i nie malejąca, żeby rząd nie był już ułożony. */
function order(n: number, rand: () => number): number[] {
  const sorted = [...Array(n).keys()];
  for (;;) {
    const candidate = shuffle(sorted, rand);
    const asc = candidate.every((v, i) => v === i);
    const desc = candidate.every((v, i) => v === n - 1 - i);
    if (!asc && !desc) return candidate;
  }
}

// --- obrys ikony (do wysokości i linii dolnej) ---
type Bounds = { x0: number; y0: number; x1: number; y1: number };

function pathPoints(d: string): [number, number][] {
  const tokens = d.match(/[MLQCAZ]|-?\d*\.?\d+/gi) ?? [];
  const points: [number, number][] = [];
  let command = "";
  let numbers: number[] = [];
  const flush = () => {
    if (command === "A") {
      for (let i = 0; i + 6 < numbers.length; i += 7) points.push([numbers[i + 5], numbers[i + 6]]);
    } else {
      for (let i = 0; i + 1 < numbers.length; i += 2) points.push([numbers[i], numbers[i + 1]]);
    }
    numbers = [];
  };
  for (const token of tokens) {
    if (/[A-Z]/i.test(token)) {
      flush();
      command = token.toUpperCase();
    } else numbers.push(Number(token));
  }
  flush();
  return points;
}

function iconBounds(icon: Icon): Bounds {
  const b: Bounds = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const add = (x: number, y: number) => {
    b.x0 = Math.min(b.x0, x);
    b.y0 = Math.min(b.y0, y);
    b.x1 = Math.max(b.x1, x);
    b.y1 = Math.max(b.y1, y);
  };
  for (const f of icon.figures) {
    if (f.tone !== "ink") continue;
    if (f.kind === "circle") (add(f.cx - f.r, f.cy - f.r), add(f.cx + f.r, f.cy + f.r));
    else if (f.kind === "ellipse") {
      const r = Math.max(f.rx, f.ry);
      const [rx, ry] = f.rotate ? [r, r] : [f.rx, f.ry];
      add(f.cx - rx, f.cy - ry);
      add(f.cx + rx, f.cy + ry);
    } else if (f.kind === "rect") (add(f.x, f.y), add(f.x + f.width, f.y + f.height));
    else if (f.kind === "polygon") f.points.forEach(([x, y]) => add(x, y));
    else if (f.kind === "line") (add(f.x1, f.y1), add(f.x2, f.y2));
    else {
      const half = (f.strokeWidth ?? 0) / 2;
      pathPoints(f.d).forEach(([x, y]) => (add(x - half, y - half), add(x + half, y + half)));
    }
  }
  return b;
}

function figureSvg(f: IconFigure, ink: string): string {
  const fill = f.tone === "ink" ? ink : "#fff";
  switch (f.kind) {
    case "circle":
      return `<circle cx="${f.cx}" cy="${f.cy}" r="${f.r}" fill="${fill}"/>`;
    case "ellipse":
      return `<ellipse cx="${f.cx}" cy="${f.cy}" rx="${f.rx}" ry="${f.ry}" fill="${fill}"${f.rotate === undefined ? "" : ` transform="rotate(${f.rotate} ${f.cx} ${f.cy})"`}/>`;
    case "rect":
      return `<rect x="${f.x}" y="${f.y}" width="${f.width}" height="${f.height}" rx="${f.rx ?? 0}" fill="${fill}"${f.rotate === undefined ? "" : ` transform="rotate(${f.rotate} ${f.x + f.width / 2} ${f.y + f.height / 2})"`}/>`;
    case "polygon":
      return `<polygon points="${f.points.map((p) => p.join(",")).join(" ")}" fill="${fill}"/>`;
    case "line":
      return `<line x1="${f.x1}" y1="${f.y1}" x2="${f.x2}" y2="${f.y2}" stroke="${fill}" stroke-width="${f.strokeWidth}" stroke-linecap="round"/>`;
    case "path":
      return f.strokeWidth === undefined
        ? `<path d="${f.d}" fill="${fill}"/>`
        : `<path d="${f.d}" fill="none" stroke="${fill}" stroke-width="${f.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
}

/** Ikona tak wysoka jak `height`, wyśrodkowana na `cx`, stojąca na `baseline`. */
function iconAt(icon: Icon, cx: number, baseline: number, height: number, ink: string): string {
  const b = iconBounds(icon);
  const k = height / (b.y1 - b.y0);
  const tx = cx - ((b.x0 + b.x1) / 2) * k;
  const ty = baseline - b.y1 * k;
  return `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(4)})">${icon.figures.map((f) => figureSvg(f, ink)).join("")}</g>`;
}

/** Kształt sudoku: bez kolorów czarny kontur, z kolorami wypełniony kredką (jak sudoku z kolorami). */
function shapeAt(id: SudokuShapeId, cx: number, baseline: number, height: number, color: string | null): string {
  const stroke = 1; // stała grubość, żeby kreska nie była drugą wskazówką wielkości
  return `<path d="${sudokuShapePath(id, cx, baseline - height / 2, height - stroke)}" fill="${color ?? "none"}" stroke="${color ?? "#111"}" stroke-width="${stroke}" stroke-linejoin="round"/>`;
}

type Picture = { kind: "icon"; icon: Icon } | { kind: "shape"; id: SudokuShapeId };
const POOL: readonly Picture[] = [
  ...ICONS.map((icon): Picture => ({ kind: "icon", icon })),
  ...SUDOKU_SHAPES.map((id): Picture => ({ kind: "shape", id })),
];

/** Obrazki rzędów: bez powtórek na karcie, co najmniej jedna ikona i co najmniej jeden kształt. */
function pictures(rows: number, rand: () => number): Picture[] {
  for (;;) {
    const pick = shuffle(POOL, rand).slice(0, rows);
    if (pick.some((p) => p.kind === "icon") && pick.some((p) => p.kind === "shape")) return pick;
  }
}

function sheet(level: LevelMock): string {
  const rand = mulberry32(level.seed);
  const n = level.heights.length;
  const left = PAGE.inset;
  const width = PAGE.w - 2 * PAGE.inset;
  const top = PAGE.inset + PAGE.band + PAGE.bandGap;
  const rowsHeight = PAGE.h - PAGE.inset - top;
  const rowH = rowsHeight / level.rows;
  const slotW = width / n;
  const ROW_PAD = 4; // od dołu rzędu do kratki i od góry rzędu do najwyższego obrazka
  const tallest = rowH - BOX - BOX_GAP - 2 * ROW_PAD;
  const rowPictures = pictures(level.rows, rand);
  const crayons = shuffle(CRAYONS, rand);
  const parts: string[] = [];

  // pas polecenia: postać (kółko) i dymek
  const bandY = PAGE.inset;
  parts.push(`<circle cx="${left + 12}" cy="${bandY + 13}" r="11" fill="#f3c969" stroke="#b8860b" stroke-width="0.4"/>`);
  parts.push(`<text x="${left + 12}" y="${bandY + 15}" ${FONT} font-size="4" text-anchor="middle" fill="#7a5a00">postać</text>`);
  parts.push(`<path d="M ${left + 27} ${bandY + 3} H ${left + width} V ${bandY + 23} H ${left + 27} V ${bandY + 16} L ${left + 23} ${bandY + 13} L ${left + 27} ${bandY + 10} Z" fill="#fff" stroke="#111" stroke-width="0.4" stroke-linejoin="round"/>`);
  parts.push(`<text x="${left + 32}" y="${bandY + 15}" ${FONT} font-size="5.6" fill="#111">${INSTRUCTION}</text>`);

  for (let r = 0; r < level.rows; r++) {
    const rowTop = top + r * rowH;
    const boxY = rowTop + rowH - BOX - ROW_PAD;
    const baseline = boxY - BOX_GAP;
    const sizes = order(n, rand);
    if (r > 0) parts.push(`<line x1="${left}" y1="${rowTop}" x2="${left + width}" y2="${rowTop}" stroke="#ccc" stroke-width="0.25" stroke-dasharray="1.5 1.5"/>`);
    const picture = rowPictures[r];
    const color = level.colors ? crayons[r % crayons.length] : null;
    // szeroka sylwetka (żółw, auto) zmniejsza cały rząd, żeby największy obrazek zmieścił się w szerokości pola
    const b = picture.kind === "icon" ? iconBounds(picture.icon) : null;
    const aspect = b ? (b.x1 - b.x0) / (b.y1 - b.y0) : 1;
    const rowTallest = Math.min(tallest, (slotW * 0.85) / aspect);
    sizes.forEach((sizeIndex, slot) => {
      const cx = left + slotW * (slot + 0.5);
      const h = level.heights[sizeIndex] * rowTallest;
      parts.push(picture.kind === "icon" ? iconAt(picture.icon, cx, baseline, h, color ?? "#111") : shapeAt(picture.id, cx, baseline, h, color));
      const boxW = Math.min(30, slotW - 6); // szerokie pole: cyfra albo do pięciu kropek
      parts.push(`<rect x="${(cx - boxW / 2).toFixed(2)}" y="${boxY.toFixed(2)}" width="${boxW}" height="${BOX}" rx="1" fill="#fff" stroke="#111" stroke-width="0.5"/>`);
    });
  }

  parts.push(`<text x="${PAGE.w - PAGE.inset}" y="${PAGE.h - 4}" ${FONT} font-size="3" text-anchor="end" fill="#999">makieta S-48 · ${level.title} · najwyższy do ${tallest.toFixed(0)} mm, najmniejszy krok ${minStep(level.heights)}</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${PAGE.w} ${PAGE.h}"><rect width="${PAGE.w}" height="${PAGE.h}" fill="#fff"/>${parts.join("")}</svg>`;
}

function minStep(heights: readonly number[]): string {
  let min = Infinity;
  for (let i = 1; i < heights.length; i++) min = Math.min(min, heights[i] / heights[i - 1]);
  return `×${min.toFixed(2)}`;
}

for (const level of LEVELS) writeFileSync(resolve(OUT, level.file), sheet(level));

const html = `<!doctype html><meta charset="utf-8"><title>S-48 makiety</title>
<style>body{font:14px Arial;margin:16px;background:#eee}figure{display:inline-block;margin:8px;vertical-align:top}img{width:420px;background:#fff;box-shadow:0 1px 4px #0003}figcaption{margin-top:4px}</style>
${LEVELS.map((l) => `<figure><img src="${l.file}"><figcaption>${l.title}</figcaption></figure>`).join("\n")}`;
writeFileSync(resolve(OUT, "mockups.html"), html);
console.log(`wrote ${LEVELS.length} SVG + mockups.html`);
