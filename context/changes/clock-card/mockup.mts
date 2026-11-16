// Makieta karty „Zegar” (S-41, GitHub 372). Rysuje karty A4 w skali 1:1 (mm) dla trzech trybów (Odczytaj, Dorysuj,
// Połącz) na Poziomie 1 i Poziomie 4 (kreski minut) oraz warianty „24 h” (pora dnia słowami pod tarczą) na Poziomie 2,
// z postacią i dymkiem z prawdziwego pasa kart (src/lib/sheet/speech.ts). Dokłada arkusz szczegółów: duże tarcze
// 7:30 i 2:50, żeby sprawdzić położenie wskazówki godzinowej. Skrypt sam sprawdza margines 10 mm, wielkości i kąty
// wskazówek i przerywa, gdy coś się nie zgadza. To nie jest kod produktu; liczby są propozycją do planu.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/clock-card/mockup.mts
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

/** Wszystkie wymiary rysunku w jednym miejscu (mm albo ułamki promienia tarczy). */
const SHEET = {
  rimStroke: 0.9,
  numberRadius: 0.72, // środek liczby 1–12
  numberSize: 0.2, // wysokość czcionki liczby
  numberHalo: 0.28, // biała obwódka liczby, ułamek wysokości czcionki
  hourTickFrom: 0.88,
  hourTickMajorFrom: 0.83, // 12, 3, 6, 9
  hourTickStroke: 0.55,
  hourTickMajorStroke: 1.1,
  minuteTickFrom: 0.94,
  minuteTickStroke: 0.25,
  minuteHand: 0.9, // długa i cienka
  minuteHandStroke: [0.8, 0.035] as const, // [najmniej mm, ułamek promienia]
  hourHand: 0.5, // krótka i gruba
  hourHandStroke: [1.8, 0.085] as const,
  centerDot: [1.2, 0.06] as const,
  baselineShift: 0.36, // jak w krzyżówce: bez dominant-baseline, bo telefony stawiają tekst inaczej
  answerBox: { w: 18, h: 13, colon: 7 }, // „__ : __”
  digital: { w: 42, h: 15, radius: 3, stroke: 1.0, text: 10 },
  partOfDay: 5,
  dot: 1.6,
  gapUnderDial: 3,
};

// ---------------------------------------------------------------- godziny

type Mode = "odczytaj" | "dorysuj" | "polacz";
type Time = { h: number; m: number }; // h: 1–12 bez 24 h, 0–23 z 24 h

const MODES: Record<Mode, { label: string; dials: number; instruction: string }> = {
  odczytaj: { label: "Odczytaj", dials: 6, instruction: "Która godzina? Wpisz pod zegarem." },
  dorysuj: { label: "Dorysuj", dials: 6, instruction: "Dorysuj wskazówki: krótką i długą." },
  polacz: { label: "Połącz", dials: 5, instruction: "Połącz zegar z tą samą godziną." },
};

const LEVELS = [
  { n: 1, label: "pełne godziny", minutes: [0], fresh: [0], minuteTicks: false },
  { n: 2, label: "pełne godziny i wpół do", minutes: [0, 30], fresh: [30], minuteTicks: false },
  { n: 3, label: "kwadranse", minutes: [0, 15, 30, 45], fresh: [15, 45], minuteTicks: false },
  {
    n: 4,
    label: "co 5 minut",
    minutes: range(12).map((i) => i * 5),
    fresh: range(12).map((i) => i * 5).filter((m) => m % 15 !== 0),
    minuteTicks: true,
  },
  {
    n: 5,
    label: "co minutę",
    minutes: range(60),
    fresh: range(60).filter((m) => m % 5 !== 0),
    minuteTicks: true,
  },
] as const;
type Level = (typeof LEVELS)[number];

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

/** Pora dnia (PRD „Karta „Zegar””): rano 5–11, po południu 12–17, wieczorem 18–21, w nocy 22–4. */
function partOfDay(h: number): string {
  if (h >= 5 && h <= 11) return "rano";
  if (h >= 12 && h <= 17) return "po południu";
  if (h >= 18 && h <= 21) return "wieczorem";
  return "w nocy";
}
/** Pierwsza i ostatnia godzina każdej pory odpada, żeby granica nie budziła sporu. */
const BORDER_HOURS = new Set([5, 11, 12, 17, 18, 21, 22, 4]);
const HOURS_12 = range(12).map((i) => i + 1);
// 0:xx odpada (decyzja 2026-11-16): dziecko o 0:30 łatwo wpisze 12:30 albo 24:30.
const HOURS_24 = range(24).filter((h) => !BORDER_HOURS.has(h) && h !== 0);

const fmt = (t: Time): string => `${t.h}:${String(t.m).padStart(2, "0")}`;
const sameKey = (t: Time, h24: boolean): string => (h24 ? fmt(t) : `${t.h % 12}:${t.m}`);

/** Kąty w stopniach od godziny 12, zgodnie ze wskazówkami zegara. Godzinowa przesuwa się z minutami. */
const hourAngle = (t: Time): number => 30 * (t.h % 12) + 0.5 * t.m;
const minuteAngle = (t: Time): number => 6 * t.m;

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(xs: readonly T[], r: () => number): T => xs[Math.floor(r() * xs.length)];

/**
 * Godziny karty: bez powtórek, a od Poziomu 2 co najmniej połowa tarcz ma minuty nowe dla poziomu (wpół do na
 * Poziomie 2, kwadranse 15 i 45 na Poziomie 3 itd.), żeby karta Poziomu 2 nie wyszła z samych pełnych godzin.
 * Reguła przyjęta przez użytkowniczkę 2026-11-16 (PRD „Karta „Zegar””).
 */
function times(level: Level, count: number, h24: boolean, r: () => number, must: Time[] = []): Time[] {
  const hours = h24 ? HOURS_24 : HOURS_12;
  const out: Time[] = [...must];
  const keys = new Set(out.map((t) => sameKey(t, h24)));
  const needFresh = level.n === 1 ? 0 : Math.ceil(count / 2);
  let fresh = out.filter((t) => (level.fresh as readonly number[]).includes(t.m)).length;
  while (out.length < count) {
    const minutes = fresh < needFresh ? level.fresh : level.minutes;
    const t = { h: pick(hours, r), m: pick(minutes, r) };
    if (keys.has(sameKey(t, h24))) continue;
    keys.add(sameKey(t, h24));
    if ((level.fresh as readonly number[]).includes(t.m)) fresh++;
    out.push(t);
  }
  // przemieszaj, żeby wymuszone godziny nie stały zawsze pierwsze
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Kolejność zegarów cyfrowych w trybie Połącz: żaden nie stoi na wysokości swojej tarczy. */
function derangement(n: number, r: () => number): number[] {
  for (;;) {
    const p = range(n);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    if (p.every((v, i) => v !== i)) return p;
  }
}

// ---------------------------------------------------------------- rysunek i sprawdzenie

const f = (n: number): string => n.toFixed(2);
type Box = { what: string; x0: number; y0: number; x1: number; y1: number };

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
  text(x: number, y: number, size: number, t: string, bold = false, anchor = "middle"): void {
    this.add(
      `<text x="${f(x)}" y="${f(y + size * SHEET.baselineShift)}" ${FONT} font-size="${f(size)}"${bold ? ' font-weight="bold"' : ""} text-anchor="${anchor}">${t}</text>`,
    );
    const w = t.length * size * 0.55;
    const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
    this.box(`tekst „${t}”`, x0, y - size * 0.4, x0 + w, y + size * 0.4);
  }
  svg(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">\n${this.out.join("\n")}\n</svg>\n`;
  }
  /** Margines 10 mm: każdy narysowany element zadania leży w obszarze wewnątrz marginesu. */
  checkMargin(name: string): void {
    const lo = PAGE.inset - 1e-6;
    for (const b of this.boxes) {
      if (b.x0 < lo || b.y0 < lo || b.x1 > PAGE.w - lo || b.y1 > PAGE.h - lo)
        throw new Error(`${name}: ${b.what} wychodzi poza margines (${f(b.x0)}, ${f(b.y0)}) – (${f(b.x1)}, ${f(b.y1)})`);
    }
    const minX = Math.min(...this.boxes.map((b) => b.x0));
    const maxX = Math.max(...this.boxes.map((b) => b.x1));
    const maxY = Math.max(...this.boxes.map((b) => b.y1));
    this.notes.push(`margines: lewy ${f(minX)}, prawy ${f(PAGE.w - maxX)}, dolny ${f(PAGE.h - maxY)} mm`);
  }
}

function band(s: Sheet, instruction: string): void {
  const lines = instructionLines(instruction);
  const b = layoutSpeechBand({
    pageWidth: PAGE.w,
    inset: PAGE.inset,
    top: PAGE.inset,
    lines,
    contentLeft: characterContentLeft(CHARACTER),
    contentRight: characterContentRight(CHARACTER),
  });
  const st = SPEECH_BAND.bubbleStroke;
  s.add(
    `<image href="${CHARACTER_HREF}" x="${f(b.character.x)}" y="${f(b.character.y)}" width="${b.character.width}" height="${b.character.height}" preserveAspectRatio="xMidYMid meet"/>`,
  );
  s.add(
    `<rect x="${f(b.bubble.x)}" y="${f(b.bubble.y)}" width="${f(b.bubble.width)}" height="${f(b.bubble.height)}" rx="${b.bubble.radius}" fill="#fff" stroke="#000" stroke-width="${st}"/>`,
  );
  const t = b.tail;
  s.add(`<path d="M ${f(t.baseX)} ${f(t.baseTopY)} L ${f(t.tipX)} ${f(t.tipY)} L ${f(t.baseX)} ${f(t.baseBottomY)}" fill="#fff" stroke="#000" stroke-width="${st}"/>`);
  s.add(`<line x1="${f(t.baseX + st)}" y1="${f(t.baseTopY + st)}" x2="${f(t.baseX + st)}" y2="${f(t.baseBottomY - st)}" stroke="#fff" stroke-width="${st * 2.5}"/>`);
  for (const [i, line] of lines.entries()) {
    s.add(`<text x="${f(b.text.x)}" y="${f(b.text.ys[i] + b.text.size * SHEET.baselineShift)}" ${FONT} font-size="${b.text.size}" text-anchor="middle">${line}</text>`);
    const w = line.length * b.text.size * SPEECH_BAND.letterWidthRatio;
    if (w > b.text.maxWidth) throw new Error(`polecenie „${line}” nie mieści się w dymku`);
  }
  s.box("dymek", b.bubble.x, b.bubble.y, b.bubble.x + b.bubble.width, b.bubble.y + b.bubble.height);
}

const polar = (cx: number, cy: number, rr: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [cx + rr * Math.sin(a), cy - rr * Math.cos(a)];
};
const strokeOf = ([min, share]: readonly [number, number], r: number): number => Math.max(min, share * r);

/** Tarcza: okrąg, liczby 1–12, kreski godzin, od Poziomu 4 kreski minut, środek; wskazówki, gdy jest godzina. */
function dial(s: Sheet, cx: number, cy: number, r: number, level: Level, t: Time | null): void {
  s.add(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="#fff" stroke="#000" stroke-width="${SHEET.rimStroke}"/>`);
  s.box("tarcza", cx - r - SHEET.rimStroke / 2, cy - r - SHEET.rimStroke / 2, cx + r + SHEET.rimStroke / 2, cy + r + SHEET.rimStroke / 2);
  if (level.minuteTicks) {
    for (let m = 0; m < 60; m++) {
      if (m % 5 === 0) continue;
      const [x0, y0] = polar(cx, cy, r * SHEET.minuteTickFrom, m * 6);
      const [x1, y1] = polar(cx, cy, r * 0.985, m * 6);
      s.add(`<line x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}" stroke="#000" stroke-width="${SHEET.minuteTickStroke}"/>`);
    }
  }
  const numbers: string[] = [];
  for (let h = 0; h < 12; h++) {
    const major = h % 3 === 0;
    const [x0, y0] = polar(cx, cy, r * (major ? SHEET.hourTickMajorFrom : SHEET.hourTickFrom), h * 30);
    const [x1, y1] = polar(cx, cy, r * 0.985, h * 30);
    s.add(`<line x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}" stroke="#000" stroke-width="${major ? SHEET.hourTickMajorStroke : SHEET.hourTickStroke}"/>`);
    const [nx, ny] = polar(cx, cy, r * SHEET.numberRadius, h * 30);
    const size = r * SHEET.numberSize;
    // Liczby idą nad wskazówkami z białą obwódką: długa wskazówka przechodzi przez pierścień liczb i bez obwódki
    // zakrywa „12” o pełnej godzinie albo „6” o wpół do.
    numbers.push(
      `<text x="${f(nx)}" y="${f(ny + size * SHEET.baselineShift)}" ${FONT} font-size="${f(size)}" font-weight="bold" text-anchor="middle" stroke="#fff" stroke-width="${f(size * SHEET.numberHalo)}" stroke-linejoin="round" paint-order="stroke">${h === 0 ? 12 : h}</text>`,
    );
  }
  if (t) {
    const ms = strokeOf(SHEET.minuteHandStroke, r);
    const hs = strokeOf(SHEET.hourHandStroke, r);
    const [mx, my] = polar(cx, cy, r * SHEET.minuteHand, minuteAngle(t));
    const [hx, hy] = polar(cx, cy, r * SHEET.hourHand, hourAngle(t));
    s.add(`<line x1="${f(cx)}" y1="${f(cy)}" x2="${f(hx)}" y2="${f(hy)}" stroke="#000" stroke-width="${f(hs)}" stroke-linecap="round"/>`);
    s.add(`<line x1="${f(cx)}" y1="${f(cy)}" x2="${f(mx)}" y2="${f(my)}" stroke="#000" stroke-width="${f(ms)}" stroke-linecap="round"/>`);
  }
  for (const n of numbers) s.add(n);
  s.add(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(strokeOf(SHEET.centerDot, r))}" fill="#000"/>`);
}

function answerBoxes(s: Sheet, cx: number, top: number): void {
  const { w, h, colon } = SHEET.answerBox;
  const x0 = cx - w - colon / 2;
  s.add(`<rect x="${f(x0)}" y="${f(top)}" width="${w}" height="${h}" fill="#fff" stroke="#000" stroke-width="0.5"/>`);
  s.add(`<rect x="${f(cx + colon / 2)}" y="${f(top)}" width="${w}" height="${h}" fill="#fff" stroke="#000" stroke-width="0.5"/>`);
  s.text(cx, top + h / 2 - 0.6, 9, ":", true);
  s.box("pola odpowiedzi", x0, top, cx + colon / 2 + w, top + h);
}

function digital(s: Sheet, cx: number, top: number, t: Time): void {
  const d = SHEET.digital;
  s.add(`<rect x="${f(cx - d.w / 2)}" y="${f(top)}" width="${d.w}" height="${d.h}" rx="${d.radius}" fill="#fff" stroke="#000" stroke-width="${d.stroke}"/>`);
  s.text(cx, top + d.h / 2, d.text, fmt(t), true);
  s.box("zegar cyfrowy", cx - d.w / 2 - d.stroke / 2, top - d.stroke / 2, cx + d.w / 2 + d.stroke / 2, top + d.h + d.stroke / 2);
}

/** Odczytaj i Dorysuj: 2 kolumny × 3 rzędy; pod tarczą pora dnia (24 h) i pola albo zegar cyfrowy. */
function gridSheet(mode: "odczytaj" | "dorysuj", level: Level, h24: boolean, ts: Time[]): Sheet {
  const s = new Sheet();
  band(s, MODES[mode].instruction);
  const cols = 2;
  const rows = 3;
  const cellW = AREA.w / cols;
  const cellH = AREA.h / rows;
  const under = mode === "odczytaj" ? SHEET.answerBox.h : SHEET.digital.h;
  const below = SHEET.gapUnderDial + (h24 ? SHEET.partOfDay + 3 : 0) + under + 4;
  const d = Math.min(62, cellW - 14, cellH - below);
  const r = d / 2;
  s.notes.push(`tarcza ⌀ ${f(d)} mm, liczby ${f(r * SHEET.numberSize)} mm, komórka ${f(cellW)} × ${f(cellH)} mm`);
  ts.forEach((t, i) => {
    const cx = AREA.x + cellW * (i % cols) + cellW / 2;
    const top = AREA.y + cellH * Math.floor(i / cols);
    const cy = top + r + 1;
    dial(s, cx, cy, r, level, mode === "odczytaj" ? t : null);
    let y = cy + r + SHEET.gapUnderDial;
    if (h24) {
      s.text(cx, y + SHEET.partOfDay / 2, SHEET.partOfDay, partOfDay(t.h));
      y += SHEET.partOfDay + 3;
    }
    if (mode === "odczytaj") answerBoxes(s, cx, y);
    else digital(s, cx, y, t);
  });
  return s;
}

/** Połącz: 5 tarcz po lewej, 5 zegarów cyfrowych po prawej w innej kolejności, przy każdym kropka. */
function matchSheet(level: Level, h24: boolean, ts: Time[], order: number[]): Sheet {
  const s = new Sheet();
  band(s, MODES.polacz.instruction);
  const rows = ts.length;
  const rowH = AREA.h / rows;
  const d = Math.min(46, rowH - 4 - (h24 ? SHEET.partOfDay + 2 : 0));
  const r = d / 2;
  const dialX = AREA.x + 4 + r;
  const leftDot = dialX + r + 7;
  const digX = PAGE.w - PAGE.inset - 2 - SHEET.digital.w / 2;
  const rightDot = digX - SHEET.digital.w / 2 - 7;
  s.notes.push(`tarcza ⌀ ${f(d)} mm, liczby ${f(r * SHEET.numberSize)} mm, rząd ${f(rowH)} mm, odstęp kropek ${f(rightDot - leftDot)} mm`);
  ts.forEach((t, i) => {
    const top = AREA.y + rowH * i;
    const block = d + (h24 ? 2 + SHEET.partOfDay : 0);
    const cy = top + (rowH - block) / 2 + r;
    dial(s, dialX, cy, r, level, t);
    if (h24) s.text(dialX, cy + r + 2 + SHEET.partOfDay / 2, SHEET.partOfDay, partOfDay(t.h));
    s.add(`<circle cx="${f(leftDot)}" cy="${f(cy)}" r="${SHEET.dot}" fill="#000"/>`);
    const rowCy = top + rowH / 2;
    const u = ts[order[i]];
    digital(s, digX, rowCy - SHEET.digital.h / 2, u);
    s.add(`<circle cx="${f(rightDot)}" cy="${f(rowCy)}" r="${SHEET.dot}" fill="#000"/>`);
  });
  return s;
}

// ---------------------------------------------------------------- arkusze

type Spec = { file: string; title: string; mode: Mode; level: Level; h24: boolean; seed: number; must?: Time[] };
const L = (n: number): Level => LEVELS[n - 1];
const specs: Spec[] = [
  { file: "odczytaj-poziom-1", title: "Odczytaj · Poziom 1", mode: "odczytaj", level: L(1), h24: false, seed: 11 },
  { file: "dorysuj-poziom-1", title: "Dorysuj · Poziom 1", mode: "dorysuj", level: L(1), h24: false, seed: 12 },
  { file: "polacz-poziom-1", title: "Połącz · Poziom 1", mode: "polacz", level: L(1), h24: false, seed: 13 },
  { file: "odczytaj-poziom-4", title: "Odczytaj · Poziom 4", mode: "odczytaj", level: L(4), h24: false, seed: 41, must: [{ h: 2, m: 50 }] },
  { file: "dorysuj-poziom-4", title: "Dorysuj · Poziom 4", mode: "dorysuj", level: L(4), h24: false, seed: 42 },
  { file: "polacz-poziom-4", title: "Połącz · Poziom 4", mode: "polacz", level: L(4), h24: false, seed: 43 },
  { file: "odczytaj-poziom-2-24h", title: "Odczytaj · Poziom 2 · 24 h", mode: "odczytaj", level: L(2), h24: true, seed: 21, must: [{ h: 19, m: 30 }] },
  { file: "dorysuj-poziom-2-24h", title: "Dorysuj · Poziom 2 · 24 h", mode: "dorysuj", level: L(2), h24: true, seed: 22, must: [{ h: 7, m: 30 }] },
  { file: "polacz-poziom-2-24h", title: "Połącz · Poziom 2 · 24 h", mode: "polacz", level: L(2), h24: true, seed: 23 },
];

// Kąt wskazówki godzinowej o 7:30: dokładnie w połowie między 7 (210°) a 8 (240°).
if (hourAngle({ h: 7, m: 30 }) !== 225) throw new Error("7:30: wskazówka godzinowa nie jest między 7 a 8");
if (hourAngle({ h: 19, m: 30 }) !== 225) throw new Error("19:30 ma tę samą tarczę co 7:30");
if (hourAngle({ h: 2, m: 50 }) !== 85) throw new Error("2:50: wskazówka godzinowa ma stać tuż przed 3");

const blocks: string[] = [];
for (const sp of specs) {
  const r = rng(2026 + sp.seed);
  const ts = times(sp.level, MODES[sp.mode].dials, sp.h24, r, sp.must);
  // reguły karty
  const keys = new Set(ts.map((t) => sameKey(t, sp.h24)));
  if (keys.size !== ts.length) throw new Error(`${sp.file}: godziny się powtarzają`);
  for (const t of ts) {
    if (!(sp.level.minutes as readonly number[]).includes(t.m)) throw new Error(`${sp.file}: ${fmt(t)} spoza poziomu`);
    if (sp.h24 && t.h === 0) throw new Error(`${sp.file}: ${fmt(t)} po północy`);
    if (sp.h24 && BORDER_HOURS.has(t.h)) throw new Error(`${sp.file}: ${fmt(t)} w godzinie granicznej pory`);
    if (!sp.h24 && (t.h < 1 || t.h > 12)) throw new Error(`${sp.file}: ${fmt(t)} poza 1:00–12:59`);
  }
  let s: Sheet;
  let order: number[] = [];
  if (sp.mode === "polacz") {
    order = derangement(ts.length, r);
    if (order.some((v, i) => v === i)) throw new Error(`${sp.file}: zegar cyfrowy na wysokości swojej tarczy`);
    s = matchSheet(sp.level, sp.h24, ts, order);
  } else s = gridSheet(sp.mode, sp.level, sp.h24, ts);
  s.checkMargin(sp.file);
  const svg = s.svg();
  writeFileSync(`${OUT}/mockup-${sp.file}.svg`, svg);
  const answers =
    sp.mode === "polacz"
      ? ts.map((t, i) => `${fmt(t)}${sp.h24 ? ` (${partOfDay(t.h)})` : ""} → ${order.indexOf(i) + 1}.`).join(", ")
      : ts.map((t) => `${fmt(t)}${sp.h24 ? ` (${partOfDay(t.h)})` : ""}`).join(", ");
  const info = `${s.notes.join("; ")}<br>odpowiedzi: ${answers}`;
  console.log(sp.file, "|", s.notes.join("; "), "|", answers);
  blocks.push(`<figure><figcaption><b>${sp.title}</b> (${sp.level.label})<br><small>${info}</small></figcaption>${svg.replace(/width="210mm" height="297mm"/, "")}</figure>`);
}

// Szczegóły: duże tarcze, żeby ocenić wskazówki (7:30 między 7 a 8, 2:50 tuż przed 3) i kreski minut.
{
  const s = new Sheet();
  s.text(105, 18, 6, "Szczegóły tarczy (skala 1:1 jak na karcie Odczytaj)", true);
  const r = 29;
  const detail: [number, number, Level, Time, string][] = [
    [55, 70, L(2), { h: 7, m: 30 }, "7:30 — godzinowa w połowie między 7 a 8"],
    [155, 70, L(4), { h: 2, m: 50 }, "2:50 — godzinowa tuż przed 3, kreski minut"],
    [55, 170, L(3), { h: 9, m: 45 }, "9:45 — godzinowa blisko 10"],
    [155, 170, L(5), { h: 11, m: 7 }, "11:07 — co minutę (Poziom 5)"],
  ];
  for (const [cx, cy, lv, t, label] of detail) {
    dial(s, cx, cy, r, lv, t);
    s.text(cx, cy + r + 7, 3.4, label);
  }
  s.text(55, 245, 3.6, "pola „__ : __” (18 × 13 mm)");
  answerBoxes(s, 55, 252);
  s.text(155, 245, 3.6, "zegar cyfrowy (42 × 15 mm, cyfry 10 mm)");
  digital(s, 155, 252, { h: 19, m: 30 });
  s.checkMargin("szczegoly");
  const svg = s.svg();
  writeFileSync(`${OUT}/mockup-szczegoly.svg`, svg);
  blocks.push(`<figure><figcaption><b>Szczegóły tarczy</b><br><small>${s.notes.join("; ")}</small></figcaption>${svg.replace(/width="210mm" height="297mm"/, "")}</figure>`);
}

writeFileSync(
  `${OUT}/mockups.html`,
  `<!doctype html><meta charset="utf-8"><title>Zegar – makiety (S-41)</title>
<style>body{font-family:Arial;margin:16px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}figure{margin:0;border:1px solid #ccc;padding:8px}svg{width:100%;height:auto;border:1px solid #eee}figcaption{font-size:14px;margin-bottom:6px;min-height:5.5em}</style>
<h1>Karta „Zegar” – makiety (A4, drukuj w 100%)</h1>
<p>Rzędy: Poziom 1 · Poziom 4 (kreski minut) · Poziom 2 z „24 h” (pora dnia słowami pod tarczą). Postać: Kot. Ostatni arkusz: szczegóły wskazówek.</p>
<div class="g">${blocks.join("")}</div>`,
);
