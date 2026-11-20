// Makieta karty „Labirynt liczbowy” (S-49) przed planem. Pisze pliki SVG A4, mockups.html i stats.md do tego folderu.
// Generator jest prawdziwy: losuje drogę bez samoprzecięć od lewego górnego do prawego dolnego rogu przez dużą część
// kratki, wpisuje na niej kolejne liczby (1, 2, 3… albo co 2, co 5), a resztę kratek wypełnia pułapkami.
// Reguła jednej drogi (sprawdzana osobno, niezależnie od budowy): idąc od startu, z każdej kratki drogi dokładnie jedna
// sąsiednia kratka (bez skosów) ma następną liczbę, a ostatnia liczba stoi na mecie.
// Pułapki: liczba z zakresu poziomu, bliska liczbom drogi w sąsiedztwie (kusi), ale nigdy następna liczba którejkolwiek
// sąsiedniej kratki drogi.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/number-maze-card/mockup.mts
// Drukuj na A4 w 100%. Kółko i dymek u góry zastępują postać przy poleceniu (US-21).
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const PAGE = { w: 210, h: 297, inset: 10, band: 26, bandGap: 8, label: 9 };
const MAX_CELL = 30;

interface Level {
  name: string;
  title: string;
  cols: number;
  rows: number;
  /** Pierwsza liczba i krok: 1, 2, 3… albo 2, 4, 6… albo 5, 10, 15… */
  first: number;
  step: number;
  /** Ile liczb ma droga (pierwsza … ostatnia). */
  count: number;
  /** Jak daleko od liczb drogi w sąsiedztwie może leżeć pułapka (w krokach poziomu). */
  near: number;
  instruction: string;
  seed: number;
}

const LEVELS: readonly Level[] = [
  { name: "poziom-1", title: "Poziom 1: 1–15, kratka 5×5", cols: 5, rows: 5, first: 1, step: 1, count: 15, near: 3, instruction: "Idź po liczbach 1, 2, 3… od startu do mety.", seed: 11 },
  { name: "poziom-2", title: "Poziom 2: 1–20, kratka 5×6", cols: 5, rows: 6, first: 1, step: 1, count: 20, near: 3, instruction: "Idź po liczbach 1, 2, 3… od startu do mety.", seed: 23 },
  { name: "poziom-3", title: "Poziom 3: 1–30, kratka 6×7", cols: 6, rows: 7, first: 1, step: 1, count: 30, near: 2, instruction: "Idź po liczbach 1, 2, 3… od startu do mety.", seed: 37 },
  { name: "poziom-4", title: "Poziom 4: 1–50, kratka 8×9", cols: 8, rows: 9, first: 1, step: 1, count: 50, near: 2, instruction: "Idź po liczbach 1, 2, 3… od startu do mety.", seed: 41 },
  { name: "poziom-5", title: "Poziom 5: co 2, od 2 do 60, kratka 6×7", cols: 6, rows: 7, first: 2, step: 2, count: 30, near: 2, instruction: "Licz co 2: 2, 4, 6… od startu do mety.", seed: 53 },
  { name: "poziom-6", title: "Poziom 6: co 5, od 5 do 200, kratka 7×8", cols: 7, rows: 8, first: 5, step: 5, count: 40, near: 2, instruction: "Licz co 5: 5, 10, 15… od startu do mety.", seed: 67 },
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
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type Cell = number; // r * cols + c

function neighbours(cell: Cell, cols: number, rows: number): Cell[] {
  const r = Math.floor(cell / cols);
  const c = cell % cols;
  const out: Cell[] = [];
  if (r > 0) out.push(cell - cols);
  if (r < rows - 1) out.push(cell + cols);
  if (c > 0) out.push(cell - 1);
  if (c < cols - 1) out.push(cell + 1);
  return out;
}

/** Droga bez samoprzecięć z (0,0) do (rows-1, cols-1) przez dokładnie `count` kratek. Losowe DFS z przycinaniem. */
function randomPath(level: Level, rand: () => number): { path: Cell[]; nodes: number } | null {
  const { cols, rows, count } = level;
  const start = 0;
  const goal = cols * rows - 1;
  const used = new Uint8Array(cols * rows);
  const path: Cell[] = [start];
  used[start] = 1;
  let nodes = 0;
  const LIMIT = 200_000;
  const dist = (a: Cell) => Math.abs(Math.floor(a / cols) - (rows - 1)) + Math.abs((a % cols) - (cols - 1));

  // Czy z `from` da się dojść do mety po wolnych kratkach, i czy wolnych kratek osiągalnych wystarczy.
  const reachable = (from: Cell, need: number): boolean => {
    const seen = new Uint8Array(cols * rows);
    const stack = [from];
    seen[from] = 1;
    let size = 0;
    let goalSeen = false;
    while (stack.length) {
      const x = stack.pop()!;
      size++;
      if (x === goal) goalSeen = true;
      for (const n of neighbours(x, cols, rows)) if (!used[n] && !seen[n]) ((seen[n] = 1), stack.push(n));
    }
    return goalSeen && size - 1 >= need;
  };

  const dfs = (): boolean => {
    if (++nodes > LIMIT) return false;
    const cur = path[path.length - 1];
    const left = count - path.length; // ile kratek jeszcze
    if (left === 0) return cur === goal;
    for (const n of shuffle(neighbours(cur, cols, rows), rand)) {
      if (used[n]) continue;
      if (n === goal && left !== 1) continue;
      const d = dist(n);
      const rest = left - 1;
      if (d > rest || (rest - d) % 2 !== 0) continue;
      used[n] = 1;
      path.push(n);
      if (rest === 0 || reachable(n, rest)) if (dfs()) return true;
      path.pop();
      used[n] = 0;
    }
    return false;
  };
  return dfs() ? { path, nodes } : null;
}

interface Card {
  values: number[];
  path: Cell[];
  tempting: number;
  traps: number;
  attempts: number;
  nodes: number;
  ms: number;
}

function build(level: Level, rand: () => number): Card {
  const t0 = performance.now();
  const { cols, rows, first, step, count, near } = level;
  const last = first + step * (count - 1);
  for (let attempt = 1; attempt <= 50; attempt++) {
    const found = randomPath(level, rand);
    if (!found) continue;
    const { path } = found;
    const values = new Array<number>(cols * rows).fill(0);
    const index = new Map<Cell, number>();
    path.forEach((cell, i) => ((values[cell] = first + step * i), index.set(cell, i)));

    let tempting = 0;
    let ok = true;
    for (let cell = 0; cell < cols * rows; cell++) {
      if (index.has(cell)) continue;
      const pathNbrs = neighbours(cell, cols, rows).filter((n) => index.has(n)).map((n) => index.get(n)!);
      // zakazane: następna liczba każdej sąsiedniej kratki drogi
      const banned = new Set(pathNbrs.filter((i) => i + 1 < count).map((i) => first + step * (i + 1)));
      // liczby startu i mety stoją tylko na starcie i mecie
      const inRange = (v: number) => v > first && v < last && (v - first) % step === 0;
      // kuszące: w odległości do `near` kroków od liczb sąsiednich kratek drogi
      const close = new Set<number>();
      for (const i of pathNbrs) for (let k = -near; k <= near + 1; k++) {
        const v = first + step * (i + k);
        if (inRange(v) && !banned.has(v)) close.add(v);
      }
      let pool = [...close];
      if (pool.length) tempting++;
      else {
        pool = [];
        for (let v = first + step; v < last; v += step) if (!banned.has(v)) pool.push(v);
      }
      if (!pool.length) {
        ok = false;
        break;
      }
      values[cell] = pool[Math.floor(rand() * pool.length)];
    }
    if (!ok) continue;
    const problem = checkOnePath(values, level);
    if (problem) throw new Error(`${level.name}: ${problem}`);
    return { values, path, tempting, traps: cols * rows - count, attempts: attempt, nodes: found.nodes, ms: performance.now() - t0 };
  }
  throw new Error(`${level.name}: brak karty po 50 próbach`);
}

/** Niezależne sprawdzenie: od startu z każdej kratki dokładnie jedna sąsiednia ma następną liczbę; koniec na mecie. */
function checkOnePath(values: readonly number[], level: Level): string | null {
  const { cols, rows, first, step, count } = level;
  const goal = cols * rows - 1;
  if (values[0] !== first) return "start nie ma pierwszej liczby";
  let cur = 0;
  const seen = new Set([0]);
  for (let i = 1; i < count; i++) {
    const want = first + step * i;
    const next = neighbours(cur, cols, rows).filter((n) => values[n] === want);
    if (next.length !== 1) return `przy liczbie ${want - step} ${next.length} sąsiadów z ${want}`;
    cur = next[0];
    if (seen.has(cur)) return "droga wraca na siebie";
    seen.add(cur);
  }
  return cur === goal ? null : "ostatnia liczba nie stoi na mecie";
}

function sheet(level: Level, card: Card, solution: boolean): string {
  const { cols, rows } = level;
  const left = PAGE.inset;
  const width = PAGE.w - 2 * PAGE.inset;
  const top = PAGE.inset + PAGE.band + PAGE.bandGap;
  const avail = PAGE.h - PAGE.inset - top - 2 * PAGE.label;
  const cell = Math.min(MAX_CELL, width / cols, avail / rows);
  const gridW = cell * cols;
  const gridH = cell * rows;
  const gx = left + (width - gridW) / 2;
  const gy = top + PAGE.label;
  const parts: string[] = [];

  const bandY = PAGE.inset;
  parts.push(`<circle cx="${left + 12}" cy="${bandY + 13}" r="11" fill="#f3c969" stroke="#b8860b" stroke-width="0.4"/>`);
  parts.push(`<text x="${left + 12}" y="${bandY + 15}" ${FONT} font-size="4" text-anchor="middle" fill="#7a5a00">postać</text>`);
  parts.push(`<path d="M ${left + 27} ${bandY + 3} H ${left + width} V ${bandY + 23} H ${left + 27} V ${bandY + 16} L ${left + 23} ${bandY + 13} L ${left + 27} ${bandY + 10} Z" fill="#fff" stroke="#111" stroke-width="0.4" stroke-linejoin="round"/>`);
  parts.push(`<text x="${left + 32}" y="${bandY + 15}" ${FONT} font-size="5.6" fill="#111">${level.instruction}</text>`);

  const xy = (c: Cell) => [gx + (c % cols) * cell, gy + Math.floor(c / cols) * cell] as const;

  if (solution) {
    const pts = card.path.map((c) => {
      const [x, y] = xy(c);
      return `${(x + cell / 2).toFixed(2)},${(y + cell / 2).toFixed(2)}`;
    });
    parts.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="#9ab" stroke-width="${(cell * 0.32).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>`);
  }

  const fontSize = cell * (String(Math.max(...card.values)).length > 2 ? 0.36 : 0.42);
  for (let c = 0; c < cols * rows; c++) {
    const [x, y] = xy(c);
    parts.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="none" stroke="#111" stroke-width="0.4"/>`);
    parts.push(`<text x="${(x + cell / 2).toFixed(2)}" y="${(y + cell / 2 + fontSize * 0.36).toFixed(2)}" ${FONT} font-size="${fontSize.toFixed(2)}" font-weight="bold" text-anchor="middle" fill="#111">${card.values[c]}</text>`);
  }
  parts.push(`<rect x="${gx}" y="${gy}" width="${gridW.toFixed(2)}" height="${gridH.toFixed(2)}" fill="none" stroke="#111" stroke-width="0.9"/>`);
  // start i meta: gruba ramka kratki i napis poza kratką
  const goal = cols * rows - 1;
  for (const [c, label, above] of [[0, "Start", true], [goal, "Meta", false]] as const) {
    const [x, y] = xy(c);
    parts.push(`<rect x="${(x + 0.8).toFixed(2)}" y="${(y + 0.8).toFixed(2)}" width="${(cell - 1.6).toFixed(2)}" height="${(cell - 1.6).toFixed(2)}" rx="1.2" fill="none" stroke="#111" stroke-width="1.4"/>`);
    const ty = above ? y - 2.5 : y + cell + 6.5;
    parts.push(`<text x="${(x + cell / 2).toFixed(2)}" y="${ty.toFixed(2)}" ${FONT} font-size="5.5" font-weight="bold" text-anchor="middle" fill="#111">${label}</text>`);
  }

  const tag = solution ? " · Pokaż rozwiązanie (tylko ekran)" : "";
  parts.push(`<text x="${PAGE.w - PAGE.inset}" y="${PAGE.h - 4}" ${FONT} font-size="3" text-anchor="end" fill="#999">makieta S-49 · ${level.title} · kratka ${cell.toFixed(1)} mm · pułapek ${card.traps}, kuszących ${card.tempting}${tag}</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${PAGE.w} ${PAGE.h}"><rect width="${PAGE.w}" height="${PAGE.h}" fill="#fff"/>${parts.join("")}</svg>`;
}

const files: { file: string; title: string }[] = [];
const stats: string[] = ["| Poziom | Kratka | Droga | Pułapki (kuszące) | Próby | Węzły DFS | ms | Sprawdzenie 200 kart |", "|---|---|---|---|---|---|---|---|"];
for (const level of LEVELS) {
  const card = build(level, mulberry32(level.seed));
  writeFileSync(resolve(OUT, `mockup-${level.name}.svg`), sheet(level, card, false));
  files.push({ file: `mockup-${level.name}.svg`, title: level.title });
  if (level.name === "poziom-1" || level.name === "poziom-4") {
    writeFileSync(resolve(OUT, `mockup-${level.name}-rozwiazanie.svg`), sheet(level, card, true));
    files.push({ file: `mockup-${level.name}-rozwiazanie.svg`, title: `${level.title}, Pokaż rozwiązanie` });
  }
  // wykonalność: 200 kart z kolejnych ziaren, najdłuższy czas
  let worst = 0;
  for (let s = 1; s <= 200; s++) worst = Math.max(worst, build(level, mulberry32(level.seed * 1000 + s)).ms);
  stats.push(`| ${level.title} | ${level.cols}×${level.rows} | ${level.count} z ${level.cols * level.rows} | ${card.traps} (${card.tempting}) | ${card.attempts} | ${card.nodes} | ${card.ms.toFixed(1)} | 200/200 jedna droga, najdłużej ${worst.toFixed(1)} ms |`);
}

const html = `<!doctype html><meta charset="utf-8"><title>S-49 makiety</title>
<style>body{font:14px Arial;margin:16px;background:#eee}figure{display:inline-block;margin:8px;vertical-align:top}img{width:420px;background:#fff;box-shadow:0 1px 4px #0003}figcaption{margin-top:4px}</style>
${files.map((f) => `<figure><img src="${f.file}"><figcaption>${f.title}</figcaption></figure>`).join("\n")}`;
writeFileSync(resolve(OUT, "mockups.html"), html);
writeFileSync(resolve(OUT, "stats.md"), `# Makieta S-49 — wykonalność generatora\n\nWygenerowane przez \`mockup.mts\`. Każda karta przeszła niezależne sprawdzenie jednej drogi.\n\n${stats.join("\n")}\n`);
console.log(stats.join("\n"));
