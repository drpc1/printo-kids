// Makieta karty „Cienie” (S-47) przed planem. Bierze prawdziwe szablony katalogu (src/lib/symmetry/), całą sylwetkę
// (połowa + odbicie, jak nonogram i „Skopiuj obrazek”) i jej kolory kredek, a cień to ta sama sylwetka z wypełnionymi
// dziurami, cała czarna. Sprawdza regułę różnych cieni: na jednej karcie żadne dwa cienie nie są takie same.
// Pisze mockup-*.svg, mockups.html i stats.md do tego folderu.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/shadows-card/mockup.mts
// Drukuj na A4 w 100%. Kółko i dymek u góry zastępują postać przy poleceniu (US-21).
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { composeCopyDrawingCard } from "../../../src/lib/copy-drawing/generate.ts";
import { copyDrawingCellColors } from "../../../src/lib/copy-drawing/colors.ts";
import { COPY_DRAWING_LEVELS, type CopyDrawingLevel } from "../../../src/lib/copy-drawing/levels.ts";
import {
  OBJECT_CATEGORY_CHOICES,
  symmetryTemplatesFor,
  type ObjectCategoryChoiceId,
  type SymmetryColor,
  type SymmetryTemplate,
} from "../../../src/lib/symmetry/templates.ts";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const PAGE = { w: 210, h: 297, inset: 10, band: 26, bandGap: 8 };
const INSTRUCTION = "Połącz każdy obrazek z jego cieniem.";

// Kredki z global.css (--symmetry-*) przybliżone hexem, bo poza stroną nie ma tokenów, a konwerter PNG nie zna oklch.
const CRAYON: Record<SymmetryColor, string> = {
  red: "#d2312f",
  green: "#3fa548",
  yellow: "#e6b422",
  blue: "#2f6fd0",
  orange: "#ef7a2a",
  gray: "#8a8a8a",
  black: "#1b1b1b",
  brown: "#6e4a2e",
};
const INK = "#111";

type Grid<T> = readonly (readonly T[])[];

interface Picture {
  template: SymmetryTemplate;
  variants: number[];
  colors: (SymmetryColor | null)[][];
  pattern: Grid<boolean>;
  shadow: boolean[][];
  shadowKey: string;
}

interface LevelMock {
  name: string;
  title: string;
  size: CopyDrawingLevel;
  pairs: number;
  /** Ile par to pułapki: dwa warianty jednego obiektu o różnych cieniach. */
  traps: number;
  seed: number;
}

const SIZE = Object.fromEntries(COPY_DRAWING_LEVELS.map((l) => [l.id, l])) as Record<string, CopyDrawingLevel>;
const LEVELS: readonly LevelMock[] = [
  { name: "latwy", title: "łatwy: 4 pary, siatka 8×12, różne obiekty", size: SIZE.latwy, pairs: 4, traps: 0, seed: 5 },
  { name: "sredni", title: "średni: 5 par, siatka 12×15, różne obiekty", size: SIZE.sredni, pairs: 5, traps: 0, seed: 17 },
  { name: "trudny", title: "trudny: 6 par, siatka 18×24, 2 pułapki (dwa warianty jednego obiektu)", size: SIZE.trudny, pairs: 6, traps: 2, seed: 29 },
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
const pick = (rand: () => number, n: number): number => Math.min(n - 1, Math.floor(rand() * n));
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

/** Sylwetka z wypełnionymi dziurami: wszystko, czego zalanie z brzegu po pustych kratkach nie dosięga. */
function shadowOf(filled: Grid<boolean>): boolean[][] {
  const rows = filled.length;
  const cols = filled[0].length;
  const outside = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const queue: [number, number][] = [];
  const visit = (r: number, c: number): void => {
    if (r < 0 || r >= rows || c < 0 || c >= cols || filled[r][c] || outside[r][c]) return;
    outside[r][c] = true;
    queue.push([r, c]);
  };
  for (let r = 0; r < rows; r++) [0, cols - 1].forEach((c) => visit(r, c));
  for (let c = 0; c < cols; c++) [0, rows - 1].forEach((r) => visit(r, c));
  while (queue.length > 0) {
    const [r, c] = queue.pop()!;
    visit(r + 1, c);
    visit(r - 1, c);
    visit(r, c + 1);
    visit(r, c - 1);
  }
  return outside.map((row) => row.map((o) => !o));
}

/** Klucz cienia przycięty do obrysu, więc ten sam kształt przesunięty o kratkę też jest tym samym cieniem. */
function cropKey(grid: Grid<boolean>): string {
  const rows = grid.map((row, r) => (row.some(Boolean) ? r : -1)).filter((r) => r >= 0);
  const cols = grid[0].map((_, c) => (grid.some((row) => row[c]) ? c : -1)).filter((c) => c >= 0);
  const [r0, r1, c0, c1] = [rows[0], rows.at(-1)!, cols[0], cols.at(-1)!];
  return grid
    .slice(r0, r1 + 1)
    .map((row) => row.slice(c0, c1 + 1).map((v) => (v ? "#" : ".")).join(""))
    .join("/");
}

function allVariants(template: SymmetryTemplate): number[][] {
  return template.parts.reduce<number[][]>(
    (acc, part) => acc.flatMap((prefix) => part.variants.map((_, i) => [...prefix, i])),
    [[]],
  );
}

function picture(template: SymmetryTemplate, variants: number[], level: CopyDrawingLevel): Picture {
  const card = composeCopyDrawingCard(template, variants, level);
  const colors = copyDrawingCellColors(card)!;
  const shadow = shadowOf(card.pattern);
  return { template, variants, colors, pattern: card.pattern, shadow, shadowKey: cropKey(shadow) };
}

/**
 * Pary karty: `traps` par to dwa warianty jednego obiektu o różnych cieniach (bez pułapek, gdy żaden obiekt kategorii
 * nie ma dwóch cieni, jak „Kształty”), reszta to różne obiekty. Gdy obiektów w kategorii jest mniej niż par, brakujące
 * pary to inne warianty tych samych obiektów (decyzja 2026-11-20). Wszystkie cienie karty są różne.
 */
function drawPairs(level: LevelMock, category: ObjectCategoryChoiceId, rand: () => number): Picture[] | null {
  const templates = symmetryTemplatesFor(level.size.size.templateLevel, category);
  for (let attempt = 0; attempt < 200; attempt++) {
    const chosen: Picture[] = [];
    const used = new Set<string>();
    const order = shuffle(templates, rand);
    if (level.traps > 0) {
      const trapTemplate = order.find((t) => distinctShadows(t, level.size).length >= level.traps);
      if (trapTemplate) {
        chosen.push(...shuffle(distinctShadows(trapTemplate, level.size), rand).slice(0, level.traps));
        used.add(trapTemplate.id);
      }
    }
    for (const t of order) {
      if (chosen.length >= level.pairs) break;
      if (used.has(t.id)) continue;
      const all = allVariants(t);
      const p = picture(t, all[pick(rand, all.length)], level.size);
      if (chosen.some((c) => c.shadowKey === p.shadowKey)) continue;
      chosen.push(p);
      used.add(t.id);
    }
    for (const t of order) {
      for (const p of shuffle(distinctShadows(t, level.size), rand)) {
        if (chosen.length < level.pairs && !chosen.some((c) => c.shadowKey === p.shadowKey)) chosen.push(p);
      }
    }
    if (chosen.length === level.pairs) return shuffle(chosen, rand);
  }
  return null;
}

/** Po jednym wariancie na każdy różny cień obiektu. */
function distinctShadows(template: SymmetryTemplate, level: CopyDrawingLevel): Picture[] {
  const seen = new Map<string, Picture>();
  for (const v of allVariants(template)) {
    const p = picture(template, v, level);
    if (!seen.has(p.shadowKey)) seen.set(p.shadowKey, p);
  }
  return [...seen.values()];
}

/** Kratki obrazka przycięte do obrysu i wpisane w pole `w`×`h` mm o środku (cx, cy); `cell` to bok kratki w mm. */
function drawCells(
  grid: Grid<string | null>,
  cx: number,
  cy: number,
  cell: number,
  stroke: string | null,
): string {
  const rows = grid.map((row, r) => (row.some((v) => v !== null) ? r : -1)).filter((r) => r >= 0);
  const cols = grid[0].map((_, c) => (grid.some((row) => row[c] !== null) ? c : -1)).filter((c) => c >= 0);
  const [r0, r1, c0, c1] = [rows[0], rows.at(-1)!, cols[0], cols.at(-1)!];
  const x0 = cx - ((c1 - c0 + 1) * cell) / 2;
  const y0 = cy - ((r1 - r0 + 1) * cell) / 2;
  const out: string[] = [];
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const fill = grid[r][c];
      if (fill === null) continue;
      const s = stroke ? ` stroke="${stroke}" stroke-width="0.25"` : ` stroke="${fill}" stroke-width="0.05"`;
      out.push(`<rect x="${(x0 + (c - c0) * cell).toFixed(2)}" y="${(y0 + (r - r0) * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="${fill}"${s}/>`);
    }
  }
  return out.join("");
}

/** Czy karta poziomu da się ułożyć w kategorii: na 40 losowaniach ile się udało i najmniej różnych obiektów na karcie. */
function feasibility(level: LevelMock, category: ObjectCategoryChoiceId): string {
  let ok = 0;
  let minObjects = Infinity;
  for (let seed = 1; seed <= 40; seed++) {
    const pairs = drawPairs(level, category, mulberry32(seed));
    if (pairs) {
      ok++;
      minObjects = Math.min(minObjects, new Set(pairs.map((p) => p.template.id)).size);
    }
  }
  return ok === 0 ? "0/40" : `${ok}/40, obiektów ≥ ${minObjects}`;
}

function sheet(level: LevelMock, pairs: Picture[], rand: () => number): string {
  const left = PAGE.inset;
  const width = PAGE.w - 2 * PAGE.inset;
  const top = PAGE.inset + PAGE.band + PAGE.bandGap;
  const rowH = (PAGE.h - PAGE.inset - top) / level.pairs;
  const boxH = rowH - 6;
  const boxW = 70;
  // wspólna kratka karty: największy obrys wśród obrazków wypełnia pole, więc proporcje między obrazkami zostają
  const span = (g: Grid<boolean>, axis: 0 | 1): number => {
    const idx = axis === 0 ? g.map((row, r) => (row.some(Boolean) ? r : -1)) : g[0].map((_, c) => (g.some((row) => row[c]) ? c : -1));
    const on = idx.filter((i) => i >= 0);
    return on.at(-1)! - on[0] + 1;
  };
  const maxRows = Math.max(...pairs.map((p) => span(p.shadow, 0)));
  const maxCols = Math.max(...pairs.map((p) => span(p.shadow, 1)));
  const cell = Math.min(boxH / maxRows, boxW / maxCols);
  const leftCx = left + 4 + boxW / 2;
  const rightCx = left + width - 4 - boxW / 2;
  const dotL = leftCx + boxW / 2 + 6;
  const dotR = rightCx - boxW / 2 - 6;
  const perm = derangement(level.pairs, rand);
  const parts: string[] = [];

  const bandY = PAGE.inset;
  parts.push(`<circle cx="${left + 12}" cy="${bandY + 13}" r="11" fill="#f3c969" stroke="#b8860b" stroke-width="0.4"/>`);
  parts.push(`<text x="${left + 12}" y="${bandY + 15}" ${FONT} font-size="4" text-anchor="middle" fill="#7a5a00">postać</text>`);
  parts.push(`<path d="M ${left + 27} ${bandY + 3} H ${left + width} V ${bandY + 23} H ${left + 27} V ${bandY + 16} L ${left + 23} ${bandY + 13} L ${left + 27} ${bandY + 10} Z" fill="#fff" stroke="#111" stroke-width="0.4" stroke-linejoin="round"/>`);
  parts.push(`<text x="${left + 32}" y="${bandY + 15}" ${FONT} font-size="5.6" fill="#111">${INSTRUCTION}</text>`);

  for (let r = 0; r < level.pairs; r++) {
    const cy = top + r * rowH + rowH / 2;
    const obj = pairs[r];
    const objGrid = obj.colors.map((row, ri) =>
      row.map((color, ci) => (color === null ? null : CRAYON[color])),
    );
    parts.push(drawCells(objGrid, leftCx, cy, cell, null));
    const sh = pairs[perm[r]].shadow.map((row) => row.map((v) => (v ? INK : null)));
    parts.push(drawCells(sh, rightCx, cy, cell, null));
    parts.push(`<circle cx="${dotL}" cy="${cy}" r="1.8" fill="${INK}"/><circle cx="${dotR}" cy="${cy}" r="1.8" fill="${INK}"/>`);
  }
  const traps = level.traps > 0 ? ` · pułapki: ${level.traps}` : "";
  parts.push(`<text x="${PAGE.w - PAGE.inset}" y="${PAGE.h - 4}" ${FONT} font-size="3" text-anchor="end" fill="#999">makieta S-47 · ${level.title} · kratka obrazka ${cell.toFixed(1)} mm${traps}</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${PAGE.w} ${PAGE.h}"><rect width="${PAGE.w}" height="${PAGE.h}" fill="#fff"/>${parts.join("")}</svg>`;
}

for (const level of LEVELS) {
  const rand = mulberry32(level.seed);
  const pairs = drawPairs(level, "wszystkie", rand);
  if (!pairs) throw new Error(`no card for ${level.name}`);
  writeFileSync(resolve(OUT, `mockup-${level.name}.svg`), sheet(level, pairs, rand));
}

// Statystyka: dla każdej kategorii i rozmiaru ile obiektów, wariantów, różnych cieni, obiektów z ≥ 2 różnymi cieniami
// (pułapki) i ile par dwóch różnych obiektów ma ten sam cień (np. dwa koła).
const lines: string[] = [
  "# S-47 Cienie — statystyka katalogu (makieta, " + new Date().toISOString().slice(0, 10) + ")",
  "",
  "Cień = cała sylwetka (połowa + odbicie) z wypełnionymi dziurami, przycięta do obrysu. „Warianty” to wszystkie kombinacje części; „cienie” to różne cienie wśród nich.",
  "",
  "| Rozmiar | Kategoria | Obiekty | Warianty | Różne cienie | Obiekty z ≥ 2 cieniami (pułapki) | Pary różnych obiektów z jednym cieniem |",
  "| ------- | --------- | ------- | -------- | ------------ | -------------------------------- | -------------------------------------- |",
];
for (const size of COPY_DRAWING_LEVELS) {
  for (const choice of OBJECT_CATEGORY_CHOICES) {
    const templates = symmetryTemplatesFor(size.size.templateLevel, choice.id);
    let variants = 0;
    const shadowOwners = new Map<string, Set<string>>();
    let trapObjects = 0;
    for (const t of templates) {
      const all = allVariants(t);
      variants += all.length;
      const own = distinctShadows(t, size);
      if (own.length >= 2) trapObjects++;
      for (const p of own) {
        if (!shadowOwners.has(p.shadowKey)) shadowOwners.set(p.shadowKey, new Set());
        shadowOwners.get(p.shadowKey)!.add(t.id);
      }
    }
    const clashes = [...shadowOwners.values()].filter((s) => s.size > 1).map((s) => [...s].join("="));
    lines.push(
      `| ${size.size.columns}×${size.size.rows} | ${choice.label} | ${templates.length} | ${variants} | ${shadowOwners.size} | ${trapObjects} | ${clashes.length === 0 ? "0" : clashes.join(", ")} |`,
    );
  }
}
lines.push("", "## Czy karta się układa (40 losowań na poziom i kategorię)", "", "| Kategoria | " + LEVELS.map((l) => l.name).join(" | ") + " |", "| --- |" + LEVELS.map(() => " --- |").join(""));
for (const choice of OBJECT_CATEGORY_CHOICES) {
  lines.push(`| ${choice.label} | ` + LEVELS.map((l) => feasibility(l, choice.id)).join(" | ") + " |");
}
writeFileSync(resolve(OUT, "stats.md"), lines.join("\n") + "\n");

const html = `<!doctype html><meta charset="utf-8"><title>S-47 makiety</title>
<style>body{font:14px Arial;margin:16px;background:#eee}figure{display:inline-block;margin:8px;vertical-align:top}img{width:420px;background:#fff;box-shadow:0 1px 4px #0003}figcaption{margin-top:4px;max-width:420px}</style>
${LEVELS.map((l) => `<figure><img src="mockup-${l.name}.svg"><figcaption>${l.title}</figcaption></figure>`).join("\n")}`;
writeFileSync(resolve(OUT, "mockups.html"), html);
console.log(`wrote ${LEVELS.length} SVG, stats.md, mockups.html`);
