// Makieta karty „Szlaczki” (S-36), wersja 6: kierunek S-36, bez obrazków. Każdy poziom ma własną pulę wzorów
// i własny zakres łagodności (stosunek wysokości do długości kroku); rząd losuje wzór z puli, długość kroku
// i wysokość. Pisze po dwie karty na poziom (dwa ziarna), żeby było widać różnorodność, oraz mockups-v6.html.
// Szare podpisy rzędów są tylko do rozmowy; karta ich nie ma. Makieta nie jest kodem produktu.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/pattern-lines-card/mockup-v6.mts
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';

type Pt = { x: number; y: number; corner?: boolean };

// Jednostki: x od 0 do 1 (jeden krok), y od 0 (dół) do 1 (góra). Wszystkie poza miseczkami i linią
// zaczynają i kończą się na dole (y = 0), więc można je sklejać we wzory z dwóch elementów.
const N = 48;
const sample = (f: (t: number) => Pt, n = N) => Array.from({ length: n + 1 }, (_, i) => f(i / n));
const c = (x: number, y: number): Pt => ({ x, y, corner: true });

const U = {
  line: () => [c(0, 0.5), c(1, 0.5)],
  flat: () => [c(0, 0), c(1, 0)],
  wave: () => sample((t) => ({ x: t, y: (1 - Math.cos(t * 2 * Math.PI)) / 2 })),
  zigzag: () => [c(0, 0), c(0.5, 1), c(1, 0)],
  arcs: () => {
    const a = sample((t) => ({ x: t, y: Math.sin(t * Math.PI) }), 32);
    a[0].corner = true;
    a[a.length - 1].corner = true;
    return a;
  },
  cups: () => {
    const a = sample((t) => ({ x: t, y: 1 - Math.sin(t * Math.PI) }), 32);
    a[0].corner = true;
    a[a.length - 1].corner = true;
    return a;
  },
  stairs: () => [c(0, 0), c(0, 1), c(0.5, 1), c(0.5, 0), c(1, 0)],
  trapez: () => [c(0, 0), c(0.25, 1), c(0.5, 1), c(0.75, 0), c(1, 0)],
  saw: () => [c(0, 0), c(1, 1), c(1, 0)],
  // motywy „przygodowe” (bez postaci i znaków towarowych)
  bolt: () => [c(0, 0), c(0.45, 1), c(0.66, 0.42), c(0.78, 0.6), c(1, 0)], // błyskawica: zejście z uskokiem do przodu
  bricks: () => [
    c(0, 0), c(0, 0.72), c(0.07, 0.72), c(0.07, 1), c(0.21, 1), c(0.21, 0.72), c(0.29, 0.72), c(0.29, 1), c(0.43, 1),
    c(0.43, 0.72), c(0.5, 0.72), c(0.5, 0), c(1, 0),
  ], // klocek z dwiema wypustkami
  pipes: () => [
    c(0, 0), c(0.12, 0), c(0.12, 0.75), c(0.05, 0.75), c(0.05, 1), c(0.5, 1), c(0.5, 0.75), c(0.43, 0.75), c(0.43, 0),
    c(1, 0),
  ], // rura z czapką
  house: () => [c(0, 0), c(0, 0.6), c(0.25, 1), c(0.5, 0.6), c(0.5, 0), c(1, 0)], // domek: ściana i dach
  tunnel: () => {
    // brama: prosta noga, półkole, prosta noga
    const arc = Array.from({ length: 25 }, (_, i) => {
      const a = Math.PI - (i / 24) * Math.PI;
      return { x: 0.25 + 0.25 * Math.cos(a), y: 0.55 + 0.45 * Math.sin(a) };
    });
    return [c(0, 0), { ...arc[0], corner: true }, ...arc.slice(1, -1), { ...arc[24], corner: true }, c(0.5, 0), c(1, 0)];
  },
  pointed: () => {
    // czubki (ostrołuki): dwa łuki okręgu, z obu stron, spotykają się w ostrym szczycie
    const up = Array.from({ length: 17 }, (_, i) => {
      // łuk dużego okręgu do 40 stopni: w szczycie kąt ok. 80 stopni, więc szczyt jest wyraźnie ostry
      const m = (40 * Math.PI) / 180;
      const t = (i / 16) * m;
      return { x: (0.5 * (1 - Math.cos(t))) / (1 - Math.cos(m)), y: Math.sin(t) / Math.sin(m) };
    });
    const down = up.map((p) => ({ x: 1 - p.x, y: p.y })).reverse();
    return [{ ...up[0], corner: true }, ...up.slice(1, -1), c(0.5, 1), ...down.slice(1, -1), { ...down[16], corner: true }];
  },
  // kółeczka jak pisane „o”, „a”: start na górze, w lewo, w dół, w prawo i do góry (przeciwnie do wskazówek zegara)
  // Każde kółko to pełne koło, połączone kreską od linii dolnej, jak w pisanym „ooo”.
  oChain: () => {
    const cx = 0.6;
    const rx = 0.3;
    const ring = Array.from({ length: 49 }, (_, i) => {
      const a = Math.PI / 2 + (i / 48) * 2 * Math.PI; // od góry, przeciwnie do wskazówek zegara
      return { x: cx + rx * Math.cos(a), y: 0.5 + 0.5 * Math.sin(a) };
    });
    // łącznik jak w piśmie szkolnym: kreska wchodzi do kółka od dołu (od linii dolnej do szczytu),
    // a po zamknięciu kółka schodzi łukiem z powrotem na linię dolną, skąd zaczyna się następne
    return [
      c(0, 0), { x: 0.18, y: 0.3 }, { x: 0.36, y: 0.75 }, { x: 0.5, y: 0.97 }, { ...ring[0], corner: true }, ...ring.slice(1, -1),
      { ...ring[48], corner: true }, { x: 0.8, y: 0.8 }, { x: 0.92, y: 0.35 }, c(1, 0),
    ];
  },
  // laseczki z haczykiem jak pisane „i”: skośna kreska w górę, prawie pionowa w dół i szeroki haczyk przechodzący
  // w następną kreskę w górę
  sticks: () => [
    c(0, 0.15),
    c(0.42, 1),
    c(0.48, 0.22),
    { x: 0.51, y: 0.09 },
    { x: 0.57, y: 0.02 },
    { x: 0.66, y: 0 },
    { x: 0.77, y: 0.02 },
    { x: 0.89, y: 0.08 },
    c(1, 0.15),
  ],
  pyramid: () => [
    c(0, 0), c(0, 0.34), c(0.1, 0.34), c(0.1, 0.67), c(0.2, 0.67), c(0.2, 1), c(0.3, 1), c(0.3, 0.67), c(0.4, 0.67),
    c(0.4, 0.34), c(0.5, 0.34), c(0.5, 0), c(1, 0),
  ], // piramidka: schodki w górę i w dół
  // pętla u dołu, zawieszona pod linią startu (jak pisane j, g): zaczyna i kończy się na górze
  loopsBelow: (k = 0.3) => sample((t) => ({ x: t + k * Math.sin(t * 2 * Math.PI), y: -(1 - Math.cos(t * 2 * Math.PI)) / 2 }), 64),
  // pętla u góry (jak pisane „e”): x = t + k·sin, więc na górze droga cofa się i zawija
  loops: (k = 0.3) => sample((t) => ({ x: t + k * Math.sin(t * 2 * Math.PI), y: (1 - Math.cos(t * 2 * Math.PI)) / 2 }), 64),
};

/** Skleja jednostki w jeden krok: każda część dostaje ułamek szerokości `w` i skalę wysokości `h`. */
function compose(parts: { u: Pt[]; w: number; h?: number }[]): Pt[] {
  const out: Pt[] = [];
  let x0 = 0;
  const total = parts.reduce((s, p) => s + p.w, 0);
  for (const p of parts) {
    p.u.forEach((q, i) => {
      if (i === 0 && out.length) return;
      const edge = i === 0 || i === p.u.length - 1;
      out.push({ x: (x0 + q.x * p.w) / total, y: q.y * (p.h ?? 1), corner: q.corner || edge });
    });
    x0 += p.w;
  }
  return out;
}

interface Pattern {
  id: string;
  name: string;
  unit: () => Pt[];
  /** Mnożnik łagodności: wzory, które same w sobie są „ostre”, dostają trochę niższą wysokość. */
  sharp?: number;
  /** Wzory z dwóch elementów dostają dłuższy krok, żeby każdy element miał miejsce. */
  span?: number;
  /** Stała proporcja wysokość / krok (pierścienie muszą być okrągłe), zamiast łagodności poziomu. */
  fixedRatio?: number;
  /** Miejsce w liniaturze (Poziom 4): x = do linii środkowej, tall = do górnej, desc = od środkowej pod dolną. */
  ling?: "x" | "tall" | "desc";
  /** Stała liczba powtórzeń w rzędzie zamiast liczby wynikającej z kroku (domki: 5, uwaga 2026-11-09). */
  count?: number;
}

const P: Record<string, Pattern> = {
  line: { id: "line", name: "linia prosta", unit: U.line },
  wave: { id: "wave", name: "fala", unit: U.wave },
  zigzag: { id: "zigzag", name: "zygzak", unit: U.zigzag, sharp: 0.85 },
  arcs: { id: "arcs", name: "górki", unit: U.arcs },
  cups: { id: "cups", name: "miseczki", unit: U.cups },
  stairs: { id: "stairs", name: "schodki (meander)", unit: U.stairs, sharp: 0.8 },
  trapez: { id: "trapez", name: "kopce (trapezy)", unit: U.trapez, sharp: 0.85 },
  saw: { id: "saw", name: "zęby smoka (piłka)", unit: U.saw, sharp: 0.8 },
  loops: { id: "loops", name: "pętle (jak pisane e)", unit: () => U.loops(0.32) },
  snails: { id: "snails", name: "spirale (ciasne pętle)", unit: () => U.loops(0.5), fixedRatio: 0.9 },
  bolt: { id: "bolt", name: "błyskawice", unit: U.bolt, sharp: 0.9 },
  bricks: { id: "bricks", name: "klocki", unit: U.bricks, sharp: 0.8, span: 1.2 },
  pipes: { id: "pipes", name: "rury", unit: U.pipes, span: 1.2 },
  spell: { id: "spell", ling: "tall", name: "czary: mała i duża pętla", unit: () => compose([{ u: U.loops(0.4), w: 0.7, h: 0.5 }, { u: U.loops(0.4), w: 1, h: 1 }]), fixedRatio: 0.6, span: 1.5 },
  house: { id: "house", name: "domki", unit: U.house, fixedRatio: 0.6, count: 5 }, // większe domki, pięć w rzędzie (uwaga 2026-11-09)
  tunnel: { id: "tunnel", name: "bramy", unit: U.tunnel, span: 1.2 },
  pointed: { id: "pointed", name: "czubki (ostrołuki)", unit: U.pointed },
  waveFlat: { id: "waveFlat", name: "fala i kreska", unit: () => compose([{ u: U.wave(), w: 2 }, { u: U.flat(), w: 1 }]), span: 1.3 },
  doubleZig: { id: "doubleZig", name: "duży i mały ząbek", unit: () => compose([{ u: U.zigzag(), w: 1, h: 1 }, { u: U.zigzag(), w: 0.6, h: 0.5 }]), span: 1.4 },
  pyramid: { id: "pyramid", name: "piramidki", unit: U.pyramid, sharp: 0.9, span: 1.3 },
  loopsDown: { id: "loopsDown", ling: "desc", name: "pętle w dół (j g)", unit: () => U.loopsBelow(0.3).map((p) => ({ ...p, y: p.y + 1 })) },
  upDown: {
    id: "upDown",
    ling: "desc",
    name: "pętla w górę i w dół",
    unit: () => compose([{ u: U.loops(0.3), w: 1 }, { u: U.loopsBelow(0.3), w: 1 }]).map((p) => ({ ...p, y: (p.y + 1) / 2 })),
    span: 1.6,
  },
  arcFlat: { id: "arcFlat", name: "górka i kreska", unit: () => compose([{ u: U.arcs(), w: 2 }, { u: U.flat(), w: 1 }]) },
  zigFlat: { id: "zigFlat", name: "ząbek i kreska", unit: () => compose([{ u: U.zigzag(), w: 2 }, { u: U.flat(), w: 1 }]) },
  loopArc: { id: "loopArc", name: "pętla i górka", unit: () => compose([{ u: U.loops(0.25), w: 1.2 }, { u: U.arcs(), w: 1, h: 0.7 }]), span: 1.7 },
  waveLoop: { id: "waveLoop", name: "fala i pętla", unit: () => compose([{ u: U.wave(), w: 1.2, h: 0.6 }, { u: U.loops(0.25), w: 1.2 }]), span: 1.8 },
  oChain: { id: "oChain", name: "kółeczka (o a)", unit: U.oChain, fixedRatio: 0.6, span: 1.4 },
  sticks: { id: "sticks", name: "laseczki z haczykiem (i)", unit: U.sticks },
  tallShort: { id: "tallShort", ling: "tall", name: "pętla wysoka i niska (l e)", unit: () => compose([{ u: U.loops(0.28), w: 1, h: 1 }, { u: U.loops(0.28), w: 0.8, h: 0.5 }]), span: 1.5 },
  arcZig: { id: "arcZig", name: "górka i ząbek", unit: () => compose([{ u: U.arcs(), w: 1 }, { u: U.zigzag(), w: 1 }]), span: 1.6 },
  stairsArc: { id: "stairsArc", name: "schodek i górka", unit: () => compose([{ u: U.stairs(), w: 1 }, { u: U.arcs(), w: 1 }]), span: 1.6 },
  doubleArc: { id: "doubleArc", name: "górka duża i mała (m n)", unit: () => compose([{ u: U.arcs(), w: 1, h: 1 }, { u: U.arcs(), w: 0.7, h: 0.55 }]), span: 1.5 },
};

interface Level {
  key: string;
  title: string;
  who: string;
  mode: "dots" | "continue";
  pool: string[];
  rows: number;
  period: [number, number]; // długość kroku, mm
  ratio: [number, number]; // wysokość / krok: im niżej, tym łagodniej
  maxHeight: number; // mm
  dot: number;
  spacing: number;
  stroke: number;
  /** Przerywane linie pomocnicze na górze i na dole wzoru (kontynuacja): pilnują wysokości. */
  guides?: boolean;
  /** Dodatkowy pusty pas na dole kartki, mm (Poziom 1: dziecku wygodniej trzymać kartkę, a ręka, która wyjedzie poza kształt, zostaje na papierze). */
  bottomPad?: number;
  /** Liniatura jak w zeszycie do kaligrafii: wysokość małej litery w mm (linia dolna, przerywana środkowa, górna). */
  ruled?: number;
}

const LEVELS: Level[] = [
  { key: "1", title: "Poziom 1", who: "3–4 lata", mode: "dots", pool: ["line", "wave", "zigzag", "arcs", "cups"], rows: 4, period: [40, 52], ratio: [0.2, 0.42], maxHeight: 20, dot: 1.1, spacing: 4, stroke: 0, bottomPad: 15 },
  { key: "2", title: "Poziom 2", who: "5–6 lat", mode: "dots", pool: ["wave", "zigzag", "arcs", "cups", "stairs", "trapez", "saw", "arcFlat", "house", "tunnel", "pointed", "waveFlat"], rows: 5, period: [30, 42], ratio: [0.35, 0.6], maxHeight: 18, dot: 0.9, spacing: 3.5, stroke: 0 },
  { key: "3", title: "Poziom 3", who: "6–7 lat", mode: "continue", pool: ["zigzag", "wave", "arcs", "cups", "stairs", "trapez", "saw", "loops", "arcFlat", "zigFlat", "bricks", "pipes", "house", "tunnel", "pointed", "doubleZig", "oChain", "sticks"], rows: 6, period: [22, 30], ratio: [0.5, 0.85], maxHeight: 15, dot: 0, spacing: 0, stroke: 1.0, guides: true },
  { key: "4", title: "Poziom 4", who: "8–10 lat (klasy 1–3)", mode: "continue", pool: ["loops", "snails", "tallShort", "doubleArc", "loopArc", "waveLoop", "arcZig", "stairsArc", "saw", "trapez", "bricks", "pipes", "spell", "loopsDown", "upDown", "doubleZig", "oChain", "sticks"], rows: 7, period: [12, 20], ratio: [0.6, 1.0], maxHeight: 13, dot: 0, spacing: 0, stroke: 0.6, ruled: 6.5 },
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
  pattern: Pattern;
  period: number;
  height: number;
}

/** Rzędy karty: wzory bez powtórzeń, dopóki pula starcza; każdy ma losowy krok i łagodność z zakresu poziomu. */
function makeRows(level: Level, seed: number, fixedPool?: string[]): Row[] {
  const random = mulberry32(seed);
  const pool = fixedPool ?? [...level.pool].sort(() => random() - 0.5);
  const rows: Row[] = [];
  for (let i = 0; i < level.rows; i += 1) {
    const pattern = P[pool[i % pool.length]];
    const period = (level.period[0] + random() * (level.period[1] - level.period[0])) * (pattern.span ?? 1);
    const ratio = level.ratio[0] + random() * (level.ratio[1] - level.ratio[0]);
    const height =
      pattern.id === "line"
        ? 0
        : Math.min(level.maxHeight, (period / (pattern.span ?? 1)) * (pattern.fixedRatio ?? ratio * (pattern.sharp ?? 1)));
    rows.push({ pattern, period, height });
  }
  return rows;
}

function rowPath(row: Row, length: number, repeats: number | null): Pt[] {
  const total = row.pattern.count ?? Math.max(1, Math.round(length / row.period));
  const period = length / total;
  const u = row.pattern.unit();
  const pts: Pt[] = [];
  for (let r = 0; r < (repeats ?? total); r += 1) {
    u.forEach((p, i) => {
      if (r > 0 && i === 0) return;
      pts.push({ x: (r + p.x) * period, y: -(p.y - 0.5) * row.height, corner: p.corner });
    });
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
    if (acc >= spacing * 0.95 || b.corner || i === path.length - 1) {
      dots.push(b);
      acc = 0;
    }
  }
  return dots;
}

const pathD = (pts: Pt[]) => pts.map((p, k) => `${k ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

/** `trace`: ile pierwszych powtórzeń jest wykropkowanych do poprowadzenia ołówkiem (Poziom 3); reszta rzędu pusta. */
/** `lines`: przełącznik „Linie” na Poziomach 3–4; wyłączony zostawia tylko bladą linię dolną. */
function card(level: Level, seed: number, motifs?: { pool: string[]; title: string }, trace?: number, lines = true): string {
  const rows = makeRows(motifs ? { ...level, rows: motifs.pool.length } : level, seed, motifs?.pool);
  if (motifs) level = { ...level, rows: motifs.pool.length };
  const left = PAGE.inset;
  const width = PAGE.w - 2 * PAGE.inset;
  const top = PAGE.inset + PAGE.band + PAGE.gap;
  // Rzędy wypełniają kartkę: pierwszy zaczyna się pod poleceniem (miejsce na podpis 4 mm), ostatni kończy się
  // przy dolnym marginesie, a odstępy między nimi są równe. Bez pustego pasa na dole.
  const firstCenter = top + 4 + level.maxHeight / 2;
  const lastCenter = PAGE.h - PAGE.inset - (level.bottomPad ?? 0) - level.maxHeight / 2;
  const rowStep = level.rows > 1 ? (lastCenter - firstCenter) / (level.rows - 1) : 0;
  const length = width - 6;
  const out: string[] = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE.w} ${PAGE.h}">`);
  out.push(`<rect width="${PAGE.w}" height="${PAGE.h}" fill="#fff"/>`);
  out.push(`<rect x="${left}" y="${PAGE.inset}" width="${width}" height="${PAGE.band}" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="2 1.5"/>`);
  const command =
    level.mode === "dots"
      ? "Prowadź ołówek po kropkach."
      : trace
        ? "Poprowadź po kropkach, potem rysuj dalej sam."
        : "Dokończ szlaczek do końca linii.";
  out.push(`<text x="${PAGE.w / 2}" y="${PAGE.inset + PAGE.band / 2}" text-anchor="middle" dominant-baseline="middle" ${FONT} font-size="7" fill="#000">${command}</text>`);
  out.push(`<text x="${PAGE.w - PAGE.inset}" y="${PAGE.h - 4}" text-anchor="end" ${FONT} font-size="2.6" fill="#999">makieta S-36 v6 · ${motifs ? motifs.title + " · " : ""}${level.title} · ${level.who} · ziarno ${seed}${lines ? "" : " · LINIE WYŁĄCZONE"}${trace ? ` · wykropkowane powtórzenia: ${trace}` : ""} · podpisy rzędów tylko do rozmowy</text>`);
  rows.forEach((row, i) => {
    const cy = firstCenter + rowStep * i;
    out.push(`<text x="${left}" y="${(cy - level.maxHeight / 2 - 1.5).toFixed(2)}" ${FONT} font-size="2.6" fill="#aaa">${row.pattern.name} · krok ${row.period.toFixed(0)} mm · wys. ${row.height.toFixed(0)} mm</text>`);
    out.push(`<g transform="translate(${left + 3} ${cy.toFixed(2)})">`);
    if (level.ruled) {
      // Liniatura jak w zeszycie do kaligrafii: górna, przerywana środkowa, dolna i blada linia pod dolną na pętle j, g.
      // Małe elementy (e, o, i, m n) sięgają linii środkowej, wysokie (l) górnej, pętle w dół schodzą pod dolną.
      const X = level.ruled;
      const base = X / 2;
      if (lines) {
        out.push(`<line x1="0" y1="${(base - 2 * X).toFixed(2)}" x2="${length}" y2="${(base - 2 * X).toFixed(2)}" stroke="#999" stroke-width="0.25"/>`);
        out.push(`<line x1="0" y1="${(base - X).toFixed(2)}" x2="${length}" y2="${(base - X).toFixed(2)}" stroke="#999" stroke-width="0.25" stroke-dasharray="1.2 1.2"/>`);
        out.push(`<line x1="0" y1="${base.toFixed(2)}" x2="${length}" y2="${base.toFixed(2)}" stroke="#999" stroke-width="0.25"/>`);
        out.push(`<line x1="0" y1="${(base + X).toFixed(2)}" x2="${length}" y2="${(base + X).toFixed(2)}" stroke="#ccc" stroke-width="0.2" stroke-dasharray="0.6 1.4"/>`);
      } else {
        out.push(`<line x1="0" y1="${base.toFixed(2)}" x2="${length}" y2="${base.toFixed(2)}" stroke="#ccc" stroke-width="0.25"/>`);
      }
      const [lift, h] = row.pattern.ling === "tall" ? [0, 2] : row.pattern.ling === "desc" ? [-1, 2] : [0, 1];
      const total = Math.max(1, Math.round(length / row.period));
      const shown = Math.max(3, Math.round(total * 0.35));
      const raw = rowPath({ ...row, height: -1 }, length, shown); // y = p.y - 0.5
      const pts = raw.map((p) => ({ ...p, y: base - (lift + (p.y + 0.5) * h) * X }));
      out.push(`<path d="${pathD(pts)}" fill="none" stroke="#000" stroke-width="${level.stroke}" stroke-linecap="round" stroke-linejoin="round"/>`);
    } else if (level.mode === "dots") {
      const pts = rowPath(row, length, null);
      out.push(`<path d="${pathD(pts)}" fill="none" stroke="#ccc" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>`);
      for (const d of dotsOn(pts, level.spacing)) out.push(`<circle cx="${d.x.toFixed(2)}" cy="${d.y.toFixed(2)}" r="${level.dot}" fill="#000"/>`);
      out.push(`<circle cx="${pts[0].x.toFixed(2)}" cy="${pts[0].y.toFixed(2)}" r="${level.dot + 1.2}" fill="none" stroke="#000" stroke-width="0.5"/>`);
    } else {
      const total = Math.max(1, Math.round(length / row.period));
      // Poziom 3: początek wzoru jest wykropkowany (dziecko prowadzi po nim ołówek), dalej rysuje samo.
      // Poziom 4: początek jest narysowany linią, co najmniej trzy powtórzenia, żeby reguła była pewna.
      const shown = trace ?? Math.max(3, Math.round(total * 0.35));
      const pts = rowPath(row, length, shown);
      if (level.guides && lines) {
        for (const y of [-row.height / 2, row.height / 2]) {
          out.push(`<line x1="0" y1="${y.toFixed(2)}" x2="${length}" y2="${y.toFixed(2)}" stroke="#aaa" stroke-width="0.3" stroke-dasharray="1.2 1.2"/>`);
        }
      } else {
        out.push(`<line x1="0" y1="${(row.height / 2).toFixed(2)}" x2="${length}" y2="${(row.height / 2).toFixed(2)}" stroke="#ccc" stroke-width="0.25"/>`);
      }
      if (trace) {
        out.push(`<path d="${pathD(pts)}" fill="none" stroke="#ccc" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>`);
        for (const d of dotsOn(pts, 3.5)) out.push(`<circle cx="${d.x.toFixed(2)}" cy="${d.y.toFixed(2)}" r="0.9" fill="#000"/>`);
        out.push(`<circle cx="${pts[0].x.toFixed(2)}" cy="${pts[0].y.toFixed(2)}" r="2.1" fill="none" stroke="#000" stroke-width="0.5"/>`);
      } else {
        out.push(`<path d="${pathD(pts)}" fill="none" stroke="#000" stroke-width="${level.stroke}" stroke-linecap="round" stroke-linejoin="round"/>`);
      }
    }
    out.push(`</g>`);
  });
  out.push(`</svg>`);
  return out.join("\n");
}

const pages: { label: string; svg: string; file: string }[] = [];
// Przełącznik „Linie” wyłączony: te same karty Poziomów 3 i 4 bez linii pomocniczych.
for (const [level, trace] of [[LEVELS[2], 2], [LEVELS[3], undefined]] as const) {
  const file = `mockup-v6-poziom-${level.key}-bez-linii.svg`;
  const svg = card(level, 11, undefined, trace, false);
  writeFileSync(`${OUT}/${file}`, svg);
  pages.push({ label: `${level.title} · linie wyłączone (porównaj z ziarnem 11 niżej)`, svg, file });
}
// Nowe wzory (2026-11-09, druga runda): po jednej stronie przeglądu na poziom.
const NEW: [Level, string[], number | undefined][] = [
  [LEVELS[1], ["house", "tunnel", "pointed", "waveFlat"], undefined],
  [LEVELS[2], ["house", "tunnel", "pointed", "doubleZig", "oChain", "sticks"], 2],
  [LEVELS[3], ["oChain", "sticks", "loops", "tallShort", "doubleArc", "loopsDown", "upDown"], undefined],
];
for (const [level, pool, trace] of NEW) {
  const file = `mockup-v6-nowe-wzory-poziom-${level.key}.svg`;
  const svg = card(level, 7, { pool, title: "nowe wzory" }, trace);
  writeFileSync(`${OUT}/${file}`, svg);
  pages.push({ label: `Nowe wzory · ${level.title}`, svg, file });
}
// Przegląd motywów „przygodowych”: te same wzory do kontynuacji jak na Poziomie 3 i na Poziomie 4.
const MOTIFS = ["bolt", "bricks", "pipes", "saw", "snails", "spell"];
for (const [level, file] of [[LEVELS[2], "mockup-v6-motywy-poziom-3.svg"], [LEVELS[3], "mockup-v6-motywy-poziom-4.svg"]] as const) {
  const svg = card(level, 5, { pool: MOTIFS, title: "motywy przygodowe" });
  writeFileSync(`${OUT}/${file}`, svg);
  pages.push({ label: `Motywy przygodowe · jak ${level.title}`, svg, file });
}
for (const level of LEVELS) {
  for (const seed of [11, 29]) {
    const file = `mockup-v6-poziom-${level.key}-${seed}.svg`;
    // Poziom 3: dwa pierwsze powtórzenia są wykropkowane (decyzja 2026-11-09: jedno nie wyznacza wzoru,
    // pojedyncza fala i górka wyglądają tak samo).
    const trace = level.key === "3" ? 2 : undefined;
    const svg = card(level, seed, undefined, trace);
    writeFileSync(`${OUT}/${file}`, svg);
    pages.push({ label: `${level.title} (${level.who}) · ziarno ${seed}${trace ? ` · kropki: ${trace} powt.` : ""}`, svg, file });
  }
}
writeFileSync(
  `${OUT}/mockups.html`,
  `<!doctype html><meta charset="utf-8"><title>Makiety S-36 v6</title><style>body{font-family:sans-serif;margin:8px;background:#eee}div{display:inline-block;margin:6px;vertical-align:top;text-align:center;width:380px;font-size:12px}svg{width:380px;height:auto;box-shadow:0 1px 4px #0003}</style>` +
    pages.map((p) => `<div>${p.label}<br>${p.svg}</div>`).join("\n"),
);
console.log("zapisano", pages.length, "kart v6");
