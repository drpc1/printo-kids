// Makieta karty „Który nie pasuje” (S-34) przed planem, wersja 2 (po uwagach 2026-11-08: łatwy i średni były tak samo
// trudne, a pikselowe sylwetki nieczytelne). Pisze pliki SVG A4 do tego folderu z prawdziwych kształtów sudoku
// (sudokuShapePath) i ikon wektorowych z icons.mts. Każdy rząd jest sprawdzany regułą jednoznaczności: dokładnie jedna
// cecha ma dokładnie jeden odstający obrazek, a pozostałe cechy nie wskazują żadnego pojedynczego obrazka.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/odd-one-out-card/mockup.mts
// Drukuj na A4 w 100%. Przerywany prostokąt w pasie u góry to miejsce na postać i dymek.
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sudokuShapePath, SUDOKU_SHAPES_4, type SudokuShapeId } from "../../../src/lib/sudoku/shapes.ts";
import { ICONS, ICON_CATEGORY_NAMES, iconAt, type Icon, type IconCategory } from "./icons.mts";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';

// Kredki z global.css (--symmetry-*), te same co sudoku.
const CRAYONS: Record<string, string> = {
  red: "oklch(0.58 0.21 27)",
  blue: "oklch(0.55 0.18 255)",
  green: "oklch(0.62 0.17 145)",
  orange: "oklch(0.7 0.18 50)",
  purple: "oklch(0.48 0.17 305)",
  yellow: "oklch(0.8 0.16 85)",
  brown: "oklch(0.42 0.07 55)",
};
const CRAYON_IDS = Object.keys(CRAYONS);

type Rule = "shape" | "size" | "count" | "color" | "category";
const RULES: readonly Rule[] = ["shape", "size", "count", "color", "category"];

interface Item {
  shape: SudokuShapeId | null; // null = ikona obiektu
  size: "big" | "small";
  count: number;
  color: string; // "ink" bez kolorów
  category: string; // "ksztalt" dla figur
  icon?: Icon;
}

interface LevelMock {
  file: string;
  title: string;
  n: number;
  rules: Rule[];
  colors: boolean;
  /** Ile innych cech zmienia się parami w rzędzie (każda wartość co najmniej dwa razy, więc niczego nie wskazuje). */
  distractors: number;
  /** Mały obrazek względem dużego (łatwy i średni wyraźnie, trudny subtelniej). */
  smallRatio: number;
  /** Liczebność grup w regule liczby: większość ma tyle, odstający o jeden mniej albo więcej. */
  counts: readonly number[];
  seed: number;
}

const PAGE = { w: 210, h: 297, inset: 10, band: 26, bandGap: 6, rowGap: 4 };

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(random: () => number, list: readonly T[]): T => list[Math.floor(random() * list.length)];
function shuffle<T>(random: () => number, list: readonly T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function features(item: Item): Record<Rule, string> {
  return {
    shape: item.shape ?? `ikona:${item.icon?.id}`,
    size: item.size,
    count: String(item.count),
    color: item.color,
    category: item.category,
  };
}

/** Indeksy obrazków, których wartość cechy występuje w rzędzie dokładnie raz. */
function loners(items: readonly Item[], rule: Rule): number[] {
  const values = items.map((item) => features(item)[rule]);
  return values.flatMap((value, index) => (values.filter((other) => other === value).length === 1 ? [index] : []));
}

/** Rząd jest jednoznaczny, gdy cecha `rule` ma dokładnie jednego odstającego, a każda inna cecha żadnego. */
function ambiguity(items: readonly Item[], rule: Rule): string | null {
  const own = loners(items, rule);
  if (own.length !== 1) return `${rule}: ${own.length} odstających`;
  for (const other of RULES) {
    // Ikony różnią się „kształtem” każda od każdej; w rzędzie kategorii kształt nie jest regułą, więc go pomijamy.
    if (other === "shape" && rule === "category") continue;
    if (other !== rule && loners(items, other).length > 0) return `${other} też wskazuje obrazek`;
  }
  return null;
}

/** n wartości, każda co najmniej dwa razy (pary, przy nieparzystym n jedna trójka). */
function pairs<T>(random: () => number, values: readonly T[], n: number): T[] {
  const chosen = shuffle(random, values).slice(0, Math.floor(n / 2));
  const out = Array.from({ length: n }, (_, i) => chosen[Math.min(Math.floor(i / 2), chosen.length - 1)]);
  return shuffle(random, out);
}

const BY_CATEGORY = new Map<IconCategory, Icon[]>();
for (const icon of ICONS) BY_CATEGORY.set(icon.category, [...(BY_CATEGORY.get(icon.category) ?? []), icon]);

function makeRow(random: () => number, rule: Rule, level: LevelMock): Item[] {
  const n = level.n;
  const odd = Math.floor(random() * n);
  const ink = level.colors ? pick(random, CRAYON_IDS) : "ink";
  let items: Item[] = Array.from({ length: n }, () => ({ shape: "circle", size: "big", count: 1, color: "ink", category: "ksztalt" }));

  if (rule === "category") {
    const [major, minor] = shuffle(random, [...BY_CATEGORY.keys()]);
    const many = shuffle(random, BY_CATEGORY.get(major) ?? []).slice(0, n - 1);
    const one = pick(random, BY_CATEGORY.get(minor) ?? []);
    let k = 0;
    items = items.map((_, index) => {
      const icon = index === odd ? one : many[k++];
      return { shape: null, size: "big", count: 1, color: "ink", category: icon.category, icon };
    });
    // Rozpraszacz w rzędzie kategorii: rozmiar parami (ikony zostają czarne).
    if (level.distractors > 0) {
      const spread = pairs(random, ["big", "small"] as const, n);
      items = items.map((item, index) => ({ ...item, size: spread[index] }));
    }
    return items;
  }

  const [common, other] = shuffle(random, SUDOKU_SHAPES_4);
  items = items.map((item) => ({ ...item, shape: common, color: ink }));

  if (rule === "shape") items[odd].shape = other;
  if (rule === "size") {
    const majority = random() < 0.7 ? "big" : "small";
    items = items.map((item, index) => ({ ...item, size: index === odd ? (majority === "big" ? "small" : "big") : majority }));
  }
  if (rule === "count") {
    const c = pick(random, level.counts);
    const d = pick(random, [c - 1, c + 1].filter((x) => x >= 1 && x <= 6));
    items = items.map((item, index) => ({ ...item, count: index === odd ? d : c }));
  }
  if (rule === "color") {
    const [a, b] = shuffle(random, CRAYON_IDS);
    items = items.map((item, index) => ({ ...item, color: index === odd ? b : a }));
  }

  // Rozpraszacze: inne cechy zmieniają się parami. Liczba nie jest rozpraszaczem (grupy w każdym rzędzie byłyby zbyt gęste).
  const candidates = shuffle(
    random,
    (["color", "shape", "size"] as const).filter((feature) => feature !== rule && (feature !== "color" || level.colors)),
  );
  // Kolor najpierw, gdy kolory są włączone: najłatwiej go zobaczyć i zignorować.
  candidates.sort((a, b) => Number(b === "color") - Number(a === "color"));
  for (const feature of candidates.slice(0, level.distractors)) {
    if (feature === "color") {
      const spread = pairs(random, CRAYON_IDS, n);
      items = items.map((item, index) => ({ ...item, color: spread[index] }));
    } else if (feature === "shape") {
      // W regule kształtu nie wolno ruszać kształtu; tu rule !== "shape".
      const spread = pairs(random, SUDOKU_SHAPES_4, n);
      items = items.map((item, index) => ({ ...item, shape: spread[index] }));
    } else {
      const spread = pairs(random, ["big", "small"] as const, n);
      items = items.map((item, index) => ({ ...item, size: spread[index] }));
    }
  }
  return items;
}

function drawShape(id: SudokuShapeId, cx: number, cy: number, size: number, color: string): string {
  const d = sudokuShapePath(id, cx, cy, size);
  if (color === "ink") {
    return `<path d="${d}" fill="#fff" stroke="#000" stroke-width="${Math.max(0.6, size * 0.06).toFixed(2)}" stroke-linejoin="round"/>`;
  }
  return `<path d="${d}" fill="${CRAYONS[color]}" stroke="#000" stroke-width="0.4" stroke-linejoin="round"/>`;
}

const DICE: Record<number, readonly (readonly [number, number])[]> = {
  1: [[0, 0]],
  2: [[-1, 0], [1, 0]],
  3: [[-1, 0.9], [1, 0.9], [0, -0.9]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1.25], [1, -1.25], [-1, 0], [1, 0], [-1, 1.25], [1, 1.25]],
};

function drawItem(item: Item, cx: number, cy: number, slot: number, smallRatio: number): string {
  const scale = item.size === "big" ? 1 : smallRatio;
  if (item.icon) return iconAt(item.icon, cx, cy, slot * 0.82 * scale);
  const shape = item.shape as SudokuShapeId;
  if (item.count > 1) {
    const unit = slot * 0.23 * scale;
    const step = unit * 0.95;
    return (DICE[item.count] ?? []).map(([dx, dy]) => drawShape(shape, cx + dx * step, cy + dy * step, unit, item.color)).join("");
  }
  return drawShape(shape, cx, cy, slot * 0.78 * scale, item.color);
}

function header(title: string): string[] {
  const width = PAGE.w - 2 * PAGE.inset;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">`,
    `<rect width="210" height="297" fill="#fff"/>`,
    `<rect x="${PAGE.inset}" y="${PAGE.inset}" width="${width}" height="${PAGE.band}" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="2 1.5"/>`,
    `<text x="${PAGE.w - PAGE.inset}" y="${PAGE.h - 4}" text-anchor="end" ${FONT} font-size="2.6" fill="#999">makieta S-34 · ${title}</text>`,
  ];
}

function sheet(level: LevelMock): string {
  const random = mulberry32(level.seed);
  const top = PAGE.inset + PAGE.band + PAGE.bandGap;
  const usable = PAGE.h - PAGE.inset - top;
  const rowCount = level.rules.length;
  const rowH = (usable - PAGE.rowGap * (rowCount - 1)) / rowCount;
  const width = PAGE.w - 2 * PAGE.inset;
  const slotW = width / level.n;
  const slot = Math.min(slotW, rowH) - 4;

  const parts = header(level.title);
  parts.push(`<text x="105" y="${PAGE.inset + PAGE.band / 2}" text-anchor="middle" dominant-baseline="middle" ${FONT} font-size="7" fill="#000">Który nie pasuje? Zakreśl go.</text>`);
  const log: string[] = [];
  level.rules.forEach((rule, r) => {
    let items: Item[] = [];
    let problem: string | null = "nie próbowano";
    for (let attempt = 0; attempt < 500 && problem !== null; attempt += 1) {
      items = makeRow(random, rule, level);
      problem = ambiguity(items, rule);
    }
    if (problem !== null) throw new Error(`${level.file} rząd ${r + 1} (${rule}): ${problem}`);
    const y = top + r * (rowH + PAGE.rowGap);
    parts.push(`<rect x="${PAGE.inset}" y="${y.toFixed(2)}" width="${width}" height="${rowH.toFixed(2)}" rx="3" fill="none" stroke="#000" stroke-width="0.3"/>`);
    items.forEach((item, i) => parts.push(drawItem(item, PAGE.inset + slotW * (i + 0.5), y + rowH / 2, slot, level.smallRatio)));
    log.push(`  rząd ${r + 1}: reguła ${rule}, odpowiedź: obrazek ${loners(items, rule)[0] + 1}`);
  });
  parts.push("</svg>");
  console.log(`${level.file} (${level.title}): rząd ${rowH.toFixed(1)} mm, obrazek do ${slot.toFixed(1)} mm\n${log.join("\n")}`);
  return parts.join("\n");
}

/** Arkusz z całym zestawem ikon: kategoria w wierszu, nazwa pod ikoną, ikona w rozmiarze z trudnego poziomu. */
function iconSheet(): string {
  const parts = header("zestaw ikon do reguły kategorii");
  parts.push(`<text x="105" y="${PAGE.inset + PAGE.band / 2}" text-anchor="middle" dominant-baseline="middle" ${FONT} font-size="7" fill="#000">Ikony kategorii (rozmiar jak na trudnym poziomie)</text>`);
  const categories = [...BY_CATEGORY.keys()];
  const top = PAGE.inset + PAGE.band + PAGE.bandGap;
  const rowH = (PAGE.h - PAGE.inset - top) / categories.length;
  const slotW = (PAGE.w - 2 * PAGE.inset) / 5;
  categories.forEach((category, r) => {
    const y = top + r * rowH;
    parts.push(`<text x="${PAGE.inset}" y="${(y + 4).toFixed(2)}" ${FONT} font-size="3.5" font-weight="700" fill="#000">${ICON_CATEGORY_NAMES[category]}</text>`);
    (BY_CATEGORY.get(category) ?? []).forEach((icon, i) => {
      const cx = PAGE.inset + slotW * (i + 0.5);
      parts.push(iconAt(icon, cx, y + rowH / 2, 26));
      parts.push(`<text x="${cx.toFixed(2)}" y="${(y + rowH - 3).toFixed(2)}" text-anchor="middle" ${FONT} font-size="3" fill="#555">${icon.name}</text>`);
    });
  });
  parts.push("</svg>");
  return parts.join("\n");
}

const LEVELS: LevelMock[] = [
  { file: "mockup-latwy.svg", title: "łatwy: 4 obrazki, kształt i rozmiar, reszta jednakowa", n: 4, rules: ["shape", "size", "shape", "size", "shape"], colors: false, distractors: 0, smallRatio: 0.5, counts: [], seed: 11 },
  { file: "mockup-sredni.svg", title: "średni: 5 obrazków, + liczba, jeden rozpraszacz", n: 5, rules: ["shape", "size", "count", "shape", "count"], colors: false, distractors: 1, smallRatio: 0.55, counts: [2, 3], seed: 22 },
  { file: "mockup-sredni-kolory.svg", title: "średni z kolorami: + kolor, jeden rozpraszacz", n: 5, rules: ["shape", "color", "size", "count", "color"], colors: true, distractors: 1, smallRatio: 0.55, counts: [2, 3], seed: 23 },
  { file: "mockup-trudny.svg", title: "trudny: 6 obrazków, + kategoria, dwa rozpraszacze, subtelniej", n: 6, rules: ["shape", "category", "size", "count", "category", "count"], colors: false, distractors: 2, smallRatio: 0.72, counts: [4, 5], seed: 33 },
  { file: "mockup-trudny-kolory.svg", title: "trudny z kolorami: dwa rozpraszacze, subtelniej", n: 6, rules: ["category", "color", "shape", "count", "category", "size"], colors: true, distractors: 2, smallRatio: 0.72, counts: [4, 5], seed: 34 },
];

for (const level of LEVELS) writeFileSync(resolve(OUT, level.file), sheet(level));
writeFileSync(resolve(OUT, "mockup-ikony.svg"), iconSheet());

// Podgląd wszystkich arkuszy obok siebie (SVG wklejone w HTML, bo panel nie ładuje plików obok).
const previews: [string, string][] = [["mockup-ikony.svg", "ikony kategorii"], ...LEVELS.map((level): [string, string] => [level.file, level.title])];
let html = `<!doctype html><meta charset="utf-8"><title>Makiety S-34</title><style>body{font-family:sans-serif;margin:8px;background:#eee}div{display:inline-block;margin:6px;vertical-align:top;text-align:center;width:300px;font-size:12px}svg{width:300px;height:auto;box-shadow:0 1px 4px #0003}</style>`;
for (const [file, title] of previews) {
  const svg = file === "mockup-ikony.svg" ? iconSheet() : sheet(LEVELS.find((level) => level.file === file) as LevelMock);
  html += `<div>${svg.replace('width="210mm" height="297mm"', "")}<br>${title}</div>`;
}
writeFileSync(resolve(OUT, "mockups.html"), html);
