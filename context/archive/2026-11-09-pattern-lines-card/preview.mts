// Podgląd karty „Szlaczki” (S-36, faza 2): rysuje karty z prawdziwych modułów produktu (poziomy, generator, układ, geometria
// wierszy, stałe druku), po jednej na poziom, a na Poziomach 3 i 4 także z wyłączonymi liniami. Pisze preview-*.svg w skali 1:1
// (A4, 210 × 297 mm) i previews.html. Służy do zatwierdzenia kształtu kółeczek (o a) i laseczek (i) oraz jako pierwszy wydruk
// linii przed stroną. Nie jest kodem produktu; importuje tylko src/lib/pattern-lines/* i nie ma własnych stałych rysunku.
// Szarości w podglądzie to zwykłe kolory (strona używa tokenów). Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/pattern-lines-card/preview.mts
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generatePatternLinesCard } from "../../../src/lib/pattern-lines/generate.ts";
import { layoutPatternLinesSheet } from "../../../src/lib/pattern-lines/layout.ts";
import {
  PATTERN_LINES_LEVELS,
  patternLinesHasGuides,
  type PatternLinesLevel,
} from "../../../src/lib/pattern-lines/levels.ts";
import { rowGeometry } from "../../../src/lib/pattern-lines/paths.ts";
import { PATTERN_LINES_SHEET } from "../../../src/lib/pattern-lines/sheet.ts";

const OUT = dirname(fileURLToPath(import.meta.url));
const SHEET = PATTERN_LINES_SHEET;
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const TONE = { muted: "#777", pale: "#bbb" } as const;

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number): string => n.toFixed(2);
const pathD = (points: { x: number; y: number }[]): string =>
  points.map((p, k) => `${k ? "L" : "M"}${f(p.x)} ${f(p.y)}`).join(" ");

function card(level: PatternLinesLevel, seed: number, lines: boolean): string {
  const generated = generatePatternLinesCard(mulberry32(seed), null, level);
  if (generated === null) {
    throw new Error(`no card for ${level.id} and seed ${seed}`);
  }
  const layout = layoutPatternLinesSheet(level, SHEET.plainInstructionSize);
  const out: string[] = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">`);
  out.push(`<rect width="210" height="297" fill="#fff"/>`);
  out.push(
    `<text x="105" y="${f(SHEET.inset + SHEET.plainInstructionSize * 0.8)}" text-anchor="middle" ${FONT} font-size="${SHEET.plainInstructionSize}" fill="#000">${level.instruction}</text>`,
  );
  generated.rows.forEach((row, i) => {
    const geometry = rowGeometry(row, level, lines);
    out.push(`<g transform="translate(${f(layout.left)} ${f(layout.centers[i])})">`);
    for (const guide of geometry.guides) {
      const dash = guide.dash === null ? "" : ` stroke-dasharray="${guide.dash}"`;
      out.push(
        `<line x1="${f(guide.x1)}" y1="${f(guide.y)}" x2="${f(guide.x2)}" y2="${f(guide.y)}" stroke="${TONE[guide.tone]}" stroke-width="${guide.stroke}"${dash}/>`,
      );
    }
    if (geometry.track) {
      out.push(
        `<path d="${pathD(geometry.path)}" fill="none" stroke="${TONE.pale}" stroke-width="${SHEET.trackStroke}" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    }
    if (geometry.lineStroke !== null) {
      out.push(
        `<path d="${pathD(geometry.path)}" fill="none" stroke="#000" stroke-width="${geometry.lineStroke}" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    }
    for (const dot of geometry.dots) {
      out.push(`<circle cx="${f(dot.x)}" cy="${f(dot.y)}" r="${geometry.dotRadius}" fill="#000"/>`);
    }
    if (geometry.startRing !== null) {
      const ring = geometry.startRing;
      out.push(
        `<circle cx="${f(ring.x)}" cy="${f(ring.y)}" r="${f(ring.radius)}" fill="none" stroke="#000" stroke-width="${SHEET.startRingStroke}"/>`,
      );
    }
    out.push(`</g>`);
  });
  out.push(
    `<text x="200" y="293" text-anchor="end" ${FONT} font-size="2.4" fill="#999">podgląd S-36 · ${level.label} · ziarno ${seed}${lines ? "" : " · linie wyłączone"} · ${generated.rows.map((r) => r.patternId).join(", ")}</text>`,
  );
  out.push(`</svg>`);
  return out.join("\n");
}

const pages: { label: string; svg: string }[] = [];
for (const level of PATTERN_LINES_LEVELS) {
  for (const lines of patternLinesHasGuides(level.id) ? [true, false] : [true]) {
    const svg = card(level, 11, lines);
    const file = `preview-${level.id}${lines ? "" : "-bez-linii"}.svg`;
    writeFileSync(`${OUT}/${file}`, svg);
    pages.push({ label: `${level.label}${lines ? "" : " · linie wyłączone"}`, svg });
  }
}
writeFileSync(
  `${OUT}/previews.html`,
  `<!doctype html><meta charset="utf-8"><title>Podgląd S-36</title><style>body{font-family:sans-serif;margin:8px;background:#eee}div{display:inline-block;margin:6px;vertical-align:top;text-align:center;width:380px;font-size:12px}svg{width:380px;height:auto;box-shadow:0 1px 4px #0003}</style>` +
    pages.map((p) => `<div>${p.label}<br>${p.svg}</div>`).join("\n"),
);
console.log("zapisano", pages.length, "kart podglądu");
