// Makieta karty kodowania (S-42, Change ID coding-card). Rysuje karty A4 w skali 1:1 (mm): dwa tryby („Zapisz” —
// dziecko zapisuje strzałkami najkrótszą drogę postaci do mety; „Wykonaj” — dziecko idzie za podanymi strzałkami i
// zakreśla, dokąd doszło) na Poziomach 1–4, z postacią i dymkiem z prawdziwego pasa kart (src/lib/sheet/speech.ts)
// i postacią na kratce jako start. Dokłada warianty do decyzji: zapis „3 →” zamiast pojedynczych strzałek, Wykonaj
// bez obrazków-celów, karta bez postaci („Brak”) i kreskowane przeszkody. Skrypt sam sprawdza margines 10 mm, jedną
// najkrótszą drogę (BFS z liczeniem dróg) i to, że strzałki Wykonaj omijają przeszkody, i mierzy, ile losowań kratki
// odpada. To nie jest kod produktu; liczby są propozycją do planu.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/coding-card/mockup.mts
// Pisze mockup-*.svg i mockups.html w tym folderze. Drukuj na A4 w 100%.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { characterContentLeft, characterContentRight } from "../../../src/lib/sheet/character.ts";
import { instructionLines, layoutSpeechBand, SPEECH_BAND } from "../../../src/lib/sheet/speech.ts";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const PAGE = { w: 210, h: 297, inset: 10 };
const BAND_GAP = 6;
const AREA = {
  x: PAGE.inset,
  y: PAGE.inset + SPEECH_BAND.characterSize + BAND_GAP,
  w: PAGE.w - 2 * PAGE.inset,
  h: PAGE.h - 2 * PAGE.inset - SPEECH_BAND.characterSize - BAND_GAP,
};
const CHARACTER = "kot";
// Obrazek osadzony w SVG, żeby makieta otwierała się i drukowała bez serwera.
const CHARACTER_HREF = `data:image/webp;base64,${readFileSync(new URL(`../../../public/characters/${CHARACTER}.webp`, import.meta.url)).toString("base64")}`;

/** Wymiary rysunku (mm albo ułamki boku kratki). */
const SHEET = {
  gridStroke: 0.5,
  frameStroke: 1.1,
  obstacleFill: "#9a9a9a",
  gapUnderGrid: 9,
  boxGap: 3,
  boxStroke: 0.6,
  arrowStroke: 1.1,
  groupBox: { w: 27, h: 16 }, // „3 →”
  baselineShift: 0.36,
  hintColor: "#9a9a9a",
};

// ---------------------------------------------------------------- kratka i drogi

type Dir = "R" | "L" | "U" | "D";
const DIRS: Dir[] = ["R", "L", "U", "D"];
const DELTA: Record<Dir, [number, number]> = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] };
const ARROW: Record<Dir, string> = { R: "→", L: "←", U: "↑", D: "↓" };
type Cell = [number, number]; // [kolumna, wiersz]

const LEVELS = [
  { n: 1, label: "kratka 5×5, krótka droga", cols: 5, rows: 5, cell: 34, obstacles: 0.24, pathMin: 6, pathMax: 8, turnsMin: 1, box: 22, hint: 1 },
  { n: 2, label: "kratka 6×6, więcej przeszkód", cols: 6, rows: 6, cell: 29, obstacles: 0.26, pathMin: 9, pathMax: 12, turnsMin: 2, box: 20, hint: 1 },
  { n: 3, label: "kratka 8×8, dłuższa droga", cols: 8, rows: 8, cell: 22, obstacles: 0.28, pathMin: 13, pathMax: 17, turnsMin: 3, box: 16, hint: 2 },
  { n: 4, label: "kratka 10×10, zapis „3 →”", cols: 10, rows: 10, cell: 18, obstacles: 0.3, pathMin: 18, pathMax: 24, turnsMin: 4, box: 16, hint: 2 },
] as const;
type Level = (typeof LEVELS)[number];

type Grid = { level: Level; blocked: boolean[][]; start: Cell };

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(xs: readonly T[], r: () => number): T => xs[Math.floor(r() * xs.length)];
const inside = (g: Grid, [c, w]: Cell): boolean => c >= 0 && w >= 0 && c < g.level.cols && w < g.level.rows;
const free = (g: Grid, p: Cell): boolean => inside(g, p) && !g.blocked[p[1]][p[0]];
const step = ([c, w]: Cell, d: Dir): Cell => [c + DELTA[d][0], w + DELTA[d][1]];
const key = ([c, w]: Cell): string => `${c},${w}`;
const turns = (ds: Dir[]): number => ds.filter((d, i) => i > 0 && d !== ds[i - 1]).length;

function randomGrid(level: Level, r: () => number): Grid {
  const blocked = Array.from({ length: level.rows }, () => Array.from({ length: level.cols }, () => r() < level.obstacles));
  const start: Cell = [Math.floor(r() * level.cols), Math.floor(r() * level.rows)];
  blocked[start[1]][start[0]] = false;
  return { level, blocked, start };
}

/** BFS od startu: odległość i liczba najkrótszych dróg do każdej kratki (liczba ucięta na 2 — więcej nie trzeba). */
function bfs(g: Grid): { dist: number[][]; count: number[][] } {
  const dist = g.blocked.map((row) => row.map(() => -1));
  const count = g.blocked.map((row) => row.map(() => 0));
  dist[g.start[1]][g.start[0]] = 0;
  count[g.start[1]][g.start[0]] = 1;
  const queue: Cell[] = [g.start];
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    for (const d of DIRS) {
      const q = step(p, d);
      if (!free(g, q)) continue;
      if (dist[q[1]][q[0]] === -1) {
        dist[q[1]][q[0]] = dist[p[1]][p[0]] + 1;
        queue.push(q);
      }
      if (dist[q[1]][q[0]] === dist[p[1]][p[0]] + 1) count[q[1]][q[0]] = Math.min(2, count[q[1]][q[0]] + count[p[1]][p[0]]);
    }
  }
  return { dist, count };
}

/** Jedyna najkrótsza droga start → meta albo null, gdy dróg tej samej długości jest więcej. */
function uniqueShortest(g: Grid, goal: Cell): Dir[] | null {
  const { dist, count } = bfs(g);
  if (dist[goal[1]][goal[0]] <= 0 || count[goal[1]][goal[0]] !== 1) return null;
  const ds: Dir[] = [];
  let p = goal;
  while (dist[p[1]][p[0]] > 0) {
    const back = DIRS.map((d) => [d, step(p, d)] as const).filter(([, q]) => free(g, q) && dist[q[1]][q[0]] === dist[p[1]][p[0]] - 1);
    if (back.length !== 1) throw new Error("jedna droga musi mieć jednego poprzednika na każdym kroku");
    const [d] = back[0];
    ds.unshift(({ R: "L", L: "R", U: "D", D: "U" } as const)[d]);
    p = back[0][1];
  }
  return ds;
}

type Card = { grid: Grid; dirs: Dir[]; goal: Cell; distractors: Cell[]; attempts: number; targetKind?: string };

/** Zapisz: losuj kratkę i metę, aż najkrótsza droga jest jedna, ma długość i liczbę zakrętów poziomu. */
function zapiszCard(level: Level, r: () => number): Card {
  for (let attempts = 1; attempts < 20000; attempts++) {
    const grid = randomGrid(level, r);
    const goal: Cell = [Math.floor(r() * level.cols), Math.floor(r() * level.rows)];
    if (grid.blocked[goal[1]][goal[0]] || key(goal) === key(grid.start)) continue;
    const dirs = uniqueShortest(grid, goal);
    if (!dirs || dirs.length < level.pathMin || dirs.length > level.pathMax || turns(dirs) < level.turnsMin) continue;
    return { grid, dirs, goal, distractors: [], attempts };
  }
  throw new Error(`Poziom ${level.n}: nie udało się ułożyć kratki Zapisz`);
}

/** Wykonaj: losowa droga bez powrotów po wolnych kratkach; koniec to cel, dwa inne obrazki stoją poza drogą. */
function wykonajCard(level: Level, r: () => number): Card {
  for (let attempts = 1; attempts < 20000; attempts++) {
    const grid = randomGrid(level, r);
    const len = level.pathMin + Math.floor(r() * (level.pathMax - level.pathMin + 1));
    const seen = new Set([key(grid.start)]);
    const dirs: Dir[] = [];
    let p = grid.start;
    while (dirs.length < len) {
      const options = DIRS.filter((d) => free(grid, step(p, d)) && !seen.has(key(step(p, d))));
      if (!options.length) break;
      const last = dirs.at(-1);
      const d = last && options.includes(last) && r() < 0.55 ? last : pick(options, r);
      p = step(p, d);
      seen.add(key(p));
      dirs.push(d);
    }
    if (dirs.length < len || turns(dirs) < level.turnsMin) continue;
    const near = grid.blocked
      .flatMap((row, w) => row.flatMap((isBlocked, c) => (isBlocked ? [] : [[c, w] as Cell])))
      .filter((q) => !seen.has(key(q)) && Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) <= 3);
    if (near.length < 2) continue;
    const a = pick(near, r);
    const b = pick(near.filter((q) => key(q) !== key(a)), r);
    return { grid, dirs, goal: p, distractors: [a, b], attempts };
  }
  throw new Error(`Poziom ${level.n}: nie udało się ułożyć kratki Wykonaj`);
}

/** Zapis „3 →”: kolejne kroki w tym samym kierunku łączą się w jedno polecenie, jak w dyktandzie. */
function groups(ds: Dir[]): [number, Dir][] {
  const out: [number, Dir][] = [];
  for (const d of ds) {
    const last = out.at(-1);
    if (last && last[1] === d) last[0]++;
    else out.push([1, d]);
  }
  return out;
}

// ---------------------------------------------------------------- rysunek

type Box = { what: string; x0: number; y0: number; x1: number; y1: number };
const f = (n: number): string => (Math.round(n * 100) / 100).toString();

class Sheet {
  out: string[] = [`<rect width="${PAGE.w}" height="${PAGE.h}" fill="#fff"/>`];
  boxes: Box[] = [];
  notes: string[] = [];
  add(s: string): void {
    this.out.push(s);
  }
  box(what: string, x0: number, y0: number, x1: number, y1: number): void {
    this.boxes.push({ what, x0, y0, x1, y1 });
  }
  text(x: number, y: number, size: number, t: string, bold = false, color = "#000"): void {
    this.add(`<text x="${f(x)}" y="${f(y + size * SHEET.baselineShift)}" ${FONT} font-size="${f(size)}"${bold ? ' font-weight="bold"' : ""} fill="${color}" text-anchor="middle">${t}</text>`);
  }
  svg(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">\n<defs><pattern id="hatch" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="2.4" stroke="#555" stroke-width="0.6"/></pattern></defs>\n${this.out.join("\n")}\n</svg>\n`;
  }
  checkMargin(name: string): void {
    const lo = PAGE.inset - 1e-6;
    for (const b of this.boxes)
      if (b.x0 < lo || b.y0 < lo || b.x1 > PAGE.w - lo || b.y1 > PAGE.h - lo) throw new Error(`${name}: ${b.what} wychodzi poza margines`);
    const maxY = Math.max(...this.boxes.map((b) => b.y1));
    this.notes.push(`dolny margines ${f(PAGE.h - maxY)} mm`);
  }
}

function band(s: Sheet, instruction: string, withCharacter: boolean): number {
  const lines = instructionLines(instruction);
  if (!withCharacter) {
    lines.forEach((line, i) => s.text(PAGE.w / 2, PAGE.inset + 6 + i * 8, 6.5, line));
    s.box("polecenie", PAGE.inset, PAGE.inset, PAGE.w - PAGE.inset, PAGE.inset + 8 * lines.length);
    return PAGE.inset + 8 * lines.length + BAND_GAP;
  }
  const b = layoutSpeechBand({
    pageWidth: PAGE.w,
    inset: PAGE.inset,
    top: PAGE.inset,
    lines,
    contentLeft: characterContentLeft(CHARACTER),
    contentRight: characterContentRight(CHARACTER),
  });
  const st = SPEECH_BAND.bubbleStroke;
  s.add(`<image href="${CHARACTER_HREF}" x="${f(b.character.x)}" y="${f(b.character.y)}" width="${b.character.width}" height="${b.character.height}" preserveAspectRatio="xMidYMid meet"/>`);
  s.add(`<rect x="${f(b.bubble.x)}" y="${f(b.bubble.y)}" width="${f(b.bubble.width)}" height="${f(b.bubble.height)}" rx="${b.bubble.radius}" fill="#fff" stroke="#000" stroke-width="${st}"/>`);
  const t = b.tail;
  s.add(`<path d="M ${f(t.baseX)} ${f(t.baseTopY)} L ${f(t.tipX)} ${f(t.tipY)} L ${f(t.baseX)} ${f(t.baseBottomY)}" fill="#fff" stroke="#000" stroke-width="${st}"/>`);
  s.add(`<line x1="${f(t.baseX + st)}" y1="${f(t.baseTopY + st)}" x2="${f(t.baseX + st)}" y2="${f(t.baseBottomY - st)}" stroke="#fff" stroke-width="${st * 2.5}"/>`);
  for (const [i, line] of lines.entries()) {
    s.add(`<text x="${f(b.text.x)}" y="${f(b.text.ys[i] + b.text.size * SHEET.baselineShift)}" ${FONT} font-size="${b.text.size}" text-anchor="middle">${line}</text>`);
    if (line.length * b.text.size * SPEECH_BAND.letterWidthRatio > b.text.maxWidth) throw new Error(`polecenie „${line}” nie mieści się w dymku`);
  }
  s.box("dymek", b.bubble.x, b.bubble.y, b.bubble.x + b.bubble.width, b.bubble.y + b.bubble.height);
  return AREA.y;
}

/** Strzałka narysowana kreską (nie znakiem czcionki, żeby telefon i drukarka rysowały ją tak samo). */
function arrow(s: Sheet, cx: number, cy: number, len: number, d: Dir, color = "#000"): void {
  const rot = { R: 0, D: 90, L: 180, U: 270 }[d];
  const h = len / 2;
  const head = len * 0.32;
  s.add(
    `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rot})" stroke="${color}" stroke-width="${SHEET.arrowStroke}" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="${f(-h)}" y1="0" x2="${f(h)}" y2="0"/><polyline points="${f(h - head)},${f(-head)} ${f(h)},0 ${f(h - head)},${f(head)}"/></g>`,
  );
}

function flag(s: Sheet, x: number, y: number, size: number): void {
  const px = x - size * 0.3;
  const top = y - size / 2;
  s.add(`<line x1="${f(px)}" y1="${f(top)}" x2="${f(px)}" y2="${f(y + size / 2)}" stroke="#000" stroke-width="${f(Math.max(0.8, size * 0.06))}" stroke-linecap="round"/>`);
  const w = size * 0.75;
  const fh = size * 0.5;
  const cw = w / 4;
  const ch = fh / 2;
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 2; j++)
      s.add(`<rect x="${f(px + i * cw)}" y="${f(top + j * ch)}" width="${f(cw)}" height="${f(ch)}" fill="${(i + j) % 2 ? "#fff" : "#000"}"/>`);
  s.add(`<rect x="${f(px)}" y="${f(top)}" width="${f(w)}" height="${f(fh)}" fill="none" stroke="#000" stroke-width="0.4"/>`);
}

type Shape = "gwiazdka" | "serce" | "koło";
function shape(s: Sheet, kind: Shape, cx: number, cy: number, r: number): void {
  const st = `fill="none" stroke="#000" stroke-width="${f(Math.max(0.9, r * 0.12))}" stroke-linejoin="round"`;
  if (kind === "koło") s.add(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.8)}" ${st}/>`);
  else if (kind === "gwiazdka") {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.42 : r;
      return `${f(cx + rr * Math.cos(a))},${f(cy + rr * Math.sin(a))}`;
    });
    s.add(`<polygon points="${pts.join(" ")}" ${st}/>`);
  } else
    s.add(`<path transform="translate(${f(cx)} ${f(cy)}) scale(${f(r * 0.95)})" d="M 0 0.85 C -1.3 0 -0.7 -1 0 -0.4 C 0.7 -1 1.3 0 0 0.85 Z" fill="none" stroke="#000" stroke-width="${f(Math.max(0.9, r * 0.12) / (r * 0.95))}" stroke-linejoin="round"/>`);
}

type Mode = "zapisz" | "wykonaj";
type Spec = {
  file: string;
  title: string;
  mode: Mode;
  level: Level;
  seed: number;
  notation?: "pojedyncze" | "grupy";
  targets?: boolean; // Wykonaj: obrazki-cele (domyślnie) albo krzyżyk na końcu
  character?: boolean;
  hatch?: boolean;
  hint?: number; // Zapisz: ile pierwszych pól jest wpisanych szarym jako przykład (domyślnie z poziomu)
};

function instructionOf(sp: Spec): string {
  if (sp.mode === "zapisz")
    return sp.notation === "grupy" ? "Zapisz drogę do mety. Liczba kratek i strzałka." : "Zapisz strzałkami drogę do mety. Jedna strzałka to jeden krok.";
  return sp.targets === false ? "Rysuj drogę według strzałek. Postaw X na końcu." : "Idź za strzałkami. Zakreśl, dokąd dojdziesz.";
}

function drawCard(sp: Spec, card: Card): Sheet {
  const s = new Sheet();
  const L = sp.level;
  const withCharacter = sp.character !== false;
  const areaTop = band(s, instructionOf(sp), withCharacter);
  const notation = sp.notation ?? "pojedyncze";
  const items = notation === "grupy" ? groups(card.dirs) : card.dirs.map((d) => [1, d] as [number, Dir]);
  const bw = notation === "grupy" ? SHEET.groupBox.w : L.box;
  const bh = notation === "grupy" ? SHEET.groupBox.h : L.box;
  const perRow = Math.floor((AREA.w + SHEET.boxGap) / (bw + SHEET.boxGap));
  const boxRows = Math.ceil(items.length / perRow);
  const gw = L.cols * L.cell;
  const gh = L.rows * L.cell;
  const blockH = gh + SHEET.gapUnderGrid + boxRows * bh + (boxRows - 1) * SHEET.boxGap;
  const areaH = PAGE.h - PAGE.inset - areaTop;
  const top = areaTop + Math.max(0, (areaH - blockH) / 2);
  const gx = (PAGE.w - gw) / 2;
  const cellXY = ([c, w]: Cell): [number, number] => [gx + (c + 0.5) * L.cell, top + (w + 0.5) * L.cell];

  // kratka
  for (let w = 0; w < L.rows; w++)
    for (let c = 0; c < L.cols; c++) {
      const fill = card.grid.blocked[w][c] ? (sp.hatch ? "url(#hatch)" : SHEET.obstacleFill) : "#fff";
      s.add(`<rect x="${f(gx + c * L.cell)}" y="${f(top + w * L.cell)}" width="${L.cell}" height="${L.cell}" fill="${fill}" stroke="#000" stroke-width="${SHEET.gridStroke}"/>`);
    }
  s.add(`<rect x="${f(gx)}" y="${f(top)}" width="${gw}" height="${gh}" fill="none" stroke="#000" stroke-width="${SHEET.frameStroke}"/>`);
  s.box("kratka", gx, top, gx + gw, top + gh);

  // start: postać albo napis „Start”
  const [sx, sy] = cellXY(card.grid.start);
  if (withCharacter) {
    const k = L.cell * 0.88;
    s.add(`<image href="${CHARACTER_HREF}" x="${f(sx - k / 2)}" y="${f(sy - k / 2)}" width="${f(k)}" height="${f(k)}" preserveAspectRatio="xMidYMid meet"/>`);
  } else {
    s.add(`<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(L.cell * 0.36)}" fill="none" stroke="#000" stroke-width="1"/>`);
    s.text(sx, sy, L.cell * 0.22, "Start", true);
  }

  // meta (Zapisz) albo obrazki-cele / nic (Wykonaj)
  if (sp.mode === "zapisz") {
    const [mx, my] = cellXY(card.goal);
    flag(s, mx, my, L.cell * 0.66);
  } else if (sp.targets !== false) {
    // Który obrazek jest celem, losuje się z kartą, żeby odpowiedź nie była zawsze tym samym kształtem.
    const all: Shape[] = ["gwiazdka", "serce", "koło"];
    const first = sp.seed % 3;
    const kinds = [...all.slice(first), ...all.slice(0, first)];
    card.targetKind = kinds[0];
    [card.goal, ...card.distractors].forEach((p, i) => {
      const [x, y] = cellXY(p);
      shape(s, kinds[i], x, y, L.cell * 0.32);
    });
  }

  // pola strzałek
  const y0 = top + gh + SHEET.gapUnderGrid;
  items.forEach(([n, d], i) => {
    const row = Math.floor(i / perRow);
    const inRow = Math.min(perRow, items.length - row * perRow);
    const rowW = inRow * bw + (inRow - 1) * SHEET.boxGap;
    const x = (PAGE.w - rowW) / 2 + (i % perRow) * (bw + SHEET.boxGap);
    const y = y0 + row * (bh + SHEET.boxGap);
    s.add(`<rect x="${f(x)}" y="${f(y)}" width="${bw}" height="${bh}" rx="1.5" fill="#fff" stroke="#000" stroke-width="${SHEET.boxStroke}"/>`);
    s.box("pole strzałki", x, y, x + bw, y + bh);
    // Zapisz: pierwsze pola wpisane szarym jako przykład zapisu (bledsze niż druk, jak podpowiedź w symetrii).
    const hinted = sp.mode === "zapisz" && i < (sp.hint ?? L.hint);
    if (sp.mode === "wykonaj" || hinted) {
      const color = hinted ? SHEET.hintColor : "#000";
      if (notation === "grupy") {
        s.text(x + bw * 0.3, y + bh / 2, bh * 0.55, String(n), true, color);
        arrow(s, x + bw * 0.68, y + bh / 2, bh * 0.55, d, color);
      } else arrow(s, x + bw / 2, y + bh / 2, bw * 0.6, d, color);
    }
  });
  return s;
}

// ---------------------------------------------------------------- sprawdzenia i pomiar

function walk(card: Card): Cell[] {
  const cells: Cell[] = [card.grid.start];
  for (const d of card.dirs) cells.push(step(cells.at(-1)!, d));
  return cells;
}

function checkCard(sp: Spec, card: Card): void {
  const cells = walk(card);
  if (cells.some((p) => !free(card.grid, p))) throw new Error(`${sp.file}: droga wchodzi w przeszkodę albo poza kratkę`);
  if (new Set(cells.map(key)).size !== cells.length) throw new Error(`${sp.file}: droga wraca na tę samą kratkę`);
  if (key(cells.at(-1)!) !== key(card.goal)) throw new Error(`${sp.file}: droga nie kończy się na mecie / celu`);
  if (sp.mode === "zapisz") {
    const again = uniqueShortest(card.grid, card.goal);
    if (!again || again.join("") !== card.dirs.join("")) throw new Error(`${sp.file}: najkrótsza droga nie jest jedna`);
  } else if (card.distractors.some((q) => cells.some((p) => key(p) === key(q)))) throw new Error(`${sp.file}: obrazek-zmyłka leży na drodze`);
}

const stats: string[] = [];
for (const lv of LEVELS) {
  for (const mode of ["zapisz", "wykonaj"] as const) {
    const r = rng(7000 + lv.n);
    const n = 300;
    let attempts = 0;
    const t0 = performance.now();
    for (let i = 0; i < n; i++) attempts += (mode === "zapisz" ? zapiszCard(lv, r) : wykonajCard(lv, r)).attempts;
    const ms = (performance.now() - t0) / n;
    stats.push(`Poziom ${lv.n} ${mode === "zapisz" ? "Zapisz" : "Wykonaj"}: średnio ${f(attempts / n)} losowań kratki na kartę, ${f(ms)} ms na kartę`);
  }
}
console.log(stats.join("\n"));

const L = (n: number): Level => LEVELS[n - 1];
const specs: Spec[] = [
  { file: "zapisz-poziom-1", title: "Zapisz · Poziom 1", mode: "zapisz", level: L(1), seed: 11 },
  { file: "zapisz-poziom-2", title: "Zapisz · Poziom 2", mode: "zapisz", level: L(2), seed: 12 },
  { file: "zapisz-poziom-3", title: "Zapisz · Poziom 3", mode: "zapisz", level: L(3), seed: 13 },
  { file: "zapisz-poziom-4", title: "Zapisz · Poziom 4 (zapis „3 →”)", mode: "zapisz", level: L(4), seed: 14, notation: "grupy" },
  { file: "wykonaj-poziom-1", title: "Wykonaj · Poziom 1", mode: "wykonaj", level: L(1), seed: 21 },
  { file: "wykonaj-poziom-2", title: "Wykonaj · Poziom 2", mode: "wykonaj", level: L(2), seed: 22 },
  { file: "wykonaj-poziom-3", title: "Wykonaj · Poziom 3", mode: "wykonaj", level: L(3), seed: 23 },
  { file: "wykonaj-poziom-4", title: "Wykonaj · Poziom 4 (zapis „3 →”)", mode: "wykonaj", level: L(4), seed: 24, notation: "grupy" },
  { file: "wariant-zapisz-poziom-1-bez-podpowiedzi", title: "Wariant: Zapisz · Poziom 1 bez podpowiedzi", mode: "zapisz", level: L(1), seed: 11, hint: 0 },
  { file: "wariant-zapisz-poziom-3-bez-podpowiedzi", title: "Wariant: Zapisz · Poziom 3 bez podpowiedzi", mode: "zapisz", level: L(3), seed: 13, hint: 0 },
  { file: "wariant-zapisz-poziom-4-bez-podpowiedzi", title: "Wariant: Zapisz · Poziom 4 bez podpowiedzi", mode: "zapisz", level: L(4), seed: 14, notation: "grupy", hint: 0 },
  { file: "wariant-zapisz-poziom-1-bez-postaci", title: "Wariant: postać „Brak” (start to kółko „Start”)", mode: "zapisz", level: L(1), seed: 11, character: false },
];

const blocks: string[] = [];
for (const sp of specs) {
  const r = rng(2026 + sp.seed);
  const card = sp.mode === "zapisz" ? zapiszCard(sp.level, r) : wykonajCard(sp.level, r);
  checkCard(sp, card);
  const s = drawCard(sp, card);
  s.checkMargin(sp.file);
  const svg = s.svg();
  writeFileSync(`${OUT}/mockup-${sp.file}.svg`, svg);
  const answer = sp.mode === "zapisz" ? card.dirs.map((d) => ARROW[d]).join(" ") : `kończy na: ${card.targetKind ?? "X w ostatniej kratce"}`;
  const info = `${card.dirs.length} kroków, ${turns(card.dirs)} zakrętów, ${groups(card.dirs).length} poleceń „n →”; ${s.notes.join("; ")}<br>odpowiedź: ${answer}`;
  console.log(sp.file, "|", info.replace("<br>", " | "));
  blocks.push(`<figure><figcaption><b>${sp.title}</b> (${sp.level.label})<br><small>${info}</small></figcaption>${svg.replace(/width="210mm" height="297mm"/, "")}</figure>`);
}

const levelRows = LEVELS.map(
  (l) => `<tr><td>Poziom ${l.n}</td><td>${l.cols}×${l.rows}</td><td>${l.cell} mm</td><td>${Math.round(l.obstacles * 100)}%</td><td>${l.pathMin}–${l.pathMax}</td><td>${l.turnsMin}+</td><td>${l.n === 4 ? "„3 →”" : "pojedyncze strzałki"}</td><td>${l.hint} pierwsze pole/pola szare</td></tr>`,
).join("");
writeFileSync(
  `${OUT}/mockups.html`,
  `<!doctype html><meta charset="utf-8"><title>Karta kodowania – makiety (S-42)</title>
<style>body{font-family:Arial;margin:16px}.g{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}figure{margin:0;border:1px solid #ccc;padding:8px}svg{width:100%;height:auto;border:1px solid #eee}figcaption{font-size:14px;margin-bottom:6px;min-height:5.5em}table{border-collapse:collapse;margin:8px 0}td,th{border:1px solid #ccc;padding:3px 8px}</style>
<h1>Karta kodowania – makiety (A4, drukuj w 100%)</h1>
<p>Rząd 1: tryb <b>Zapisz</b> (dziecko zapisuje strzałkami najkrótszą drogę kota do mety; pól jest tyle, ile kroków). Rząd 2: tryb <b>Wykonaj</b> (dziecko idzie za strzałkami i zakreśla obrazek, na którym skończyło). Pierwsze pola w Zapisz są wpisane szarym jako przykład. Rząd 3: te same karty bez podpowiedzi i karta bez postaci. Postać: Kot.</p>
<table><tr><th>Poziom</th><th>Kratka</th><th>Bok kratki</th><th>Przeszkody</th><th>Kroków</th><th>Zakrętów</th><th>Zapis</th><th>Podpowiedź (Zapisz)</th></tr>${levelRows}</table>
<p><small>${stats.join("<br>")}</small></p>
<div class="g">${blocks.join("")}</div>`,
);
