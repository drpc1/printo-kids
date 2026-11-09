// Makieta karty „Szlaczki” (S-36), wersje 3–5: obrazki startu i celu (materiał do issue o kategoriach, nie S-36). Pisze pliki SVG A4 i mockups-v4.html
// do tego folderu. Wzory to jawne krzywe (linia, fala, zygzak, łuki, schodki, pętle, łuk z kreską); każdy rząd ma
// losowaną wysokość i długość okresu. Na każdym rzędzie stoi obrazek startu i obrazek celu (ikony karty „Który nie
// pasuje”), a szlaczek to droga od jednego do drugiego, np. królik skacze łukami do marchewki. Makieta nie jest kodem
// produktu.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/pattern-lines-card/mockup.mts
// Drukuj na A4 w 100%. Przerywany prostokąt u góry to miejsce na postać i dymek z poleceniem.
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ICON_BOX, iconById, type IconFigure } from "../../../src/lib/odd-one-out/icons.ts";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';

type PatternId = "line" | "zigzag" | "wave" | "stairs" | "loops" | "arcs" | "arcflat";
type Pt = { x: number; y: number; corner?: boolean };

// Jednostka wzoru: x od 0 do 1 (jeden okres), y od 0 (dół) do 1 (góra); początek i koniec na tej samej wysokości.
function unit(id: PatternId): Pt[] {
  const N = 48;
  const sample = (f: (t: number) => Pt) => Array.from({ length: N + 1 }, (_, i) => f(i / N));
  switch (id) {
    case "line":
      return [{ x: 0, y: 0.5, corner: true }, { x: 1, y: 0.5, corner: true }];
    case "zigzag":
      return [{ x: 0, y: 0, corner: true }, { x: 0.5, y: 1, corner: true }, { x: 1, y: 0, corner: true }];
    case "stairs":
      return [
        { x: 0, y: 0, corner: true }, { x: 0, y: 1, corner: true }, { x: 0.5, y: 1, corner: true },
        { x: 0.5, y: 0, corner: true }, { x: 1, y: 0, corner: true },
      ];
    case "wave":
      return sample((t) => ({ x: t, y: (1 - Math.cos(t * 2 * Math.PI)) / 2 }));
    case "arcs":
      return sample((t) => ({ x: t, y: Math.sin(t * Math.PI) }));
    case "arcflat": {
      const pts = Array.from({ length: 33 }, (_, i) => ({ x: (i / 32) * (2 / 3), y: Math.sin((i / 32) * Math.PI) }));
      return [...pts, { x: 1, y: 0, corner: true }];
    }
    case "loops": {
      const k = 0.34;
      return sample((t) => {
        const a = t * 2 * Math.PI;
        return { x: t - k * Math.sin(a), y: (1 + Math.cos(a)) / 2 };
      });
    }
  }
}

// Para obrazków dla wzoru: kto idzie (start) i dokąd (cel). Ruch pasuje do kształtu drogi.
const PAIRS: Record<PatternId, [string, string][]> = {
  line: [["auto", "domek"], ["zolw", "lisc"], ["kot", "ryba"], ["lodka", "latarnia"], ["krolik", "marchewka"]],
  wave: [["ptak", "drzewo"], ["lodka", "latarnia"], ["ryba", "lisc"], ["samolot", "wieza"], ["ptak", "kwiat"], ["auto", "namiot"]],
  zigzag: [["rakieta", "ufo"], ["kot", "domek"], ["ptak", "choinka"], ["samolot", "wiezowiec"], ["auto", "wieza"]],
  arcs: [["krolik", "marchewka"], ["krolik", "jablko"], ["kot", "grzyb"], ["auto", "domek"], ["rakieta", "ufo"], ["zolw", "gruszka"], ["samolot", "domek"], ["lodka", "drzewo"]],
  stairs: [["kot", "wieza"], ["zolw", "namiot"], ["auto", "wiezowiec"], ["krolik", "domek"], ["rakieta", "wieza"]],
  loops: [["samolot", "wiezowiec"], ["ptak", "kwiat"], ["rakieta", "ufo"]],
  arcflat: [["krolik", "gruszka"], ["auto", "namiot"]],
};

// Motyw karty (pomysł 4): kto idzie w rzędach. Cele mogą być z każdej kategorii.
const THEMES: Record<string, { starters: string[]; command: string }> = {
  zwierzeta: { starters: ["kot", "ptak", "krolik", "zolw", "ryba"], command: "Zwierzaki idą do celu. Poprowadź je po kropkach." },
  pojazdy: { starters: ["auto", "lodka", "samolot", "rakieta"], command: "Pojazdy jadą do celu. Poprowadź je po kropkach." },
};

// Kolor kredki każdego obrazka (pomysł 3); kredki z global.css (--symmetry-*), te same co sudoku.
const CRAYON = {
  red: "oklch(0.58 0.21 27)",
  blue: "oklch(0.55 0.18 255)",
  green: "oklch(0.62 0.17 145)",
  orange: "oklch(0.7 0.18 50)",
  purple: "oklch(0.48 0.17 305)",
  yellow: "oklch(0.8 0.16 85)",
  brown: "oklch(0.42 0.07 55)",
  gray: "oklch(0.65 0.02 250)",
};
const ICON_COLOR: Record<string, string> = {
  kot: CRAYON.orange, ryba: CRAYON.blue, ptak: CRAYON.red, zolw: CRAYON.green, krolik: CRAYON.gray,
  jablko: CRAYON.red, gruszka: CRAYON.green, marchewka: CRAYON.orange, drzewo: CRAYON.green, choinka: CRAYON.green,
  kwiat: CRAYON.purple, grzyb: CRAYON.red, lisc: CRAYON.green, rakieta: CRAYON.red, auto: CRAYON.blue,
  samolot: CRAYON.blue, lodka: CRAYON.brown, ufo: CRAYON.purple, domek: CRAYON.brown, wieza: CRAYON.gray,
  namiot: CRAYON.yellow, latarnia: CRAYON.red, wiezowiec: CRAYON.blue,
};

type IconStyle = "silhouette" | "outline" | "color";

interface Level {
  file: string;
  title: string;
  who: string; // dla kogo, tylko na stopce makiety
  mode: "dots" | "continue";
  patterns: PatternId[];
  dot: number; // promień kropki, mm
  spacing: number; // odstęp kropek wzdłuż ścieżki, mm
  stroke: number; // grubość linii, mm
  guides: boolean; // cienkie linie pomocnicze góra/dół rzędu
  rows: number;
  period: [number, number]; // mm
  height: [number, number]; // mm
  guideLine: boolean; // jasnoszara ścieżka pod kropkami
  icon: number; // bok obrazka startu i celu, mm
}

const LEVELS: Level[] = [
  { file: "poziom-1", title: "Poziom 1", who: "3–4 lata", mode: "dots", patterns: ["line", "wave", "arcs"], dot: 1.1, spacing: 4, stroke: 0, guides: false, rows: 4, period: [40, 50], height: [16, 20], guideLine: true, icon: 22 },
  { file: "poziom-2", title: "Poziom 2", who: "5–6 lat", mode: "dots", patterns: ["zigzag", "wave", "stairs", "arcs"], dot: 0.8, spacing: 3, stroke: 0, guides: false, rows: 5, period: [24, 32], height: [12, 16], guideLine: true, icon: 18 },
  { file: "poziom-3", title: "Poziom 3", who: "6–7 lat", mode: "continue", patterns: ["zigzag", "wave", "stairs"], dot: 0, spacing: 0, stroke: 1.2, guides: true, rows: 6, period: [18, 24], height: [10, 14], guideLine: false, icon: 16 },
  { file: "poziom-4", title: "Poziom 4", who: "7–8 lat", mode: "continue", patterns: ["loops", "arcs", "arcflat"], dot: 0, spacing: 0, stroke: 0.7, guides: false, rows: 6, period: [14, 20], height: [9, 13], guideLine: false, icon: 16 },
];

const PAGE = { w: 210, h: 297, inset: 10, band: 26, gap: 6 };

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Row {
  id: PatternId;
  height: number; // mm
  period: number; // mm, przed dopasowaniem do szerokości drogi
  pair: [string, string];
}

function makeRows(level: Level, seed: number, theme?: string): Row[] {
  const random = mulberry32(seed);
  const starters = theme ? THEMES[theme].starters : null;
  const pairsFor = (id: PatternId) => PAIRS[id].filter((p) => !starters || starters.includes(p[0]));
  const order: PatternId[] = [];
  while (order.length < level.rows) order.push(...[...level.patterns].sort(() => random() - 0.5));
  const used = new Set<string>();
  return order.slice(0, level.rows).map((id) => {
    // para obrazków nie powtarza się na jednej karcie
    const free = pairsFor(id).filter((p) => !used.has(p.join()));
    if (free.length === 0) throw new Error(`brak wolnej pary dla ${id} w motywie ${theme}`);
    const pair = free[Math.floor(random() * free.length)];
    used.add(pair.join());
    return {
      id,
      height: id === "line" ? 0 : level.height[0] + Math.floor(random() * (level.height[1] - level.height[0] + 1)),
      period: level.period[0] + Math.floor(random() * (level.period[1] - level.period[0] + 1)),
      pair,
    };
  });
}

/** Droga rzędu w mm od x=0 do x=length (całkowita liczba okresów), y względem środka rzędu (do góry ujemne). */
function rowPath(row: Row, length: number, repeats: number | null): Pt[] {
  const total = Math.max(1, Math.round(length / row.period));
  const period = length / total;
  const u = unit(row.id);
  const pts: Pt[] = [];
  for (let r = 0; r < (repeats ?? total); r += 1) {
    for (const p of u) {
      if (r > 0 && p === u[0]) continue;
      pts.push({ x: (r + p.x) * period, y: -(p.y - 0.5) * row.height, corner: p.corner });
    }
  }
  return pts;
}

function dotsOn(path: Pt[], spacing: number): Pt[] {
  const dots: Pt[] = [path[0]];
  let acc = 0;
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1];
    const b = path[i];
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    if (a.corner && b.corner) {
      const n = Math.max(1, Math.round(d / spacing));
      for (let k = 1; k <= n; k += 1) dots.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n });
      acc = 0;
      continue;
    }
    acc += d;
    if (acc >= spacing * 0.95 || i === path.length - 1) {
      dots.push(b);
      acc = 0;
    }
  }
  return dots;
}

/** Jedna figura ikony; `stroke` obrysowuje ją kreską o grubości `edge` (w jednostkach pudełka 100×100). */
function figureSvg(f: IconFigure, fill: string, stroke: string | null, edge: number): string {
  const st = stroke ? ` stroke="${stroke}" stroke-width="${edge}" stroke-linejoin="round"` : "";
  switch (f.kind) {
    case "circle":
      return `<circle cx="${f.cx}" cy="${f.cy}" r="${f.r}" fill="${fill}"${st}/>`;
    case "ellipse":
      return `<ellipse cx="${f.cx}" cy="${f.cy}" rx="${f.rx}" ry="${f.ry}" fill="${fill}"${st}${f.rotate ? ` transform="rotate(${f.rotate} ${f.cx} ${f.cy})"` : ""}/>`;
    case "rect":
      return `<rect x="${f.x}" y="${f.y}" width="${f.width}" height="${f.height}" rx="${f.rx ?? 0}" fill="${fill}"${st}${f.rotate ? ` transform="rotate(${f.rotate} ${f.x + f.width / 2} ${f.y + f.height / 2})"` : ""}/>`;
    case "polygon":
      return `<polygon points="${f.points.map((p) => p.join(",")).join(" ")}" fill="${fill}"${st}/>`;
    case "path":
      return f.strokeWidth
        ? `<path d="${f.d}" fill="none" stroke="${stroke ?? fill}" stroke-width="${f.strokeWidth + (stroke ? edge : 0)}" stroke-linecap="round"/>`
        :`<path d="${f.d}" fill="${fill}"${st}/>`;
    case "line":
      return `<line x1="${f.x1}" y1="${f.y1}" x2="${f.x2}" y2="${f.y2}" stroke="${stroke ?? fill}" stroke-width="${f.strokeWidth + (stroke ? edge : 0)}" stroke-linecap="round"/>`;
  }
}

/**
 * Obrazek startu albo celu. `silhouette` to czarna sylwetka (jak „Który nie pasuje”). `outline` (pomysł 1) to kontur do
 * pokolorowania: najpierw wszystkie figury z grubą czarną kreską, potem te same figury białe bez kreski, więc zostaje
 * tylko zewnętrzny obrys całej sylwetki; detale (oczy, okna) są małymi konturami. `color` (pomysł 3) to ten sam kontur
 * wypełniony kredką obrazka.
 */
function iconSvg(id: string, cx: number, cy: number, size: number, style: IconStyle): string {
  const icon = iconById(id);
  if (!icon) throw new Error(`brak ikony ${id}`);
  const s = size / ICON_BOX;
  const ink = icon.figures.filter((f) => f.tone === "ink");
  const paper = icon.figures.filter((f) => f.tone === "paper");
  let parts: string[];
  if (style === "silhouette") {
    parts = icon.figures.map((f) => figureSvg(f, f.tone === "ink" ? "#000" : "#fff", null, 0));
  } else {
    const edge = 0.55 / s; // kreska konturu ok. 0,55 mm na wydruku
    const inside = style === "color" ? ICON_COLOR[id] ?? CRAYON.gray : "#fff";
    parts = [
      ...ink.map((f) => figureSvg(f, "#000", "#000", edge * 2)),
      ...ink.map((f) => figureSvg(f, inside, null, 0)),
      ...paper.map((f) => figureSvg(f, "#fff", "#000", edge)),
    ];
  }
  return `<g transform="translate(${(cx - size / 2).toFixed(2)} ${(cy - size / 2).toFixed(2)}) scale(${s.toFixed(4)})">${parts.join("")}</g>`;
}

interface Variant {
  file: string;
  label: string;
  level: Level;
  style: IconStyle;
  theme?: string;
  seed: number;
}

function card(v: Variant): string {
  const { level } = v;
  const rows = makeRows(level, v.seed, v.theme);
  const left = PAGE.inset;
  const width = PAGE.w - 2 * PAGE.inset;
  const top = PAGE.inset + PAGE.band + PAGE.gap;
  const rowH = (PAGE.h - PAGE.inset - top) / level.rows;
  const gapToIcon = 3;
  const pathStart = level.icon + gapToIcon;
  const pathLength = width - 2 * (level.icon + gapToIcon);
  const out: string[] = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE.w} ${PAGE.h}">`);
  out.push(`<rect width="${PAGE.w}" height="${PAGE.h}" fill="#fff"/>`);
  out.push(`<rect x="${left}" y="${PAGE.inset}" width="${width}" height="${PAGE.band}" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="2 1.5"/>`);
  const command = v.theme ? THEMES[v.theme].command : level.mode === "dots" ? "Poprowadź każdego do celu po kropkach." : "Dokończ szlaczek aż do celu.";
  out.push(`<text x="${PAGE.w / 2}" y="${PAGE.inset + PAGE.band / 2}" text-anchor="middle" dominant-baseline="middle" ${FONT} font-size="7" fill="#000">${command}</text>`);
  const note = `${level.title} · ${level.who} · ${level.mode === "dots" ? "kropki" : "kontynuacja"} · ${level.patterns.join(", ")} · ${level.rows} rzędów`;
  out.push(`<text x="${PAGE.w - PAGE.inset}" y="${PAGE.h - 4}" text-anchor="end" ${FONT} font-size="2.6" fill="#999">makieta S-36 v4 · ${v.label} · ${note}</text>`);

  rows.forEach((row, i) => {
    const cy = top + rowH * i + rowH / 2;
    out.push(`<g transform="translate(${left} ${cy.toFixed(2)})">`);
    out.push(iconSvg(row.pair[0], level.icon / 2, 0, level.icon, v.style));
    out.push(iconSvg(row.pair[1], width - level.icon / 2, 0, level.icon, v.style));
    out.push(`<g transform="translate(${pathStart} 0)">`);
    if (level.guides) {
      for (const dy of [-10, 10]) {
        out.push(`<line x1="0" y1="${dy}" x2="${pathLength}" y2="${dy}" stroke="#bbb" stroke-width="0.25" stroke-dasharray="1 1.5"/>`);
      }
    }
    if (level.mode === "dots") {
      const pts = rowPath(row, pathLength, null);
      if (level.guideLine) {
        const gd = pts.map((p, k) => `${k ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
        out.push(`<path d="${gd}" fill="none" stroke="#ccc" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>`);
      }
      for (const d of dotsOn(pts, level.spacing)) out.push(`<circle cx="${d.x.toFixed(2)}" cy="${d.y.toFixed(2)}" r="${level.dot}" fill="#000"/>`);
    } else {
      const total = Math.max(1, Math.round(pathLength / row.period));
      const shown = Math.max(2, Math.round(total * 0.4));
      const pts = rowPath(row, pathLength, shown);
      const d = pts.map((p, k) => `${k ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
      out.push(`<path d="${d}" fill="none" stroke="#000" stroke-width="${level.stroke}" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
    out.push(`</g></g>`);
  });
  out.push(`</svg>`);
  return out.join("\n");
}

const [L1, L2, L3, L4] = LEVELS;
const VARIANTS: Variant[] = [
  { file: "v4-1-kontury", label: "pomysł 1: kontury do kolorowania", level: L1, style: "outline", seed: 100 },
  { file: "v4-1-kolory", label: "pomysł 3: kolory", level: L1, style: "color", seed: 100 },
  { file: "v4-2-motyw-zwierzaki", label: "pomysł 4: motyw Zwierzaki, kontury", level: L2, style: "outline", theme: "zwierzeta", seed: 107 },
  { file: "v4-2-motyw-pojazdy", label: "pomysł 4: motyw Pojazdy, kolory", level: L2, style: "color", theme: "pojazdy", seed: 107 },
  { file: "v4-3-kontury", label: "pomysł 1 na kontynuacji", level: L3, style: "outline", seed: 114 },
  { file: "v4-4-kolory", label: "pomysł 3 na kontynuacji", level: L4, style: "color", seed: 121 },
];
const cards = VARIANTS.map((v) => ({ v, svg: card(v) }));
for (const { v, svg } of cards) writeFileSync(`${OUT}/mockup-${v.file}.svg`, svg);
const html =
  `<!doctype html><meta charset="utf-8"><title>Makiety S-36 v4</title><style>body{font-family:sans-serif;margin:8px;background:#eee}div{display:inline-block;margin:6px;vertical-align:top;text-align:center;width:380px;font-size:12px}svg{width:380px;height:auto;box-shadow:0 1px 4px #0003}</style>` +
  cards.map(({ v, svg }) => `<div>${v.level.title} (${v.level.who}) · ${v.label}<br>${svg}</div>`).join("\n");
writeFileSync(`${OUT}/mockups-v4.html`, html);
console.log("zapisano", cards.length, "makiet");

// Wersja 5: przegląd łatwych kształtów do Poziomu 1 (3–4 lata), bez obrazków. Każdy rząd ma szary podpis tylko
// do rozmowy; karta go nie ma. Większa pusta kropka pokazuje początek drogi.
function easyShapesSheet(): string {
  const left = PAGE.inset;
  const width = PAGE.w - 2 * PAGE.inset;
  const top = PAGE.inset + PAGE.band + PAGE.gap;
  const rowsSpec = [
    "linia prosta",
    "fala",
    "górki (łuki do góry)",
    "miseczki (łuki w dół)",
    "łagodna fala (niska i długa)",
    "łagodny zygzak (niski i szeroki)",
  ];
  const rowH = (PAGE.h - PAGE.inset - top) / rowsSpec.length;
  const dot = L1.dot;
  const spacing = L1.spacing;
  const out: string[] = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE.w} ${PAGE.h}">`);
  out.push(`<rect width="${PAGE.w}" height="${PAGE.h}" fill="#fff"/>`);
  out.push(`<rect x="${left}" y="${PAGE.inset}" width="${width}" height="${PAGE.band}" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="2 1.5"/>`);
  out.push(`<text x="${PAGE.w / 2}" y="${PAGE.inset + PAGE.band / 2}" text-anchor="middle" dominant-baseline="middle" ${FONT} font-size="7" fill="#000">Prowadź ołówek po kropkach.</text>`);
  out.push(`<text x="${PAGE.w - PAGE.inset}" y="${PAGE.h - 4}" text-anchor="end" ${FONT} font-size="2.6" fill="#999">makieta S-36 v5 · łatwe kształty do Poziomu 1 (3–4 lata) · bez obrazków · podpisy rzędów tylko do rozmowy</text>`);
  const guide = (pts: Pt[]) =>
    `<path d="${pts.map((p, k) => `${k ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")}" fill="none" stroke="#ccc" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  const dots = (pts: Pt[]) => dotsOn(pts, spacing).map((d) => `<circle cx="${d.x.toFixed(2)}" cy="${d.y.toFixed(2)}" r="${dot}" fill="#000"/>`).join("");
  const startMark = (p: Pt) => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${dot + 1.2}" fill="none" stroke="#000" stroke-width="0.5"/>`;
  const pathLength = width - 6;
  rowsSpec.forEach((label, i) => {
    const cy = top + rowH * i + rowH / 2;
    out.push(`<text x="${left}" y="${(cy - rowH / 2 + 4).toFixed(2)}" ${FONT} font-size="2.8" fill="#999">${label}</text>`);
    out.push(`<g transform="translate(${left + 3} ${cy.toFixed(2)})">`);
    const variants: { id: PatternId; height: number; period: number; slope?: number; flip?: boolean }[] = [
      { id: "line", height: 0, period: 44 },
      { id: "wave", height: 18, period: 44 },
      { id: "arcs", height: 18, period: 44 },
      { id: "arcs", height: 18, period: 44, flip: true }, // miseczki: górki odwrócone
      { id: "wave", height: 9, period: 60 }, // łagodna: niższa i dłuższa
      { id: "zigzag", height: 9, period: 44 }, // łagodny zygzak: niskie, szerokie ząbki
    ];
    const v = variants[i];
    let pts = rowPath({ id: v.id, height: v.height, period: v.period, pair: ["", ""] }, pathLength, null);
    if (v.flip) pts = pts.map((p) => ({ ...p, y: -p.y }));
    if (v.slope) pts = pts.map((p) => ({ ...p, y: p.y + (p.x / pathLength - 0.5) * v.slope! }));
    out.push(guide(pts), dots(pts), startMark(pts[0]));
    out.push(`</g>`);
  });
  out.push(`</svg>`);
  return out.join("\n");
}
const easy = easyShapesSheet();
writeFileSync(`${OUT}/mockup-v5-poziom-1-latwe-ksztalty.svg`, easy);
// Strona zbiorcza: najpierw przegląd łatwych kształtów (v5), potem warianty v4.
writeFileSync(
  `${OUT}/mockups-v4.html`,
  html.replace("<div>", `<div>Poziom 1 (3–4 lata) · v5: łatwe kształty<br>${easy}</div>\n<div>`),
);
console.log("zapisano makietę łatwych kształtów");
