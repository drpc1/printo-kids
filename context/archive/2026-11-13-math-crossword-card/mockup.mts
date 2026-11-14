// Makieta karty „Krzyżówka matematyczna” (S-40), wersja 2: układ jak w zeszytach ćwiczeń z krzyżówkami
// liczbowymi. Każde pole to kratka (liczba, znak działania, „=”), działania „a ○ b = c” biegną w prawo albo w dół
// i krzyżują się we wspólnych polach z liczbami, jak słowa w krzyżówce. Generator układa działania jedno po drugim
// (każde nowe przecina już stojące), wpisuje prawdziwe liczby i zostawia puste pola tak, że dziecko dochodzi do
// wszystkich bez zgadywania (zawsze jest działanie z jedną brakującą liczbą), więc rozwiązanie jest jedno.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/math-crossword-card/mockup.mts
// Drukuj na A4 w 100%. Przerywany prostokąt u góry to pas na postać i dymek (26 mm).
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const PAGE = { inset: 10, band: 26, gap: 6 };
const AREA = { x: PAGE.inset, y: PAGE.inset + PAGE.band + PAGE.gap, w: 190, h: 297 - PAGE.inset * 2 - PAGE.band - PAGE.gap };

function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Op = "+" | "−" | "·" | ":";
type Eq = { a: number; b: number; c: number; op: Op }; // identyfikatory pól z liczbami
type Dir = 0 | 1; // 0 = w prawo, 1 = w dół
type Cell = { kind: "num"; id: number; dirs: Set<Dir> } | { kind: "op"; op: Op } | { kind: "eq" };

function compute(a: number, op: Op, b: number): number {
  if (op === "+") return a + b;
  if (op === "−") return a - b;
  if (op === "·") return a * b;
  return a % b === 0 ? a / b : NaN;
}

type Level = {
  id: string;
  name: string;
  ops: Op[];
  max: number;
  cols: number;
  rows: number;
  eqs: number;
  maxCell: number;
  share: number;
  maxBlankPerEq: number;
  maxDepth: number;
  note: string;
};

const LEVELS: Level[] = [
  // Siedem poziomów, zwykle zmienia się jeden parametr naraz. Cel projektu (nie etykieta) w nawiasie.
  // share = docelowa część pustych liczb; maxDepth = najdłuższy łańcuch (1: każde puste pole wynika wprost
  // z podanych liczb; 2: czasem najpierw trzeba wyliczyć inne puste pole; itd.).
  { id: "poziom-1", name: "Poziom 1", ops: ["+"], max: 10, cols: 7, rows: 9, eqs: 5, maxCell: 26, share: 0.4, maxBlankPerEq: 1, maxDepth: 1, note: "dodawanie do 10, mała krzyżówka, duża kratka (5–6 lat)" },
  { id: "poziom-2", name: "Poziom 2", ops: ["+", "−"], max: 10, cols: 8, rows: 10, eqs: 9, maxCell: 24, share: 0.45, maxBlankPerEq: 1, maxDepth: 1, note: "dodawanie i odejmowanie do 10 (6 lat, zerówka)" },
  { id: "poziom-3", name: "Poziom 3", ops: ["+", "−"], max: 20, cols: 11, rows: 14, eqs: 13, maxCell: 17, share: 0.5, maxBlankPerEq: 2, maxDepth: 2, note: "dodawanie i odejmowanie do 20 (7 lat, klasa 1)" },
  { id: "poziom-4", name: "Poziom 4", ops: ["+", "−"], max: 100, cols: 11, rows: 14, eqs: 12, maxCell: 16, share: 0.5, maxBlankPerEq: 2, maxDepth: 3, note: "dodawanie i odejmowanie do 100 (8 lat, klasa 2)" },
  { id: "poziom-5", name: "Poziom 5", ops: ["·"], max: 30, cols: 11, rows: 14, eqs: 12, maxCell: 16, share: 0.5, maxBlankPerEq: 2, maxDepth: 3, note: "mnożenie do 30 (8 lat, klasa 2)" },
  { id: "poziom-6", name: "Poziom 6", ops: ["·", ":"], max: 50, cols: 13, rows: 17, eqs: 15, maxCell: 14.5, share: 0.55, maxBlankPerEq: 2, maxDepth: 4, note: "mnożenie i dzielenie do 50, jak na zdjęciu (8–9 lat)" },
  { id: "poziom-7", name: "Poziom 7", ops: ["+", "−", "·", ":"], max: 100, cols: 14, rows: 18, eqs: 20, maxCell: 13.5, share: 0.6, maxBlankPerEq: 2, maxDepth: 5, note: "wszystkie cztery działania do 100 (9 lat, klasa 3)" },
];

const KINDS = ["num", "op", "num", "eq", "num"] as const;
const key = (r: number, c: number) => `${r},${c}`;

type Layout = { cells: Map<string, Cell>; eqs: Eq[]; n: number };

function tryLayout(lv: Level, rand: () => number): Layout {
  const cells = new Map<string, Cell>();
  const eqs: Eq[] = [];
  let n = 0;
  let box = { r0: 0, r1: 0, c0: 0, c1: 0 };
  const place = (r: number, c: number, d: Dir) => {
    const ids: number[] = [];
    const op = lv.ops[Math.floor(rand() * lv.ops.length)];
    KINDS.forEach((k, i) => {
      const rr = r + (d ? i : 0);
      const cc = c + (d ? 0 : i);
      const ex = cells.get(key(rr, cc));
      if (k === "num") {
        if (ex && ex.kind === "num") {
          ex.dirs.add(d);
          ids.push(ex.id);
        } else {
          cells.set(key(rr, cc), { kind: "num", id: n, dirs: new Set([d]) });
          ids.push(n++);
        }
      } else cells.set(key(rr, cc), k === "op" ? { kind: "op", op } : { kind: "eq" });
      box = { r0: Math.min(box.r0, rr), r1: Math.max(box.r1, rr), c0: Math.min(box.c0, cc), c1: Math.max(box.c1, cc) };
    });
    eqs.push({ a: ids[0], b: ids[1], c: ids[2], op });
  };
  const fits = (r: number, c: number, d: Dir): boolean => {
    const dr = d ? 1 : 0;
    const dc = d ? 0 : 1;
    if (cells.has(key(r - dr, c - dc)) || cells.has(key(r + 5 * dr, c + 5 * dc))) return false;
    let cross = 0;
    let nb = { ...box };
    for (let i = 0; i < 5; i++) {
      const rr = r + i * dr;
      const cc = c + i * dc;
      const ex = cells.get(key(rr, cc));
      if (ex) {
        if (KINDS[i] !== "num" || ex.kind !== "num" || ex.dirs.has(d)) return false;
        cross++;
      } else if (cells.has(key(rr + dc, cc + dr)) || cells.has(key(rr - dc, cc - dr))) return false;
      nb = { r0: Math.min(nb.r0, rr), r1: Math.max(nb.r1, rr), c0: Math.min(nb.c0, cc), c1: Math.max(nb.c1, cc) };
    }
    if (nb.r1 - nb.r0 + 1 > lv.rows || nb.c1 - nb.c0 + 1 > lv.cols) return false;
    return cross >= 1 && cross <= 2;
  };
  place(0, 0, 0);
  for (let step = 0; step < 200 && eqs.length < lv.eqs; step++) {
    const opts: [number, number, Dir][] = [];
    for (const [k, cell] of cells) {
      if (cell.kind !== "num" || cell.dirs.size > 1) continue;
      const [r, c] = k.split(",").map(Number);
      const d: Dir = cell.dirs.has(0) ? 1 : 0;
      for (const p of [0, 2, 4]) {
        const sr = d ? r - p : r;
        const sc = d ? c : c - p;
        if (fits(sr, sc, d)) opts.push([sr, sc, d]);
      }
    }
    if (opts.length === 0) break;
    // jedna z kilku opcji, które najlepiej trzymają proporcje strony (żeby krzyżówka nie była wąskim paskiem)
    const score = ([r, c, d]: [number, number, Dir]) => {
      const h = Math.max(box.r1, r + (d ? 4 : 0)) - Math.min(box.r0, r) + 1;
      const w = Math.max(box.c1, c + (d ? 0 : 4)) - Math.min(box.c0, c) + 1;
      return Math.abs(h / lv.rows - w / lv.cols) + rand() * 0.15;
    };
    const scored = opts.map((o) => [score(o), o] as const).sort((x, y) => x[0] - y[0]);
    const [r, c, d] = scored[Math.floor(rand() * Math.min(4, scored.length))][1];
    place(r, c, d);
  }
  // przesunięcie do (0,0)
  const moved = new Map<string, Cell>();
  for (const [k, cell] of cells) {
    const [r, c] = k.split(",").map(Number);
    moved.set(key(r - box.r0, c - box.c0), cell);
  }
  return { cells: moved, eqs, n };
}

// Wpisuje liczby: działania po kolei (każde przecina wcześniejsze), losując zgodny trójkąt a ○ b = c.
function fill(lv: Level, lay: Layout, rand: () => number): number[] | null {
  const vals: (number | null)[] = Array(lay.n).fill(null);
  let budget = 20000;
  const used = new Set<string>();
  const go = (k: number): boolean => {
    if (k === lay.eqs.length) return true;
    if (--budget < 0) return false;
    const e = lay.eqs[k];
    const opts: [number, number, number][] = [];
    for (let a = 1; a <= lv.max; a++)
      for (let b = 1; b <= lv.max; b++) {
        if ((e.op === "·" || e.op === ":") && (a < 2 || b < 2)) continue;
        // tabliczka mnożenia: czynniki do 10, a przy dzieleniu dzielnik i iloraz do 10
        if (e.op === "·" && (a > 10 || b > 10)) continue;
        if (e.op === ":" && (b > 10 || a / b > 10)) continue;
        if (e.op === ":" && a === b) continue;
        const c = compute(a, e.op, b);
        if (!(c >= 1 && c <= lv.max)) continue;
        if ((vals[e.a] ?? a) !== a || (vals[e.b] ?? b) !== b || (vals[e.c] ?? c) !== c) continue;
        opts.push([a, b, c]);
      }
    // to samo działanie (np. 1 + 1 = 2) drugi raz tylko wtedy, gdy nie ma innego
    const sig = (a: number, b: number) => `${a}${e.op}${b}`;
    opts.sort(() => rand() - 0.5);
    opts.sort((x, y) => Number(used.has(sig(x[0], x[1]))) - Number(used.has(sig(y[0], y[1]))));
    const before = [vals[e.a], vals[e.b], vals[e.c]];
    for (const [a, b, c] of opts.slice(0, 12)) {
      vals[e.a] = a;
      vals[e.b] = b;
      vals[e.c] = c;
      const fresh = !used.has(sig(a, b));
      used.add(sig(a, b));
      if (go(k + 1)) return true;
      if (fresh) used.delete(sig(a, b));
      [vals[e.a], vals[e.b], vals[e.c]] = before;
    }
    return false;
  };
  return go(0) ? (vals as number[]) : null;
}

// Czy dziecko dojdzie do wszystkiego bez zgadywania: powtarzaj „działanie z jedną brakującą liczbą”.
// Zwraca długość najdłuższego łańcucha (1 = wszystko wprost z podanych liczb) albo 0, gdy trzeba zgadywać.
function chainDepth(lv: Level, eqs: Eq[], vals: number[], blank: boolean[]): number {
  const known = vals.map((v, i) => (blank[i] ? null : v));
  let depth = 0;
  for (;;) {
    // jedna runda = pola, które da się wyliczyć z tego, co już znane przed tą rundą
    const found: [number, number][] = [];
    for (const e of eqs) {
      const unk = [e.a, e.b, e.c].filter((i) => known[i] === null);
      if (unk.length !== 1) continue;
      const u = unk[0];
      const sols: number[] = [];
      for (let v = 1; v <= lv.max; v++) {
        known[u] = v;
        if (compute(known[e.a]!, e.op, known[e.b]!) === known[e.c]) sols.push(v);
      }
      known[u] = null;
      if (sols.length === 1) found.push([u, sols[0]]);
    }
    if (found.length === 0) break;
    for (const [u, v] of found) known[u] = v;
    depth++;
  }
  return known.every((v, i) => v === vals[i]) ? Math.max(depth, 1) : 0;
}

function solvable(lv: Level, eqs: Eq[], vals: number[], blank: boolean[]): boolean {
  const d = chainDepth(lv, eqs, vals, blank);
  return d > 0 && d <= lv.maxDepth;
}

function chooseBlanks(lv: Level, lay: Layout, vals: number[], rand: () => number): boolean[] {
  const blank: boolean[] = Array(lay.n).fill(false);
  const order = vals.map((_, i) => i).sort(() => rand() - 0.5);
  const target = Math.round(lay.n * lv.share);
  let count = 0;
  for (const i of order) {
    if (count >= target) break;
    blank[i] = true;
    const perEqOk = lay.eqs.every((e) => [e.a, e.b, e.c].filter((j) => blank[j]).length <= lv.maxBlankPerEq);
    if (perEqOk && solvable(lv, lay.eqs, vals, blank)) count++;
    else blank[i] = false;
  }
  return blank;
}

function generate(lv: Level, seed: number) {
  const rand = rng(seed);
  for (let round = 0; round < 300; round++) {
    // najwięcej działań, a przy remisie układ, który najlepiej wypełnia stronę (większa kratka nie jest potrzebna)
    const fillRatio = (lay: Layout) => {
      let h = 0;
      let w = 0;
      for (const k of lay.cells.keys()) {
        const [r, c] = k.split(",").map(Number);
        h = Math.max(h, r + 1);
        w = Math.max(w, c + 1);
      }
      return Math.min(w / lv.cols, h / lv.rows);
    };
    let best: Layout | null = null;
    for (let t = 0; t < 60; t++) {
      const lay = tryLayout(lv, rand);
      if (!best || lay.eqs.length > best.eqs.length || (lay.eqs.length === best.eqs.length && fillRatio(lay) > fillRatio(best))) best = lay;
    }
    for (let t = 0; t < 30; t++) {
      const vals = fill(lv, best!, rand);
      if (vals) return { lay: best!, vals, blank: chooseBlanks(lv, best!, vals, rand) };
    }
  }
  throw new Error(`brak liczb dla ${lv.id}`);
}

function render(lv: Level, seed: number): { svg: string; info: string } {
  const { lay, vals, blank } = generate(lv, seed);
  for (const e of lay.eqs)
    if (compute(vals[e.a], e.op, vals[e.b]) !== vals[e.c]) throw new Error(`fałszywe działanie w ${lv.id}`);
  if (!solvable(lv, lay.eqs, vals, blank)) throw new Error(`nie da się rozwiązać bez zgadywania: ${lv.id}`);
  let rows = 0;
  let cols = 0;
  for (const k of lay.cells.keys()) {
    const [r, c] = k.split(",").map(Number);
    rows = Math.max(rows, r + 1);
    cols = Math.max(cols, c + 1);
  }
  const s = Math.min(lv.maxCell, AREA.w / cols, AREA.h / rows);
  const x0 = AREA.x + (AREA.w - cols * s) / 2;
  const y0 = AREA.y + (AREA.h - rows * s) / 2;
  const out: string[] = [
    `<rect width="210" height="297" fill="#fff"/>`,
    `<rect x="${PAGE.inset}" y="${PAGE.inset}" width="190" height="${PAGE.band}" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="2 2"/>`,
    `<text x="${PAGE.inset + 4}" y="${PAGE.inset + 6}" ${FONT} font-size="3.5" fill="#777">miejsce na postać i dymek</text>`,
    `<text x="105" y="${PAGE.inset + 17}" ${FONT} font-size="5" font-weight="bold" text-anchor="middle">Uzupełnij krzyżówkę. Działania czytaj w prawo i w dół.</text>`,
  ];
  for (const [k, cell] of lay.cells) {
    const [r, c] = k.split(",").map(Number);
    const x = x0 + c * s;
    const y = y0 + r * s;
    out.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${s.toFixed(2)}" height="${s.toFixed(2)}" fill="#fff" stroke="#000" stroke-width="0.45"/>`);
    let t = "";
    let bold = false;
    if (cell.kind === "num") {
      if (blank[cell.id]) continue;
      t = String(vals[cell.id]);
      bold = true;
    } else {
      t = cell.kind === "op" ? cell.op : "=";
      bold = t === "·" || t === ":"; // cienka kropka i dwukropek giną na wydruku
    }
    const size = s * (t.length > 2 ? 0.42 : 0.52);
    out.push(
      `<text x="${(x + s / 2).toFixed(2)}" y="${(y + s / 2 + size * 0.36).toFixed(2)}" ${FONT} font-size="${size.toFixed(2)}" ${bold ? 'font-weight="bold"' : ""} text-anchor="middle">${t}</text>`,
    );
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">\n${out.join("\n")}\n</svg>\n`;
  const blanks = blank.filter(Boolean).length;
  const depth = chainDepth(lv, lay.eqs, vals, blank);
  return { svg, info: `${lay.eqs.length} działań, ${lay.n} liczb, ${blanks} pustych, łańcuch ${depth}, siatka ${cols}×${rows}, kratka ${s.toFixed(1)} mm` };
}

const blocks: string[] = [];
for (const [i, lv] of LEVELS.entries()) {
  const { svg, info } = render(lv, 2026 + i * 13);
  const file = `mockup-${lv.id}.svg`;
  writeFileSync(`${OUT}/${file}`, svg);
  blocks.push(`<figure><figcaption><b>${lv.name}</b>: ${lv.note}<br><small>${info}</small></figcaption>${svg.replace(/width="210mm" height="297mm"/, "")}</figure>`);
  console.log(file, info);
}
writeFileSync(
  `${OUT}/mockups.html`,
  `<!doctype html><meta charset="utf-8"><title>Krzyżówka matematyczna – makiety v2</title>
<style>body{font-family:Arial;margin:16px}.g{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}figure{margin:0;border:1px solid #ccc;padding:8px}svg{width:100%;height:auto;border:1px solid #eee}figcaption{font-size:14px;margin-bottom:6px}</style>
<h1>Krzyżówka matematyczna – makiety v2 (A4, drukuj w 100%)</h1><div class="g">${blocks.join("")}</div>`,
);
